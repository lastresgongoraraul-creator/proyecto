import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGameById } from '../api/gameService';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../hooks/useAuth';
import CommunitySidebar from '../components/community/CommunitySidebar';
import CommunityChat from '../components/community/CommunityChat';
import { ArrowLeft, Star, Users, UserPlus, UserMinus } from 'lucide-react';
import type { Game } from '../types';

const CommunityRoom: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isJoined, join, leave } = useCommunity();
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  const { data: game } = useQuery<Game>({
    queryKey: ['game', gameId],
    queryFn: () => fetchGameById(gameId!),
    enabled: !!gameId,
  });

  if (!gameId) {
    navigate('/communities');
    return null;
  }

  const joined = isJoined(gameId);

  const handleJoinToggle = async () => {
    if (!user) { navigate('/login'); return; }
    if (joined) {
      await leave(gameId);
    } else {
      await join(gameId);
    }
  };

  const thumbnailUrl = game?.thumbnail?.startsWith('//')
    ? `https:${game.thumbnail}`
    : game?.thumbnail || '';

  return (
    <div className="community-room-root">
      {/* 1. Global Navigation Sidebar (Joined Communities) */}
      <CommunitySidebar activeGameId={gameId} />

      {/* 2. Main Content Area */}
      <main className="community-room-main">
        {/* Top Header */}
        <header className="community-room-header">
          <div className="header-left">
            <button
              onClick={() => navigate('/communities')}
              className="community-room-back-btn"
              title="Volver a todas las comunidades"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="header-divider" />
            <div className="header-title-wrapper">
              <h1 className="header-game-title">{game?.title ?? 'Cargando...'}</h1>
              <div className="community-active-badge">
                <span className="active-dot" />
                <span className="active-count">{activeUsersCount} en línea</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <button
              onClick={handleJoinToggle}
              className={`header-join-btn ${joined ? 'is-member' : 'not-member'}`}
            >
              {joined ? (
                <>
                  <UserMinus size={16} />
                  <span>Salir</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Unirse</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Room Body: Chat + User List + Info Panel */}
        <div className="community-room-content">
          {/* Central Chat Column */}
          <div className="community-room-chat-wrapper">
            <CommunityChat
              gameId={gameId}
              gameTitle={game?.title ?? 'esta comunidad'}
              onUsersUpdate={setActiveUsersCount}
            />
          </div>

          {/* Right Info Sidebar (Collapsible/Fixed) */}
          {game && (
            <aside className="community-room-info-aside">
              <div className="aside-scroll">
                <div className="aside-game-card">
                  <div className="aside-cover">
                    {thumbnailUrl && (
                      <img src={thumbnailUrl} alt={game.title} className="aside-cover-img" />
                    )}
                    <div className="aside-cover-overlay" />
                  </div>
                  
                  <div className="aside-content">
                    <div className="aside-tags">
                      <span className="aside-tag genre">{game.genre}</span>
                      {game.platform && <span className="aside-tag platform">{game.platform}</span>}
                    </div>
                    
                    <div className="aside-stats">
                      {game.avgScore != null && (
                        <div className="aside-stat">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span className="font-bold text-white">{game.avgScore.toFixed(1)}</span>
                        </div>
                      )}
                      {game.totalReviews != null && (
                        <div className="aside-stat">
                          <Users size={14} className="text-slate-400" />
                          <span>{game.totalReviews} reseñas</span>
                        </div>
                      )}
                    </div>

                    <div className="aside-divider" />
                    
                    <p className="aside-description">{game.description}</p>

                    <button
                      onClick={() => navigate(`/games/${gameId}`)}
                      className="aside-detail-btn"
                    >
                      Ver detalles del juego
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default CommunityRoom;

