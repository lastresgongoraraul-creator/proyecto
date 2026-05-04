require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'chat-service' });
});

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3001;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';

// ─────────────────────────────────────────────
// DATABASE SETUP
// ─────────────────────────────────────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('[Database] Unexpected error on idle client', err);
});

async function testDbConnection() {
    try {
        const client = await pool.connect();
        console.log('[Database] Connected successfully to PostgreSQL');
        client.release();
    } catch (err) {
        console.error('[Database] Connection error:', err.message);
    }
}
testDbConnection();

// ─────────────────────────────────────────────
// ASYNC MODERATION QUEUE
// ─────────────────────────────────────────────
const moderationQueue = [];
let moderationWorkerRunning = false;

async function runModerationWorker() {
    if (moderationWorkerRunning) return;
    moderationWorkerRunning = true;

    while (moderationQueue.length > 0) {
        const task = moderationQueue.shift();
        try {
            const res = await axios.post(
                `${AI_SERVICE_URL}/social/moderation/check`,
                { text: task.text },
                { timeout: 3000 }
            );
            if (res.data.is_offensive) {
                io.to(task.roomId).emit('message_censored', {
                    id: task.id,
                    censoredText: res.data.censored_text
                });
            }
        } catch (err) {
            console.warn('[Moderation] Worker error:', err.message);
        }
    }
    moderationWorkerRunning = false;
}

function enqueueModerationTask(task) {
    moderationQueue.push(task);
    setImmediate(runModerationWorker);
}

// ─────────────────────────────────────────────
// TRENDING TOPICS
// ─────────────────────────────────────────────
const TRENDING_WINDOW = 200;
const TRENDING_TOP_N = 8;
const STOP_WORDS = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'que', 'es', 'se', 'no', 'con', 'por', 'del', 'al', 'para']);

const roomMessages = new Map();

function addMessageToTrending(roomId, text) {
    if (!roomMessages.has(roomId)) roomMessages.set(roomId, []);
    const msgs = roomMessages.get(roomId);
    msgs.push(text);
    if (msgs.length > TRENDING_WINDOW) msgs.shift();
}

function computeTrendingTopics(roomId) {
    const msgs = roomMessages.get(roomId) || [];
    if (msgs.length === 0) return [];
    const freq = new Map();
    for (const msg of msgs) {
        const words = msg.toLowerCase().replace(/[^a-záéíóúüñ\s]/gi, ' ').split(/\s+/).filter(w => w.length >= 3 && !STOP_WORDS.has(w));
        for (const word of words) freq.set(word, (freq.get(word) || 0) + 1);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, TRENDING_TOP_N).map(([word, count]) => ({ word, count }));
}

const nlpTrendingCache = new Map();

async function refreshTrendingFromAI(roomId) {
    const msgs = roomMessages.get(roomId) || [];
    if (msgs.length < 5) return;
    try {
        const res = await axios.post(`${AI_SERVICE_URL}/social/trending`, { messages: msgs.slice(-TRENDING_WINDOW), top_n: TRENDING_TOP_N }, { timeout: 5000 });
        const topics = res.data.topics.map(t => ({ word: t.term, count: t.count, score: t.score }));
        nlpTrendingCache.set(roomId, { topics, updatedAt: Date.now() });
        io.to(roomId).emit('trending_topics', { roomId, topics, source: 'tfidf' });
    } catch (err) {
        console.warn('[Trending] AI-service error:', err.message);
    }
}

function getTrendingTopics(roomId) {
    const cached = nlpTrendingCache.get(roomId);
    if (cached && (Date.now() - cached.updatedAt) < 5 * 60 * 1000) return cached.topics;
    return computeTrendingTopics(roomId);
}

// ─────────────────────────────────────────────
// ACTIVE USERS & ROOMS
// ─────────────────────────────────────────────
const activeUsers = new Map(); // userId -> socketId
const userRooms = new Map(); // socketId -> Set<roomId>
const socketUsernames = new Map(); // socketId -> username

function getRoomUsers(roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return { count: 0, users: [] };
    const users = [];
    for (const socketId of room) {
        const username = socketUsernames.get(socketId) || 'Usuario';
        let foundUserId = null;
        for (const [uid, sid] of activeUsers.entries()) {
            if (sid === socketId) { foundUserId = uid; break; }
        }
        users.push({ userId: foundUserId, username });
    }
    return { count: room.size, users };
}

app.get('/trending/:roomId', (req, res) => {
    const { roomId } = req.params;
    const roomData = getRoomUsers(roomId);
    res.json({
        roomId,
        activeUsers: roomData.count,
        users: roomData.users,
        trendingTopics: getTrendingTopics(roomId)
    });
});

app.get('/rooms', (req, res) => {
    const rooms = [];
    for (const [roomId] of roomMessages.entries()) {
        rooms.push({ roomId, activeUsers: getRoomUsers(roomId).count });
    }
    res.json(rooms);
});

io.on('connection', (socket) => {
    socket.on('register', (data) => {
        let userId, username;
        if (data && typeof data === 'object') {
            userId = data.userId || data.username;
            username = data.username || 'Usuario';
        } else {
            userId = data;
            username = 'Usuario';
        }

        if (!userId) {
            console.warn('[Socket] Register received invalid data:', data);
            return;
        }

        activeUsers.set(String(userId), socket.id);
        socketUsernames.set(socket.id, username);
        if (!userRooms.has(socket.id)) userRooms.set(socket.id, new Set());
        console.log(`[Socket] User ${userId} (${username}) registered`);
    });

    socket.on('join_room', async (roomId) => {
        socket.join(roomId);
        if (!userRooms.has(socket.id)) userRooms.set(socket.id, new Set());
        userRooms.get(socket.id).add(roomId);
        
        // ─────────────────────────────────────────────
        // LOAD CHAT HISTORY (Last 50 messages)
        // ─────────────────────────────────────────────
        try {
            const historyResult = await pool.query(`
                SELECT cm.id, cm.user_id as "userId", u.username, cm.content as text, 
                       cm.created_at as timestamp, cm.game_id as "roomId"
                FROM chat_messages cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.game_id = $1
                ORDER BY cm.created_at DESC
                LIMIT 50
            `, [roomId]);
            
            // Reverse history to show chronological order
            const history = historyResult.rows.reverse();
            socket.emit('chat_history', { roomId, messages: history });
        } catch (err) {
            console.error('[Database] History fetch error:', err.message);
        }

        socket.emit('trending_topics', { roomId, topics: getTrendingTopics(roomId) });
        const roomData = getRoomUsers(roomId);
        io.to(roomId).emit('room_users_update', { roomId, count: roomData.count, users: roomData.users });
    });

    // ─────────────────────────────────────────────
    // PRIVATE CHANNELS (DMs)
    // ─────────────────────────────────────────────
    socket.on('join_dm', async ({ senderId, receiverId }) => {
        // Generate unique room ID: dm_minId_maxId
        const ids = [senderId, receiverId].sort((a, b) => a - b);
        const dmRoomId = `dm_${ids[0]}_${ids[1]}`;

        // Security check: only participants can join
        let currentUserId = null;
        for (const [uid, sid] of activeUsers.entries()) {
            if (sid === socket.id) { currentUserId = uid; break; }
        }

        // Compare loosely as strings/numbers
        if (currentUserId != senderId && currentUserId != receiverId) {
            console.warn(`[Security] Unauthorized DM join attempt by ${currentUserId} for room ${dmRoomId}`);
            socket.emit('error', { message: 'Unauthorized access to DM channel' });
            return;
        }

        socket.join(dmRoomId);
        console.log(`[Socket] User ${currentUserId} joined DM room ${dmRoomId}`);

        // LOAD DM HISTORY (Last 50 messages)
        try {
            const historyResult = await pool.query(`
                SELECT dm.id, dm.sender_id as "senderId", dm.receiver_id as "receiverId", 
                       dm.content as text, dm.created_at as timestamp,
                       u.username as "senderUsername"
                FROM direct_messages dm
                JOIN users u ON dm.sender_id = u.id
                WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
                   OR (dm.sender_id = $2 AND dm.receiver_id = $1)
                ORDER BY dm.created_at DESC
                LIMIT 50
            `, [senderId, receiverId]);
            
            const history = historyResult.rows.reverse();
            socket.emit('dm_history', { dmRoomId, messages: history });
        } catch (err) {
            console.error('[Database] DM History fetch error:', err.message);
        }
    });

    socket.on('send_direct_message', async ({ senderId, receiverId, text }) => {
        const ids = [senderId, receiverId].sort((a, b) => a - b);
        const dmRoomId = `dm_${ids[0]}_${ids[1]}`;

        // Security check
        let currentUserId = null;
        for (const [uid, sid] of activeUsers.entries()) {
            if (sid === socket.id) { currentUserId = uid; break; }
        }
        
        if (currentUserId != senderId) {
            console.warn(`[Security] User ${currentUserId} tried to send DM as ${senderId}`);
            socket.emit('error', { message: 'Unauthorized sender ID' });
            return;
        }

        const msgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const message = { 
            id: msgId, 
            senderId, 
            receiverId, 
            text, 
            timestamp: new Date().toISOString(), 
            dmRoomId 
        };

        // Broadcast to both participants in the private room
        io.to(dmRoomId).emit('new_direct_message', message);

        // ─────────────────────────────────────────────
        // DM PERSISTENCE
        // ─────────────────────────────────────────────
        try {
            pool.query(
                'INSERT INTO direct_messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)',
                [senderId, receiverId, text]
            ).catch(err => console.error('[Database] DM save error:', err.message));
        } catch (err) {
            console.error('[Database] DM Persistence block error:', err.message);
        }

        // We can also run moderation on DMs if required, but usually DMs are private
        // Enqueue moderation task if text exists (optional, let's keep it for safety)
        // enqueueModerationTask({ id: msgId, text, roomId: dmRoomId });
    });

    socket.on('send_message', async ({ roomId, userId, username, text }) => {
        const msgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const message = { id: msgId, userId, username, text, timestamp: new Date().toISOString(), roomId };
        
        // Broadcast immediately for low latency
        io.to(roomId).emit('new_message', message);
        
        // ─────────────────────────────────────────────
        // ASYNC PERSISTENCE
        // ─────────────────────────────────────────────
        try {
            // We use pool.query directly without waiting to not block the socket event
            pool.query(
                'INSERT INTO chat_messages (user_id, game_id, content) VALUES ($1, $2, $3)',
                [userId, roomId, text]
            ).catch(err => console.error('[Database] Message save error:', err.message));
        } catch (err) {
            console.error('[Database] Persistence block error:', err.message);
        }

        addMessageToTrending(roomId, text);
        enqueueModerationTask({ id: msgId, text, roomId });
    });

    socket.on('send_private_message', ({ receiverId, text }) => {
        const msgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const senderUsername = socketUsernames.get(socket.id);
        
        const message = {
            id: msgId,
            senderUsername,
            receiverUsername: null, // We could look it up but the client has the state
            content: text,
            createdAt: new Date().toISOString()
        };

        const receiverSocketId = activeUsers.get(String(receiverId));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('new_private_message', message);
        }
    });

    socket.on('disconnect', () => {
        const username = socketUsernames.get(socket.id);
        socketUsernames.delete(socket.id);
        for (const [userId, sid] of activeUsers.entries()) {
            if (sid === socket.id) { activeUsers.delete(userId); break; }
        }
        const rooms = userRooms.get(socket.id) || new Set();
        for (const roomId of rooms) {
            const roomData = getRoomUsers(roomId);
            io.to(roomId).emit('room_users_update', { roomId, count: roomData.count, users: roomData.users });
        }
        userRooms.delete(socket.id);
    });
});

server.listen(PORT, () => console.log(`[Chat-Service] Running on port ${PORT}`));
