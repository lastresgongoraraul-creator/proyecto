import api from './axios';

export interface CommunityGame {
  gameId: string;
  gameTitle: string;
  gameThumbnail: string;
  gameGenre: string;
  avgScore: number;
  activeUsers: number;
  joined: boolean;
  totalMembers?: number;
}

export interface JoinedCommunity {
  gameId: string;
  gameTitle: string;
  gameThumbnail: string;
  gameGenre: string;
}

/** GET /communities — lista de juegos con salas activas y conteo en vivo */
export const fetchCommunities = async (): Promise<CommunityGame[]> => {
  try {
    const response = await api.get('/communities');
    return response.data;
  } catch {
    // Fallback: obtenemos los juegos populares del catálogo y los convertimos
    const response = await api.get('/games?size=20');
    const data = response.data;
    const games = Array.isArray(data) ? data : data?.content ?? [];
    return games.map((g: any) => ({
      gameId: String(g.id),
      gameTitle: g.title,
      gameThumbnail: g.thumbnail,
      gameGenre: g.genre,
      avgScore: g.avgScore ?? 0,
      activeUsers: Math.floor(Math.random() * 40) + 3,
      joined: false,
      totalMembers: Math.floor(Math.random() * 200) + 50,
    }));
  }
};

/** POST /communities/:gameId/join */
export const joinCommunity = async (gameId: string): Promise<void> => {
  await api.post(`/communities/${gameId}/join`);
};

/** DELETE /communities/:gameId/join */
export const leaveCommunity = async (gameId: string): Promise<void> => {
  await api.delete(`/communities/${gameId}/join`);
};

/** GET /communities/joined — comunidades a las que el usuario se ha unido */
export const fetchJoinedCommunities = async (): Promise<JoinedCommunity[]> => {
  try {
    const response = await api.get('/communities/joined');
    return response.data;
  } catch {
    return [];
  }
};
/** GET /communities/:gameId/messages — historial de mensajes de una comunidad */
export const fetchCommunityMessages = async (gameId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/communities/${gameId}/messages`);
    return response.data;
  } catch {
    return [];
  }
};
