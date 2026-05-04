import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Gamepad2, LogOut, Users, Mail } from 'lucide-react';

import NotificationCenter from '../components/notifications/NotificationCenter';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isCommunitiesActive = location.pathname.startsWith('/communities');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-200">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              <Gamepad2 className="w-8 h-8 text-indigo-400" />
              <span>GameSphere</span>
            </Link>
            <Link
              to="/communities"
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                isCommunitiesActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
              }`}
            >
              <Users size={15} />
              Comunidades
            </Link>
            <Link
              to="/messages"
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                location.pathname.startsWith('/messages')
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
              }`}
            >
              <Mail size={15} />
              Mensajes
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">
                  Iniciar sesión
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={`/profile/${user.username}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                </Link>
                
                <NotificationCenter />

                <button 
                  onClick={logout}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-all ml-2"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-8 mt-12 bg-slate-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>&copy; 2026 GameSphere. Desarrollado con React y Vite.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
