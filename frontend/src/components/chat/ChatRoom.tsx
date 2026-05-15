import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { MessageSquare, Send } from 'lucide-react';
import type { ChatMessage } from '../../types';

interface ChatRoomProps {
  gameId: string;
  gameTitle: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ gameId, gameTitle }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', user.id);
      socket.emit('join_room', `game-${gameId}`);
    });

    socket.on('new_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !socketRef.current || !user) return;

    socketRef.current.emit('send_message', {
      roomId: `game-${gameId}`,
      userId: user.id,
      username: user.username,
      text: inputText
    });
    setInputText('');
  };

  if (!user) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[500px] shadow-2xl">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <MessageSquare className="text-indigo-400" size={20} />
          Sala de {gameTitle}
        </h3>
        <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
          En vivo
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">No hay mensajes todavía. ¡Sé el primero en hablar!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.username === user.username ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
              msg.username === user.username 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none'
            }`}>
              {msg.username !== user.username && (
                <div className="text-[10px] font-bold text-indigo-400 mb-1">@{msg.username}</div>
              )}
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Escribe un mensaje en la sala..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          onClick={handleSendMessage}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
