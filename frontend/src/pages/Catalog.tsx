import React, { useState, useEffect } from 'react';
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { fetchGames } from '../api/gameService';
import GameCard from '../components/GameCard';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { Search, Loader2, Ghost } from 'lucide-react';
import type { Game, GamePage } from '../types';

const GENRES = ['Action', 'RPG', 'Adventure', 'Strategy', 'Shooter', 'Sports'];
const PLATFORMS = ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'];

const Catalog: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [platform, setPlatform] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<GamePage, Error, InfiniteData<GamePage>, (string | null)[]>({
    queryKey: ['games', debouncedSearch, genre, platform],
    queryFn: ({ pageParam }) => fetchGames(pageParam as string | null, { search: debouncedSearch, genre, platform }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const { containerRef, isVisible } = useIntersectionObserver({
    threshold: 0.1,
  });

  useEffect(() => {
    if (isVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-slate-400">Search Games</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-sm font-medium text-slate-400">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48 space-y-2">
          <label className="text-sm font-medium text-slate-400">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setSearch('');
            setGenre('');
            setPlatform('');
          }}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
        >
          Reset
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-slate-400 animate-pulse">Scanning the multiverse for games...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-20 bg-red-500/5 rounded-2xl border border-red-500/10">
          <p className="text-red-400">Failed to load games. Is the backend running?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.pages.map((page: GamePage) => (
            page.content.map((game: Game) => (
              <GameCard key={game.id} game={game} />
            ))
          ))}
        </div>
      )}

      {!isLoading && data?.pages[0]?.content.length === 0 && (
        <div className="text-center py-20">
          <Ghost className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No games found matching your filters.</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={containerRef} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-indigo-400 font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
