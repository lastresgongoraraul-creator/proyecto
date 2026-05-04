import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProfile, followUser, unfollowUser, sendFriendRequest, acceptFriendRequestByUserId } from '../api/socialService';
import type { UserProfile } from '../types';
import { Calendar, Users, MessageSquare, UserPlus, Check, MessageCircle, Clock, UserMinus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const loadProfile = async () => {
    if (!username) return;
    try {
      const data = await fetchProfile(username);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }
      loadProfile();
    } catch (error) {
      console.error('Error social action:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;
  if (!profile) return <div className="p-8 text-center">Usuario no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {profile.username[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={18} /> Miembro desde {new Date(profile.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users size={18} /> {profile.followersCount} Seguidores
              </span>
              <span className="flex items-center gap-1">
                <Users size={18} /> {profile.followingCount} Seguidos
              </span>
            </div>
          </div>
          {currentUser && currentUser.username !== profile.username && (
            <div className="flex items-center gap-3">
              {profile.friendStatus === 'FRIENDS' && (
                <button
                  onClick={() => navigate(`/messages/${profile.username}`)}
                  className="p-2 bg-slate-700 text-indigo-400 rounded-lg hover:bg-slate-600 transition-all border border-slate-600"
                  title="Mensaje Directo"
                >
                  <MessageCircle size={24} />
                </button>
              )}
              
              <div className="flex flex-col gap-2">
                {/* Friendship Button */}
                {profile.friendStatus === 'FRIENDS' ? (
                  <button
                    onClick={async () => {
                      if (window.confirm('¿Dejar de ser amigos?')) {
                        await import('../api/socialService').then(m => m.unfriend(profile.id));
                        loadProfile();
                      }
                    }}
                    className="px-6 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-semibold flex items-center gap-2 hover:bg-emerald-600/30 transition-all"
                  >
                    <Check size={18} /> Amigos
                  </button>
                ) : profile.friendStatus === 'REQUEST_SENT' ? (
                  <button
                    disabled
                    className="px-6 py-2 bg-slate-800 text-slate-500 border border-white/5 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Clock size={18} /> Pendiente
                  </button>
                ) : profile.friendStatus === 'REQUEST_RECEIVED' ? (
                  <button
                    onClick={async () => {
                      await acceptFriendRequestByUserId(profile.id);
                      loadProfile();
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    <UserPlus size={18} /> Aceptar solicitud
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await sendFriendRequest(profile.id);
                      loadProfile();
                    }}
                    className="px-6 py-2 bg-white/5 text-white border border-white/10 rounded-lg font-semibold flex items-center gap-2 hover:bg-white/10 transition-all"
                  >
                    <UserPlus size={18} /> Añadir amigo
                  </button>
                )}

                {/* Follow Button */}
                <button
                  onClick={handleToggleFollow}
                  className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                    profile.isFollowing
                    ? 'bg-slate-700 text-white hover:bg-slate-600'
                    : profile.friendStatus === 'FRIENDS'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {profile.isFollowing ? (
                    <><UserMinus size={18} /> Dejar de seguir</>
                  ) : (
                    <><UserPlus size={18} /> Seguir</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="text-indigo-500" /> Reseñas Recientes
      </h2>
      
      <div className="space-y-4">
        {profile.reviews.length > 0 ? (
          profile.reviews.map((review) => (
            <div key={review.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-500 text-white px-2 py-0.5 rounded text-sm font-bold">
                    {review.score}/10
                  </div>
                </div>
                <span className="text-slate-500 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-300 italic">"{review.comment}"</p>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-8">Aún no hay reseñas.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
