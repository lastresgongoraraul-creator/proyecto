export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  genre: string;
  platform: string;
  releaseYear: number;
  avgScore: number;
}

export interface GamePage {
  content: Game[];
  nextCursor: string | null;
  hasMore: boolean;
}
