import React, { useState, useEffect } from 'react';
import { fetchGames, postCreateGame } from '../api/gameService';
import { fetchActivity } from '../api/socialService';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { Search, Loader2, Ghost, Star, Users } from 'lucide-react';
import type { Game, GamePage, Review } from '../types';

const GENRE_MAP: Record<string, string> = {
  'Acción': 'Acción',
  'RPG': 'RPG',
  'Aventura': 'Aventura',
  'Estrategia': 'Estrategia',
  'Disparos': 'Disparos',
  'Deportes': 'Deportes',
  'Terror': 'Terror',
  'Plataformas': 'Plataformas',
  'Simulación': 'Simulación',
  'Carreras': 'Carreras',
  'Lucha': 'Lucha'
};

const PLATFORM_MAP: Record<string, string> = {
  'PC': 'PC',
  'PS5': 'PlayStation 5',
  'PS4': 'PlayStation 4',
  'Xbox Series X': 'Xbox Series X',
  'Nintendo Switch': 'Nintendo Switch'
};

const Catalog: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGameForm, setNewGameForm] = useState({
    name: '',
    summary: '',
    primaryGenre: '',
    coverUrl: '',
    releaseYear: new Date().getFullYear(),
    pegi: '',
    isMultiplayer: false,
    developer: '',
    publisher: '',
    officialWebsite: '',
    platforms: [] as string[]
  });

  const createGameMutation = useMutation({
    mutationFn: (game: any) => postCreateGame({ ...game, genres: [game.primaryGenre] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setShowCreateModal(false);
      setNewGameForm({
        name: '',
        summary: '',
        primaryGenre: '',
        coverUrl: '',
        releaseYear: new Date().getFullYear(),
        pegi: '',
        isMultiplayer: false,
        developer: '',
        publisher: '',
        officialWebsite: '',
        platforms: []
      });
      alert('Juego creado con éxito.');
    },
    onError: (error: any) => {
      console.error('Error creating game:', error);
      alert('Error al crear el juego: ' + (error.response?.data?.message || error.message));
    },
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<GamePage, Error, InfiniteData<GamePage>, (string | null)[]>({
    queryKey: ['games', debouncedSearch, genre, platform],
    queryFn: ({ pageParam }) => fetchGames(pageParam as string | null, { search: debouncedSearch, genre, platform }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const { containerRef, isVisible } = useIntersectionObserver({
    threshold: 0.1,
  });

  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const [activeTab, setActiveTab] = useState<'catalog' | 'feed'>('catalog');
  const { data: activity, isLoading: isActivityLoading } = useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
    enabled: activeTab === 'feed',
  });

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-8 border-b border-white/10">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'catalog' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Explorar Juegos
          {activeTab === 'catalog' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'feed' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Siguiendo
          {activeTab === 'feed' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {user && user.role === 'ADMIN' && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors"
              >
                Crear Juego
              </button>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-slate-400">Buscar Juegos</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-sm font-medium text-slate-400">Género</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todos los géneros</option>
            {Object.entries(GENRE_MAP).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-sm font-medium text-slate-400">Plataforma</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Todas las plataformas</option>
            {Object.entries(PLATFORM_MAP).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setSearch('');
            setGenre('');
            setPlatform('');
          }}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
        >
          Limpiar
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-400 animate-pulse">Escaneando el multiverso en busca de juegos...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-red-400">Error al cargar los juegos. ¿Está el backend ejecutándose?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.pages?.map((page: GamePage) => (
            page?.content?.map((game: Game) => (
              <GameCard key={game.id} game={game} />
            ))
          ))}
        </div>
      )}

      {!isLoading && data?.pages?.[0]?.content?.length === 0 && (
        <div className="text-center py-20">
          <Ghost className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No se encontraron juegos que coincidan con los filtros.</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={containerRef} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-indigo-400 font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando más...
          </div>
        )}
      </div>
    </>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-2xl mx-auto space-y-6">
            {isActivityLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-400">Cargando las últimas noticias de tus amigos...</p>
              </div>
            ) : activity && activity.length > 0 ? (
              activity.map((item: Review) => (
                <div key={item.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {item.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">
                        <Link to={`/profile/${item.username}`} className="text-indigo-400 hover:underline">
                          @{item.username}
                        </Link>
                        <span className="text-slate-500 font-normal ml-2">comentó en</span>
                        <Link to={`/games/${item.gameId}`} className="text-white hover:text-indigo-400 ml-2">
                          {item.gameTitle}
                        </Link>
                      </p>
                      <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-yellow-500 font-bold text-sm">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      {item.score}/10
                    </div>
                    <p className="text-slate-300 italic">"{item.comment}"</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-white/10">
                <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Tu feed está muy tranquilo.</p>
                <p className="text-slate-500">¡Sigue a algunos usuarios para ver sus reseñas aquí!</p>
              </div>
            )}
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-6xl space-y-6 my-8">
            <h2 className="text-xl font-bold">Crear Nuevo Juego</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Side */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Nombre *</label>
                  <input
                    type="text"
                    value={newGameForm.name}
                    onChange={(e) => setNewGameForm({ ...newGameForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Grand Theft Auto VI"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Género Principal *</label>
                    <select
                      value={newGameForm.primaryGenre}
                      onChange={(e) => setNewGameForm({ ...newGameForm, primaryGenre: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="">Selecciona un género</option>
                      {Object.entries(GENRE_MAP).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Plataforma</label>
                    <select
                      value={newGameForm.platforms[0] || ''}
                      onChange={(e) => setNewGameForm({ ...newGameForm, platforms: [e.target.value] })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="">Selecciona plataforma</option>
                      {Object.entries(PLATFORM_MAP).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Año de Lanzamiento</label>
                    <input
                      type="number"
                      value={newGameForm.releaseYear}
                      onChange={(e) => setNewGameForm({ ...newGameForm, releaseYear: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">PEGI</label>
                    <select
                      value={newGameForm.pegi}
                      onChange={(e) => setNewGameForm({ ...newGameForm, pegi: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="">Selecciona PEGI</option>
                      <option value="PEGI 3">PEGI 3</option>
                      <option value="PEGI 7">PEGI 7</option>
                      <option value="PEGI 12">PEGI 12</option>
                      <option value="PEGI 16">PEGI 16</option>
                      <option value="PEGI 18">PEGI 18</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Modo</label>
                    <select
                      value={newGameForm.isMultiplayer ? 'true' : 'false'}
                      onChange={(e) => setNewGameForm({ ...newGameForm, isMultiplayer: e.target.value === 'true' })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="false">Un jugador</option>
                      <option value="true">Multijugador</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Web Oficial</label>
                    <input
                      type="text"
                      value={newGameForm.officialWebsite}
                      onChange={(e) => setNewGameForm({ ...newGameForm, officialWebsite: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Desarrollador</label>
                    <input
                      type="text"
                      value={newGameForm.developer}
                      onChange={(e) => setNewGameForm({ ...newGameForm, developer: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Distribuidor</label>
                    <input
                      type="text"
                      value={newGameForm.publisher}
                      onChange={(e) => setNewGameForm({ ...newGameForm, publisher: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Portada (Subir archivo)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewGameForm({ ...newGameForm, coverUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Resumen (Opcional)</label>
                  <textarea
                    value={newGameForm.summary}
                    onChange={(e) => setNewGameForm({ ...newGameForm, summary: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                    placeholder="Describe el juego..."
                  />
                </div>
              </div>

              {/* Preview Side (Looks like GameDetail) */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-400">Vista Previa (Como se verá)</label>
                <div className="bg-slate-950 border border-white/5 rounded-2xl p-6 h-full flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Cover */}
                    <div className="w-full md:w-1/3">
                      {newGameForm.coverUrl ? (
                        <img src={newGameForm.coverUrl} alt="Preview" className="w-full h-auto object-cover rounded-lg shadow-2xl" />
                      ) : (
                        <div className="w-full aspect-[3/4] bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-sm border border-white/5">
                          Sin Imagen
                        </div>
                      )}
                    </div>

                    {/* Right: Info */}
                    <div className="w-full md:w-2/3 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
                          {GENRE_MAP[newGameForm.primaryGenre] || 'GÉNERO'}
                        </span>
                      </div>
                      
                      <h1 className="text-3xl font-black text-white">{newGameForm.name || 'Grand Theft Auto VI'}</h1>
                      
                      {/* Grid of details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-slate-900 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-slate-500">Puntuación</p>
                          <p className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500" /> 10.0 / 10
                          </p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-slate-500">Plataforma</p>
                          <p className="text-sm font-bold text-white">{newGameForm.platforms[0] || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-slate-500">Lanzamiento</p>
                          <p className="text-sm font-bold text-white">{newGameForm.releaseYear}</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-slate-500">PEGI</p>
                          <p className="text-sm font-bold text-red-400">{newGameForm.pegi || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-slate-500">Modo</p>
                          <p className="text-sm font-bold text-white">{newGameForm.isMultiplayer ? 'Multijugador' : 'Un jugador'}</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-white/5">
                          <p className="text-xs text-slate-500">Web Oficial</p>
                          <p className="text-sm font-bold text-indigo-400 hover:underline cursor-pointer">Visitar</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">DESARROLLADOR</p>
                          <p className="font-bold text-white">{newGameForm.developer || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">DISTRIBUIDOR</p>
                          <p className="font-bold text-white">{newGameForm.publisher || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Acerca del juego</h3>
                    <p className="text-sm text-slate-400">
                      {newGameForm.summary || 'Aquí se mostrará el resumen del juego que escribas...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => createGameMutation.mutate(newGameForm)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors"
                disabled={createGameMutation.isPending || !newGameForm.name || !newGameForm.primaryGenre}
              >
                {createGameMutation.isPending ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
