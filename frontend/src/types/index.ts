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

export interface Review {
  id: number;
  username: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  genre: string;
  platform: string;
  platforms: string[];
  releaseYear: number;
  avgScore: number;
  totalReviews: number;
  pegi?: string;
  isMultiplayer?: boolean;
  developer?: string;
  publisher?: string;
  officialWebsite?: string;
  reviews?: Review[];
}

export interface GamePage {
  content: Game[];
  nextCursor: string | null;
  hasMore: boolean;
}
