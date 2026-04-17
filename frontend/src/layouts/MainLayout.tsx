import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, LogOut, User as UserIcon } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-200">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            <Gamepad2 className="w-8 h-8 text-indigo-400" />
            <span>GameSphere</span>
          </Link>

          <nav className="flex items-center gap-6">
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-all"
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
