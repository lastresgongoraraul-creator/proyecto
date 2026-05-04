import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchJoinedCommunities, joinCommunity, leaveCommunity, type JoinedCommunity } from '../api/communityService';
import { useAuth } from '../hooks/useAuth';

interface CommunityContextType {
  joinedCommunities: JoinedCommunity[];
  isJoined: (gameId: string) => boolean;
  join: (gameId: string) => Promise<void>;
  leave: (gameId: string) => Promise<void>;
  refreshJoined: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [joinedCommunities, setJoinedCommunities] = useState<JoinedCommunity[]>([]);

  const refreshJoined = useCallback(async () => {
    if (!user) {
      setJoinedCommunities([]);
      return;
    }
    try {
      const data = await fetchJoinedCommunities();
      setJoinedCommunities(data);
    } catch {
      setJoinedCommunities([]);
    }
  }, [user]);

  useEffect(() => {
    refreshJoined();
  }, [refreshJoined]);

  const isJoined = (gameId: string) =>
    joinedCommunities.some((c) => c.gameId === gameId);

  const join = async (gameId: string) => {
    await joinCommunity(gameId);
    await refreshJoined();
  };

  const leave = async (gameId: string) => {
    await leaveCommunity(gameId);
    await refreshJoined();
  };

  return (
    <CommunityContext.Provider value={{ joinedCommunities, isJoined, join, leave, refreshJoined }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
};
