import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import api, { setAccessToken } from '../api/axios';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (accessToken: string, userData: User) => {
    setAccessToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (user?.id) {
        const chatUrl = `http://${window.location.hostname}:3001/clear-session/${user.id}`;
        await fetch(chatUrl, { method: 'POST' }).catch(err => console.error('Clear chat session error', err));
      }
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
