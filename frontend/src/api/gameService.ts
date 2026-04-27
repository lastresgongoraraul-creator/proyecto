import api from './axios';
import type { Game, GamePage } from '../types';

export interface GameFilters {
  genre?: string;
  platform?: string;
  search?: string;
}

export const fetchGames = async (
  cursor: string | null = null,
  filters: GameFilters = {}
): Promise<GamePage> => {
  const params = new URLSearchParams();
  if (cursor) params.append('cursor', cursor);
  if (filters.genre) params.append('genre', filters.genre);
  if (filters.platform) params.append('platform', filters.platform);
  if (filters.search) params.append('search', filters.search);
  const response = await api.get(`/games?${params.toString()}`);
  const data = response.data;
  
  // Backend might be returning an array directly instead of a GamePage object. wrapper:
  if (Array.isArray(data)) {
    const nextCursor = data.length > 0 ? data[data.length - 1].id : null;
    return {
      content: data,
      nextCursor: nextCursor,
      hasMore: data.length >= 10 // Assuming default size=10 to determine if hasMore
    };
  }

  // Gracefully handle undefined or bad responses
  if (!data || !data.content) {
    return { content: [], nextCursor: null, hasMore: false };
  }

  return data;
};

export const fetchGameById = async (id: string): Promise<Game> => {
  const response = await api.get(`/games/${id}`);
  return response.data;
};

export const fetchSimilarGames = async (id: string, minScore: number = 0): Promise<Game[]> => {
  // Hit the AI service running on port 8000
  const response = await fetch(`http://localhost:8000/games/${id}/similar?min_score=${minScore}`);
  if (!response.ok) {
    throw new Error('Failed to fetch similar games');
  }
  const data = await response.json();
  // Map the AI response format to our Game format
  interface AIGame {
    id: number;
    name: string;
    summary: string;
    cover_url: string;
    primary_genre: string;
    platforms: string[];
    release_year: number;
    avg_score: number;
  }

  return data.map((g: AIGame) => ({
    id: g.id.toString(),
    title: g.name,
    description: g.summary,
    thumbnail: g.cover_url,
    genre: g.primary_genre,
    platform: g.platforms && g.platforms.length > 0 ? g.platforms[0] : 'N/A',
    releaseYear: g.release_year,
    avgScore: g.avg_score,
  }));
};

export const postReview = async (gameId: number, score: number, comment: string): Promise<any> => {
  const response = await api.post('/reviews', { gameId, score, comment });
  return response.data;
};

export const updateReview = async (id: number, gameId: number, score: number, comment: string): Promise<any> => {
  const response = await api.put(`/reviews/${id}`, { gameId, score, comment });
  return response.data;
};

export const deleteReview = async (id: number): Promise<any> => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};
