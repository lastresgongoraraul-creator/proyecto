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
  if (filters.search) params.append('q', filters.search);

  const response = await api.get(`/games?${params.toString()}`);
  return response.data;
};
