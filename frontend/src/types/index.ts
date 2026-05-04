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
  userId?: number;
  likesCount?: number;
  liked?: boolean;
  followingAuthor?: boolean;
  gameId?: number;
  gameTitle?: string;
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

export interface UserProfile {
  id: number;
  username: string;
  createdAt: string;
  isFollowing: boolean;
  friendStatus: 'NONE' | 'PENDING' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'FRIENDS';
  followersCount: number;
  followingCount: number;
  reviews: Review[];
}

export interface AppNotification {
  id: number;
  type: 'FOLLOW' | 'LIKE' | 'FRIEND_REQUEST' | 'FRIEND_ACCEPT';
  senderUsername: string;
  message: string;
  createdAt: string;
  read: boolean;
  referenceId?: number; // Request ID or Review ID
}

export interface ChatMessage {
  id: number;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  roomId?: string;
  isPrivate?: boolean;
  fromUsername?: string;
}
