import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPendingFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../api/socialService';
import { useAuth } from '../hooks/useAuth';
import { Heart, UserPlus, Check, Bell, Activity, Loader2 } from 'lucide-react';

const MyActivity: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'likes' | 'follows' | 'requests'>('all');

  const { data: pendingRequests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['pending-friend-requests'],
    queryFn: fetchPendingFriendRequests,
    enabled: !!user,
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: number) => acceptFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-friend-requests'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: number) => rejectFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-friend-requests'] });
    },
  });

  if (!user) return <div className="text-center py-20">Por favor, inicia sesión para ver tu actividad.</div>;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'likes') return notif.type === 'LIKE';
    if (activeTab === 'follows') return notif.type === 'FOLLOW' || (!notif.type && notif.message.includes('seguir'));
    if (activeTab === 'requests') return notif.type === 'FRIEND_REQUEST' || notif.type === 'FRIEND_ACCEPT';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-indigo-400" />
          Mi Actividad
        </h2>
        <p className="text-sm text-slate-400 mt-1">Aquí puedes ver todo lo que pasa con tu cuenta.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-slate-900/50">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-4 text-sm font-medium transition-all ${
            activeTab === 'all'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-4 text-sm font-medium transition-all ${
            activeTab === 'likes'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          Likes
        </button>
        <button
          onClick={() => setActiveTab('follows')}
          className={`flex-1 py-4 text-sm font-medium transition-all ${
            activeTab === 'follows'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          Seguidores
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-4 text-sm font-medium transition-all ${
            activeTab === 'requests'
              ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          Solicitudes
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'requests' && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Solicitudes Pendientes</h3>
            {isRequestsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
            ) : pendingRequests && pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.map((req: any) => (
                  <div key={req.id} className="p-4 bg-slate-800/50 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold overflow-hidden">
                        {req.senderAvatarUrl ? (
                          <img src={req.senderAvatarUrl} alt={req.senderUsername} className="w-full h-full object-cover" />
                        ) : (
                          req.senderUsername[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold">@{req.senderUsername}</p>
                        <p className="text-xs text-slate-500">Te envió una solicitud de amistad</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptMutation.mutate(req.id)}
                        disabled={acceptMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aceptar'}
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(req.id)}
                        disabled={rejectMutation.isPending}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                      >
                        {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No tienes solicitudes pendientes.</p>
            )}
            <div className="border-b border-white/5 my-6"></div>
          </div>
        )}

        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Historial de Actividad</h3>
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 bg-slate-800/30 border border-white/5 rounded-xl flex items-center gap-4 hover:bg-slate-800/50 cursor-pointer transition-colors ${!notif.read ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}
              >
                <div className={`p-2 rounded-full ${
                  notif.type === 'LIKE' ? 'bg-pink-500/20 text-pink-500' :
                  notif.type === 'FRIEND_REQUEST' ? 'bg-indigo-500/20 text-indigo-500' :
                  notif.type === 'FRIEND_ACCEPT' ? 'bg-emerald-500/20 text-emerald-500' :
                  'bg-slate-500/20 text-slate-500'
                }`}>
                  {notif.type === 'LIKE' ? <Heart size={18} fill="currentColor" /> :
                   notif.type === 'FRIEND_REQUEST' ? <UserPlus size={18} /> :
                   notif.type === 'FRIEND_ACCEPT' ? <Check size={18} /> :
                   <Bell size={18} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">
                    <span className="font-bold">@{notif.senderUsername}</span> {
                      notif.type === 'LIKE' ? 'le gustó tu reseña' :
                      notif.type === 'FRIEND_REQUEST' ? 'te envió una solicitud de amistad' :
                      notif.type === 'FRIEND_ACCEPT' ? 'aceptó tu solicitud de amistad' :
                      'empezó a seguirte'
                    }
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            No hay actividad en esta categoría.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivity;
