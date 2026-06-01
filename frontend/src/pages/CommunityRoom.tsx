import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGameById } from '../api/gameService';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../hooks/useAuth';
import CommunitySidebar from '../components/community/CommunitySidebar';
import CommunityChat from '../components/community/CommunityChat';
import { ArrowLeft, Star, Users, UserPlus, UserMinus, Menu, Info, X } from 'lucide-react';
import type { Game } from '../types';

const CommunityRoom: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isJoined, join, leave } = useCommunity();
  const [activeUsersCount, setActiveUsersCount] = useState(0);

  // Mobile drawer states
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightInfo, setShowRightInfo] = useState(false);

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
      <div className={`community-sidebar-container ${showLeftSidebar ? 'mobile-visible' : 'mobile-hidden'}`}>
        <CommunitySidebar activeGameId={gameId} />
      </div>

      {/* 2. Main Content Area */}
      <main className="community-room-main">
        {/* Top Header */}
        <header className="community-room-header">
          <div className="header-left flex-1 min-w-0">
            <button
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className="flex lg:hidden community-room-back-btn mr-2"
              title="Comunidades"
            >
              {showLeftSidebar ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              onClick={() => navigate('/communities')}
              className="community-room-back-btn hidden lg:flex"
              title="Volver a todas las comunidades"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="header-divider hidden lg:block" />
            <div className="header-title-wrapper truncate min-w-0">
              <h1 className="header-game-title truncate text-base sm:text-lg">{game?.title ?? 'Cargando...'}</h1>
              <div className="community-active-badge">
                <span className="active-dot" />
                <span className="active-count">{activeUsersCount} en línea</span>
              </div>
            </div>
          </div>

          <div className="header-right flex items-center gap-2">
            <button
              onClick={handleJoinToggle}
              className={`header-join-btn hidden lg:flex ${joined ? 'is-member' : 'not-member'}`}
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
            <button
              onClick={() => setShowRightInfo(!showRightInfo)}
              className="flex lg:hidden community-room-back-btn ml-2"
              title="Info del juego"
            >
              <Info size={20} className={showRightInfo ? "text-indigo-400" : ""} />
            </button>
          </div>
        </header>

        {/* Room Body: Chat + User List + Info Panel */}
        <div className="community-room-content relative">
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
            <aside className={`community-room-info-aside ${showRightInfo ? 'mobile-visible' : 'mobile-hidden'}`}>
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
                      className="aside-detail-btn mb-4"
                    >
                      Ver detalles del juego
                    </button>

                    <button
                      onClick={handleJoinToggle}
                      className={`w-full sm:hidden py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${joined ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      {joined ? (
                        <>
                          <UserMinus size={18} />
                          <span>Salir de la sala</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          <span>Unirse a la sala</span>
                        </>
                      )}
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

