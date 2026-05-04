import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { Send, Users, Wifi, WifiOff } from 'lucide-react';
import { fetchCommunityMessages } from '../../api/communityService';
import type { ChatMessage } from '../../types';

interface CommunityChatProps {
  gameId: string;
  gameTitle: string;
  onUsersUpdate?: (count: number) => void;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ gameId, gameTitle, onUsersUpdate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState<{ userId: string; username: string }[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Cargar historial inicial vía REST
  useEffect(() => {
    if (!user || !gameId) return;

    const loadHistory = async () => {
      const history = await fetchCommunityMessages(gameId);
      // Mapeamos del formato backend (id, content, createdAt, username) 
      // al formato frontend ChatMessage (id, text, timestamp, username)
      const mappedMessages: ChatMessage[] = history.map((msg: any) => ({
        id: msg.id,
        text: msg.content,
        timestamp: msg.createdAt,
        username: msg.username,
        userId: String(msg.userId || '')
      }));
      setMessages(mappedMessages);
    };

    loadHistory();
  }, [gameId, user]);

  // 2. Manejo de Socket.io
  useEffect(() => {
    if (!user) return;

    const chatUrl = `http://${window.location.hostname}:3001`;
    const socket = io(chatUrl, { autoConnect: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (user?.username) {
        setConnected(true);
        socket.emit('register', { userId: user.id, username: user.username });
        socket.emit('join_room', `game-${gameId}`);
      }
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('room_users_update', (data: { count: number; users: { userId: string; username: string }[] }) => {
      setRoomUsers(data.users);
      if (onUsersUpdate) onUsersUpdate(data.count);
    });

    // También escuchamos el historial por socket por si el backend lo emite automáticamente
    socket.on('message_history', (history: ChatMessage[]) => {
      if (history && history.length > 0) {
        setMessages(history);
      }
    });

    return () => {
      socket.emit('leave_room', `game-${gameId}`);
      socket.disconnect();
    };
  }, [gameId, user, onUsersUpdate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !socketRef.current || !user) return;
    socketRef.current.emit('send_message', {
      roomId: `game-${gameId}`,
      userId: user.id,
      username: user.username,
      text: inputText.trim(),
    });
    setInputText('');
    inputRef.current?.focus();
  }, [inputText, gameId, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="community-chat-container">
      <div className="community-chat">
        {/* Chat header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className={`chat-status-dot ${connected ? 'online' : 'offline'}`} />
            <span className="chat-header-title">Sala de {gameTitle}</span>
            {connected ? (
              <Wifi size={14} className="text-emerald-400" />
            ) : (
              <WifiOff size={14} className="text-slate-500" />
            )}
          </div>
          <div className="chat-users-badge">
            <Users size={12} />
            <span>{roomUsers.length} en sala</span>
          </div>
        </div>

        {/* Messages or Login Prompt */}
        {!user ? (
          <div className="chat-login-prompt h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/50">
            <div className="bg-indigo-600/10 p-4 rounded-full mb-4">
              <Users size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Comunidad de {gameTitle}</h3>
            <p className="text-slate-400 mb-6">Inicia sesión para leer y participar en la conversación en tiempo real.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              Iniciar sesión
            </button>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <div className="chat-empty-icon">💬</div>
                  <p>Nadie ha hablado todavía. ¡Rompe el hielo!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.username === user?.username;
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const isSameUserAsPrev = prevMsg?.username === msg.username;

                  return (
                    <div 
                      key={msg.id || index} 
                      className={`chat-message-row ${isOwn ? 'own' : 'other'} ${isSameUserAsPrev ? 'consecutive' : ''}`}
                    >
                      {!isOwn && !isSameUserAsPrev && (
                        <div className="chat-avatar">
                          {msg.username[0].toUpperCase()}
                        </div>
                      )}
                      {(!isOwn && isSameUserAsPrev) && <div className="chat-avatar-placeholder" />}

                      <div className={`chat-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
                        {(!isSameUserAsPrev || isOwn) && (
                          <div className="chat-bubble-header">
                            {!isOwn && !isSameUserAsPrev && (
                              <span className="chat-bubble-username">@{msg.username}</span>
                            )}
                            {isOwn && !isSameUserAsPrev && <span className="chat-bubble-username">Tú</span>}
                            <span className="chat-bubble-time">{formatTime(msg.timestamp)}</span>
                          </div>
                        )}
                        <p className="chat-bubble-text">{msg.text}</p>
                        {isSameUserAsPrev && !isOwn && (
                           <span className="chat-bubble-time-mini">{formatTime(msg.timestamp)}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="chat-input-area">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={connected ? `Habla con la comunidad de ${gameTitle}...` : 'Conectando...'}
                disabled={!connected}
                className="chat-input"
                maxLength={500}
              />
              <button
                onClick={handleSend}
                disabled={!connected || !inputText.trim()}
                className="chat-send-btn"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Users list sidebar - Always visible */}
      <div className="chat-users-sidebar">
        <div className="users-sidebar-header">
          <Users size={14} />
          <span>Personas ({roomUsers.length})</span>
        </div>
        <div className="users-list">
          {roomUsers.map((u) => (
            <div key={u.userId || u.username} className="user-item">
              <div className="user-avatar-sm">
                {u.username[0].toUpperCase()}
              </div>
              <span className="user-name">@{u.username}</span>
              {user && u.username === user.username && <span className="user-you">(tú)</span>}
            </div>
          ))}
          {roomUsers.length === 0 && (
            <p className="users-empty">Nadie conectado...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;

