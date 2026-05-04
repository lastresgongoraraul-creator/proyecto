import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Heart, UserPlus, X, Check } from 'lucide-react';
import { acceptFriendRequest, rejectFriendRequest } from '../../api/socialService';

const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-white transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-sm">Notificaciones</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-slate-700/50 flex gap-3 hover:bg-slate-700/30 cursor-pointer transition-colors ${!notif.read ? 'bg-indigo-500/5' : ''}`}
                  >
                    <div className={`p-2 rounded-full h-fit ${
                      notif.type === 'LIKE' ? 'bg-pink-500/20 text-pink-500' : 
                      notif.type === 'FRIEND_REQUEST' ? 'bg-indigo-500/20 text-indigo-500' :
                      notif.type === 'FRIEND_ACCEPT' ? 'bg-emerald-500/20 text-emerald-500' :
                      'bg-slate-500/20 text-slate-500'
                    }`}>
                      {notif.type === 'LIKE' ? <Heart size={16} fill="currentColor" /> : 
                       notif.type === 'FRIEND_REQUEST' ? <UserPlus size={16} /> :
                       notif.type === 'FRIEND_ACCEPT' ? <Check size={16} /> :
                       <Bell size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-200">
                        <span className="font-bold">{notif.senderUsername}</span> {
                          notif.type === 'LIKE' ? 'le gustó tu reseña' : 
                          notif.type === 'FRIEND_REQUEST' ? 'te envió una solicitud de amistad' :
                          notif.type === 'FRIEND_ACCEPT' ? 'aceptó tu solicitud de amistad' :
                          'empezó a seguirte'
                        }
                      </p>
                      {notif.type === 'FRIEND_REQUEST' && !notif.read && (
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              await acceptFriendRequest(notif.referenceId!);
                              markAsRead(notif.id);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-3 py-1 rounded font-bold"
                          >
                            Aceptar
                          </button>
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              await rejectFriendRequest(notif.referenceId!);
                              markAsRead(notif.id);
                            }}
                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] px-3 py-1 rounded font-bold"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No hay notificaciones todavía.
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-2 text-center border-t border-slate-700 bg-slate-800/50">
                <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                  Ver toda la actividad
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
