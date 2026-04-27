import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  user: User | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
