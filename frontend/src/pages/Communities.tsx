import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchCommunities, type CommunityGame } from '../api/communityService';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../hooks/useAuth';
import { Users, Zap, Search, MessageSquare, ChevronRight, UserPlus } from 'lucide-react';

const GENRE_GRADIENTS: Record<string, string> = {
  'RPG': 'from-purple-600/30 to-indigo-600/10',
  'Acción': 'from-red-600/30 to-orange-600/10',
  'Action': 'from-red-600/30 to-orange-600/10',
  'Aventura': 'from-emerald-600/30 to-teal-600/10',
  'Adventure': 'from-emerald-600/30 to-teal-600/10',
  'Disparos': 'from-amber-600/30 to-yellow-600/10',
  'Shooter': 'from-amber-600/30 to-yellow-600/10',
  'Estrategia': 'from-blue-600/30 to-cyan-600/10',
  'Strategy': 'from-blue-600/30 to-cyan-600/10',
  'Terror': 'from-rose-700/30 to-red-900/10',
  'Deportes': 'from-green-500/30 to-emerald-700/10',
};

const GENRE_BADGE: Record<string, string> = {
  'RPG': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Acción': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Action': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Aventura': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Adventure': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Disparos': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Shooter': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Estrategia': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Terror': 'bg-rose-600/20 text-rose-300 border-rose-600/30',
  'Deportes': 'bg-green-500/20 text-green-300 border-green-500/30',
};

const Communities: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isJoined, join, leave } = useCommunity();
  const [search, setSearch] = useState('');

  const { data: communities = [], isLoading, isError } = useQuery<CommunityGame[]>({
    queryKey: ['communities'],
    queryFn: fetchCommunities,
    refetchInterval: 15_000, // refresh active users count every 15s
  });

  const filtered = communities.filter((c) =>
    c.gameTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.gameGenre.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoinToggle = async (e: React.MouseEvent, community: CommunityGame) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (isJoined(community.gameId)) {
      await leave(community.gameId);
    } else {
      await join(community.gameId);
      // Ir al chat directamente al unirse
      navigate(`/communities/${community.gameId}`);
    }
  };

  // handleEnterRoom removed in favor of direct navigate calls

  const totalOnline = communities.reduce((sum, c) => sum + (c.activeUsers || 0), 0);

  return (
    <div className="communities-hub">
      {/* Hero Header */}
      <div className="communities-hero">
        <div className="communities-hero-content">
          <div className="communities-hero-badge">
            <Zap size={14} className="text-indigo-300" />
            <span>Hub de Comunidades</span>
          </div>
          <h1 className="communities-hero-title">
            Salas <span className="communities-hero-gradient">en Vivo</span>
          </h1>
          <p className="communities-hero-subtitle">
            Únete a las conversaciones más activas y conecta con jugadores en tiempo real
          </p>
          <div className="communities-stats">
            <div className="community-stat stat-users">
              <Users size={16} />
              <span><strong>{totalOnline}</strong> jugadores activos</span>
            </div>
            <div className="community-stat stat-rooms">
              <MessageSquare size={16} />
              <span><strong>{communities.length}</strong> salas abiertas</span>
            </div>
            <div className="community-stat stat-live">
              <Zap size={16} />
              <span>Actualizando en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="communities-search-wrapper">
        <div className="communities-search-box">
          <Search size={18} className="communities-search-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar comunidad por juego o género..."
            className="communities-search-input"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="communities-loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="community-card-skeleton" />
          ))}
        </div>
      ) : isError ? (
        <div className="communities-error">
          <p>Error al cargar las comunidades. ¿Está el backend en marcha?</p>
        </div>
      ) : (
        <div className="communities-grid">
          {filtered.map((community) => {
            const joined = isJoined(community.gameId);
            const thumbnailUrl = community.gameThumbnail?.startsWith('//')
              ? `https:${community.gameThumbnail}`
              : community.gameThumbnail || '';
            const gradient = GENRE_GRADIENTS[community.gameGenre] ?? 'from-slate-600/30 to-slate-800/10';
            const badge = GENRE_BADGE[community.gameGenre] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';

            return (
              <div
                key={community.gameId}
                onClick={() => navigate(`/communities/${community.gameId}`)}
                className={`community-card bg-gradient-to-br ${gradient} ${joined ? 'community-card-joined border-indigo-500/50' : 'border-white/5'}`}
                title="Ver sala de la comunidad"
              >
                {/* Cover image */}
                <div className="community-card-cover">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={community.gameTitle} className="community-card-img" />
                  ) : (
                    <div className="community-card-img-fallback">
                      <MessageSquare size={32} className="text-white/30" />
                    </div>
                  )}
                  <div className="community-card-overlay" />
                  {/* Active users badge */}
                  <div className="community-metrics-badges">
                    <div className="community-live-badge" title="Usuarios conectados">
                      <span className="community-live-dot" />
                      <Users size={11} />
                      <span className="ml-1">{community.activeUsers} en línea</span>
                    </div>
                    <div className="community-total-badge" title="Miembros totales">
                      <Users size={11} className="text-white/50" />
                      <span className="ml-1">{community.totalMembers ?? Math.floor((parseInt(community.gameId) % 50) + 120)} miembros</span>
                    </div>
                  </div>
                  {joined && (
                    <div className="community-joined-tag">✓ Eres miembro</div>
                  )}
                </div>

                {/* Card body */}
                <div className="community-card-body">
                  <span className={`community-genre-badge ${badge}`}>
                    {community.gameGenre}
                  </span>
                  <h3 className="community-card-title">{community.gameTitle}</h3>

                  <div className="community-card-footer">
                    {!joined ? (
                      <button
                        onClick={(e) => handleJoinToggle(e, community)}
                        className="community-join-btn not-joined w-full justify-center py-3 text-base"
                      >
                        <UserPlus size={18} className="mr-2" />
                        Unirse a la Comunidad
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/communities/${community.gameId}`); }}
                          className="community-enter-btn flex-1 justify-center py-2"
                        >
                          <span>Ir al chat</span>
                          <ChevronRight size={14} />
                        </button>
                        <button
                          onClick={(e) => handleJoinToggle(e, community)}
                          className="community-join-btn joined px-3"
                          title="Salir de la comunidad"
                        >
                          Salir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !isLoading && (
            <div className="communities-empty">
              <MessageSquare size={40} className="communities-empty-icon" />
              <p>No se encontraron comunidades para "{search}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Communities;
