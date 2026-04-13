import React from 'react';
import type { Game } from '../types';
import { Star, Monitor } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={game.thumbnail || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop'} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-indigo-400 border border-indigo-400/20 flex items-center gap-1">
          <Star className="w-3 h-3 fill-indigo-400" />
          {game.avgScore.toFixed(1)}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
          <span className="bg-white/5 px-2 py-0.5 rounded text-slate-300">{game.genre}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {game.title}
        </h3>
        
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
          {game.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Monitor className="w-4 h-4" />
            <span>{game.platform}</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">{game.releaseYear}</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
