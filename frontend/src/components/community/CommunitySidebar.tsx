import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../hooks/useAuth';
import type { JoinedCommunity } from '../../api/communityService';

interface CommunitySidebarProps {
  activeGameId?: string;
}

const GENRE_COLORS: Record<string, string> = {
  'RPG': 'from-purple-500 to-indigo-500',
  'Acción': 'from-red-500 to-orange-500',
  'Action': 'from-red-500 to-orange-500',
  'Aventura': 'from-emerald-500 to-teal-500',
  'Adventure': 'from-emerald-500 to-teal-500',
  'Disparos': 'from-amber-500 to-yellow-500',
  'Shooter': 'from-amber-500 to-yellow-500',
  'Estrategia': 'from-blue-500 to-cyan-500',
  'Strategy': 'from-blue-500 to-cyan-500',
  'Terror': 'from-rose-600 to-red-900',
  'Deportes': 'from-green-400 to-emerald-600',
  'Sports': 'from-green-400 to-emerald-600',
};

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ activeGameId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinedCommunities } = useCommunity();

  if (!user) return null;

  const getGradient = (genre: string) =>
    GENRE_COLORS[genre] ?? 'from-slate-500 to-slate-700';

  const getInitials = (title: string) =>
    title.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <aside className="community-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <Zap className="sidebar-icon" size={16} />
          <span className="sidebar-title">Mis Comunidades</span>
        </div>
        <span className="sidebar-count">{joinedCommunities.length}</span>
      </div>

      {/* Joined communities list */}
      <nav className="sidebar-nav">
        {joinedCommunities.length === 0 ? (
          <div className="sidebar-empty">
            <Users size={28} className="sidebar-empty-icon" />
            <p className="sidebar-empty-text">Aún no te has unido a ninguna comunidad</p>
            <button
              onClick={() => navigate('/communities')}
              className="sidebar-empty-btn"
            >
              Explorar comunidades
            </button>
          </div>
        ) : (
          joinedCommunities.map((community: JoinedCommunity) => {
            const isActive = community.gameId === activeGameId;
            const thumbnailUrl = community.gameThumbnail?.startsWith('//')
              ? `https:${community.gameThumbnail}`
              : community.gameThumbnail;

            return (
              <button
                key={community.gameId}
                onClick={() => navigate(`/communities/${community.gameId}`)}
                className={`sidebar-community-btn ${isActive ? 'active' : ''}`}
                title={community.gameTitle}
              >
                <div className="sidebar-avatar-wrapper">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={community.gameTitle}
                      className="sidebar-avatar-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={`sidebar-avatar-fallback bg-gradient-to-br ${getGradient(community.gameGenre)}`}>
                      {getInitials(community.gameTitle)}
                    </div>
                  )}
                  {isActive && <span className="sidebar-active-dot" />}
                </div>
                <div className="sidebar-community-info">
                  <span className="sidebar-community-name">{community.gameTitle}</span>
                  <span className="sidebar-community-genre">{community.gameGenre}</span>
                </div>
                {isActive && <span className="sidebar-live-badge">LIVE</span>}
              </button>
            );
          })
        )}
      </nav>

      {/* Footer link */}
      <div className="sidebar-footer">
        <button onClick={() => navigate('/communities')} className="sidebar-footer-btn">
          <Users size={14} />
          Ver todas las salas
        </button>
      </div>
    </aside>
  );
};

export default CommunitySidebar;
