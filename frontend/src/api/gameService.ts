import api from './axios';
import type { GamePage } from '../types';

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
