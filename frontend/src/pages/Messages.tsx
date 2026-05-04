import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchConversations, fetchDirectMessages, sendDirectMessage, fetchFriends } from '../api/socialService';
import { useAuth } from '../hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Send, Loader2, Search, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { username: urlUsername } = useParams<{ username?: string }>();
  const queryClient = useQueryClient();
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: number; username: string } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: isConversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    enabled: !!user,
  });

  const { data: friends, isLoading: isFriendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriends,
    enabled: !!user,
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['direct-messages', selectedRecipient?.username],
    queryFn: () => fetchDirectMessages(selectedRecipient!.username),
    enabled: !!selectedRecipient,
  });

  useEffect(() => {
    if (history) {
      setLocalMessages(history);
    }
  }, [history]);

  // Handle URL parameter auto-selection
  useEffect(() => {
    if (urlUsername && friends && !selectedRecipient) {
      const friend = friends.find(f => f.username === urlUsername);
      if (friend) {
        setSelectedRecipient(friend);
      } else if (conversations) {
        const conv = conversations.find(c => c.username === urlUsername);
        if (conv) {
          setSelectedRecipient(conv);
        }
      }
    }
  }, [urlUsername, friends, conversations, selectedRecipient]);

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', { userId: user.id, username: user.username });
    });

    socket.on('new_private_message', (msg: any) => {
      // If the message is from or to the currently selected recipient, update local messages
      if (selectedRecipient && (msg.senderUsername === selectedRecipient.username || msg.receiverUsername === selectedRecipient.username)) {
        setLocalMessages(prev => [...prev, msg]);
      }
      // Refresh conversations list to show latest
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, selectedRecipient, queryClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendDirectMessage(selectedRecipient!.id, content),
    onSuccess: (_, content) => {
      const newMsg = {
        id: Date.now(),
        senderUsername: user!.username,
        receiverUsername: selectedRecipient!.username,
        content: content,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, newMsg]);
      setMessageText('');
      
      // Also emit via socket for real-time to the other user
      if (socketRef.current) {
        socketRef.current.emit('send_private_message', {
          receiverId: selectedRecipient!.id,
          text: content
        });
      }
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRecipient) return;
    sendMutation.mutate(messageText);
  };

  if (!user) return <div className="text-center py-20">Por favor, inicia sesión para ver tus mensajes.</div>;

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-slate-900/50">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="text-indigo-400" />
            Mensajes
          </h2>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar chat..." 
              className="w-full bg-slate-950 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Active Conversations */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 mb-2">Conversaciones</p>
            <div className="space-y-1">
              {isConversationsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                </div>
              ) : conversations && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedRecipient(conv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedRecipient?.id === conv.id 
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-white' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-sm border border-white/5">
                      {conv.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="font-bold truncate">@{conv.username}</p>
                      <p className="text-xs text-slate-500 truncate">Historial disponible</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-[10px] text-slate-600 px-3 italic">Sin conversaciones recientes</p>
              )}
            </div>
          </div>

          {/* Friends List */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 mb-2 flex items-center gap-1.5">
              <Users size={12} /> Amigos
            </p>
            <div className="space-y-1">
              {isFriendsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                </div>
              ) : friends && friends.length > 0 ? (
                friends
                  .filter(f => !conversations?.some(c => c.id === f.id))
                  .map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedRecipient(friend)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedRecipient?.id === friend.id 
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-white' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 bg-indigo-600/10 text-indigo-400 rounded-full flex items-center justify-center font-bold text-sm border border-indigo-500/20">
                      {friend.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="font-bold truncate">@{friend.username}</p>
                      <p className="text-xs text-slate-500 truncate">Nuevo chat</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3">
                  <p className="text-[10px] text-slate-600 italic mb-2">No tienes amigos todavía</p>
                  <Link to="/" className="text-[10px] text-indigo-400 hover:underline">Explorar comunidad</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/20">
        {selectedRecipient ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                  {selectedRecipient.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold">@{selectedRecipient.username}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">En línea</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {isHistoryLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : (
                localMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderUsername === user.username ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] space-y-1 ${msg.senderUsername === user.username ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-lg ${
                        msg.senderUsername === user.username
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-slate-600 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Input */}
            <form onSubmit={handleSend} className="p-4 bg-slate-900/30 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendMutation.isPending}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <MessageSquare className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Selecciona un chat</h3>
            <p className="text-slate-500 max-w-xs">Elige a alguien de la lista de la izquierda para empezar a chatear o ver tu historial de mensajes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
