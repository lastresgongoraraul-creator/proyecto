import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { MessageSquare, X, Send } from 'lucide-react';
import type { ChatMessage } from '../../types';

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'global' | 'private'>('global');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', user.id);
      socket.emit('join_room', 'global');
    });

    socket.on('new_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('new_private_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !socketRef.current || !user) return;

    if (activeTab === 'global') {
      socketRef.current.emit('send_message', {
        roomId: 'global',
        userId: user.id,
        username: user.username,
        text: inputText
      });
    }
    // Private message logic would need a recipient ID selection
    setInputText('');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-slate-900 border border-slate-700 w-80 h-96 rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-400" />
              Community Chat
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-800/50 p-1">
            <button 
              onClick={() => setActiveTab('global')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'global' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Global
            </button>
            <button 
              onClick={() => setActiveTab('private')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'private' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              Direct
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.filter(m => activeTab === 'global' ? !m.isPrivate : m.isPrivate).map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.username === user.username ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.username === user.username 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.username !== user.username && (
                    <div className="text-[10px] font-bold text-indigo-400 mb-1">{msg.username}</div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700 bg-slate-800/50 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button 
              onClick={handleSendMessage}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all relative"
      >
        <MessageSquare size={24} />
        {/* Badge example */}
        <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-slate-900"></span>
      </button>
    </div>
  );
};

export default ChatWidget;
