import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGameById, fetchSimilarGames, postReview, updateReview, deleteReview } from '../api/gameService';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Star, Monitor, Loader2, Calendar, Edit2, Trash2, Globe, Users, Shield } from 'lucide-react';
import GameCard from '../components/GameCard';

const GENRE_MAP: Record<string, string> = {
  'Action': 'Acción',
  'RPG': 'RPG',
  'Adventure': 'Aventura',
  'Strategy': 'Estrategia',
  'Shooter': 'Disparos',
  'Sports': 'Deportes'
};

const PLATFORM_MAP: Record<string, string> = {
  'PC': 'PC',
  'PlayStation 5': 'PS5',
  'Xbox Series X': 'Xbox Series X',
  'Nintendo Switch': 'Switch'
};

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reviewScore, setReviewScore] = React.useState<number>(10);
  const [reviewComment, setReviewComment] = React.useState<string>('');
  const [editingReviewId, setEditingReviewId] = React.useState<number | null>(null);
  const [editScore, setEditScore] = React.useState<number>(10);
  const [editComment, setEditComment] = React.useState<string>('');

  const { data: game, isLoading: isGameLoading, isError: isGameError } = useQuery({
    queryKey: ['game', id],
    queryFn: () => fetchGameById(id!),
    enabled: !!id,
  });

  const { data: similarGames, isLoading: isSimilarLoading } = useQuery({
    queryKey: ['similarGames', id],
    queryFn: () => fetchSimilarGames(id!, 0),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { score: number; comment: string }) => 
      postReview(Number(id), data.score, data.comment),
    onSuccess: () => {
      setReviewScore(10);
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['game', id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; score: number; comment: string }) => 
      updateReview(data.id, Number(id), data.score, data.comment),
    onSuccess: () => {
      setEditingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ['game', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', id] });
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    reviewMutation.mutate({ score: reviewScore, comment: reviewComment });
  };

  if (isGameLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 animate-pulse">Cargando detalles del juego...</p>
      </div>
    );
  }

  if (isGameError || !game) {
    return (
      <div className="text-center py-20 bg-red-500/5 rounded-2xl border border-red-500/10">
        <p className="text-red-400">Error al cargar el juego. Es posible que no exista.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const thumbnailUrl = game.thumbnail?.startsWith('//') 
    ? `https:${game.thumbnail}` 
    : game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 shrink-0">
          <img 
            src={thumbnailUrl} 
            alt={game.title}
            className="w-full rounded-2xl shadow-2xl shadow-indigo-500/20 border border-white/10 object-cover aspect-[3/4]"
          />
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2 text-sm font-medium text-slate-300 uppercase tracking-wider">
              <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                {GENRE_MAP[game.genre] || game.genre}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {game.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/5">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="font-bold text-lg">{game.avgScore != null ? game.avgScore.toFixed(1) : 'N/A'} / 10</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Monitor className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Plataforma</p>
                <p className="font-bold text-lg">{PLATFORM_MAP[game.platform] || game.platform}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Lanzamiento</p>
                <p className="font-bold text-lg">{game.releaseYear}</p>
              </div>
            </div>

            {game.pegi && (
              <div className="flex items-center gap-2">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">PEGI</p>
                  <p className="font-bold text-lg">{game.pegi}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Modo</p>
                <p className="font-bold text-lg">{game.isMultiplayer ? 'Multijugador' : 'Un jugador'}</p>
              </div>
            </div>

            {game.officialWebsite && (
              <div className="flex items-center gap-2">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Web Oficial</p>
                  <a href={game.officialWebsite} target="_blank" rel="noopener noreferrer" className="font-bold text-lg hover:text-orange-400 transition-colors">
                    Visitar
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-white/5">
            {game.developer && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Desarrollador</p>
                <p className="text-slate-200">{game.developer}</p>
              </div>
            )}
            {game.publisher && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Distribuidor</p>
                <p className="text-slate-200">{game.publisher}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Acerca del juego</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              {game.description}
            </p>
          </div>

          {game.reviews && game.reviews.length > 0 ? (
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h2 className="text-xl font-bold">Reseñas ({game.reviews.length})</h2>
              <div className="space-y-4">
                {game.reviews.map((review) => (
                  <div key={review.id} className="bg-white/5 p-4 rounded-xl border border-white/10 group/review">
                    {editingReviewId === review.id ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={editScore}
                            onChange={(e) => setEditScore(Number(e.target.value))}
                            className="w-20 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-white"
                          />
                          <button
                            onClick={() => updateMutation.mutate({ id: review.id, score: editScore, comment: editComment })}
                            className="text-xs bg-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingReviewId(null)}
                            className="text-xs bg-white/10 px-3 py-1 rounded-md hover:bg-white/20 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm min-h-[80px]"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                            <div className="font-medium text-indigo-400">@{review.username}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                              <Star className="w-4 h-4 fill-yellow-500" />
                              {review.score}/10
                            </div>
                            {user && user.username === review.username && (
                              <div className="flex items-center gap-2 opacity-0 group-hover/review:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingReviewId(review.id);
                                    setEditScore(review.score);
                                    setEditComment(review.comment);
                                  }}
                                  className="p-1 hover:text-indigo-400 transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('¿Estás seguro de que quieres borrar esta reseña?')) {
                                      deleteMutation.mutate(review.id);
                                    }
                                  }}
                                  className="p-1 hover:text-red-400 transition-colors"
                                  title="Borrar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-300 text-sm">{review.comment}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-6 border-t border-white/5">
              <h2 className="text-xl font-bold mb-4">Reseñas (0)</h2>
              <p className="text-slate-400 text-sm">Todavía no hay reseñas para este juego.</p>
            </div>
          )}

          {/* Formulario de Reseña */}
          <div className="pt-6 border-t border-white/5">
            <h2 className="text-xl font-bold mb-4">Añadir una Reseña</h2>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4 bg-white/5 p-6 rounded-xl border border-white/10">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Puntuación (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Comentario
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 min-h-[100px] resize-y"
                    placeholder="¿Qué te pareció este juego?"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {reviewMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publicar Reseña
                </button>
                {reviewMutation.isError && (
                  <p className="text-red-400 text-sm mt-2">
                    {(reviewMutation.error as any)?.response?.data?.message || 'Error al publicar la reseña. Solo puedes dejar una reseña por juego.'}
                  </p>
                )}
              </form>
            ) : (
              <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
                <p className="text-slate-300 mb-4">Debes iniciar sesión para dejar una reseña.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-white/10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Juegos Similares Recomendados
            </h2>
            <p className="text-slate-400 mt-1">Potenciado por nuestro motor de IA de similitud vectorial</p>
          </div>
        </div>

        {isSimilarLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : similarGames && similarGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {similarGames.map((similarGame) => (
              <GameCard key={similarGame.id} game={similarGame} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-slate-400">No se encontraron juegos similares.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail;
