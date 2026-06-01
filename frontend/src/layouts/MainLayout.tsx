import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Gamepad2, LogOut, Users, Mail, Activity, Star, Search, Rss, Menu, X } from 'lucide-react';

import NotificationCenter from '../components/notifications/NotificationCenter';

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCommunitiesActive = location.pathname.startsWith('/communities');
  const activeTab = searchParams.get('tab') || (user ? 'recommendations' : 'catalog');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    navigate(`/?tab=${tab}`, { replace: true });
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-transparent font-sans text-slate-200">
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-3xl border-b border-indigo-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
        {/* Gradient Top Accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        
        <div className="container mx-auto px-4 py-3 min-h-[4rem] flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/?tab=recommendations"
              className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent shrink-0"
              onClick={closeMobileMenu}
            >
              <Gamepad2 className="w-8 h-8 text-indigo-400" />
              <span>GameSphere</span>
            </Link>
          </div>

          {/* Desktop Navigation (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex items-center gap-2 flex-1 justify-start ml-8">
            {user && (
              <button
                onClick={() => handleTabChange('recommendations')}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/' && activeTab === 'recommendations'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
                }`}
              >
                <Star size={14} />
                Para Ti
              </button>
            )}

            <button
              onClick={() => handleTabChange('catalog')}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                location.pathname === '/' && activeTab === 'catalog'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
              }`}
            >
              <Gamepad2 size={14} />
              Explorar
            </button>

            <div className="h-5 w-px bg-white/10 mx-1" />

            <Link
              to="/communities"
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                isCommunitiesActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
              }`}
            >
              <Users size={14} />
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
              <Mail size={14} />
              Mensajes
            </Link>

            <Link
              to="/activity"
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                location.pathname.startsWith('/activity')
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
              }`}
            >
              <Activity size={14} />
              Mi Actividad
            </Link>

            <div className="h-5 w-px bg-white/10 mx-1" />

            <button
              onClick={() => handleTabChange('search_users')}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                location.pathname === '/' && activeTab === 'search_users'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
              }`}
            >
              <Search size={14} />
              Buscar
            </button>

            {user && (
              <button
                onClick={() => handleTabChange('feed')}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname === '/' && activeTab === 'feed'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
                }`}
              >
                <Rss size={14} />
                Siguiendo
              </button>
            )}
          </div>

          {/* Desktop Right Side / User Menu (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
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
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
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
          </div>

          {/* Mobile/Tablet Menu Button & Notification Center */}
          <div className="flex items-center gap-4 lg:hidden">
            {user && <NotificationCenter />}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-900 shadow-2xl absolute w-full left-0">
            <div className="flex flex-col p-4 space-y-2">
              {user && (
                <button
                  onClick={() => handleTabChange('recommendations')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === '/' && activeTab === 'recommendations'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <Star size={18} />
                  Para Ti
                </button>
              )}

              <button
                onClick={() => handleTabChange('catalog')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === '/' && activeTab === 'catalog'
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <Gamepad2 size={18} />
                Explorar Juegos
              </button>

              <Link
                to="/communities"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isCommunitiesActive
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <Users size={18} />
                Comunidades
              </Link>

              <Link
                to="/messages"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname.startsWith('/messages')
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <Mail size={18} />
                Mensajes
              </Link>

              <Link
                to="/activity"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname.startsWith('/activity')
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <Activity size={18} />
                Mi Actividad
              </Link>

              <button
                onClick={() => handleTabChange('search_users')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === '/' && activeTab === 'search_users'
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <Search size={18} />
                Buscar Usuarios
              </button>

              {user && (
                <button
                  onClick={() => handleTabChange('feed')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === '/' && activeTab === 'feed'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <Rss size={18} />
                  Siguiendo
                </button>
              )}

              <div className="h-px w-full bg-white/10 my-2" />

              {!user ? (
                <div className="flex flex-col gap-2 mt-2">
                  <Link 
                    to="/login" 
                    onClick={closeMobileMenu}
                    className="w-full text-center py-3 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium"
                  >
                    Iniciar sesión
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={closeMobileMenu}
                    className="w-full text-center py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors font-medium text-white shadow-lg shadow-indigo-500/20"
                  >
                    Registrarse
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link 
                    to={`/profile/${user.username}`} 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-slate-300"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username[0].toUpperCase()
                      )}
                    </div>
                    <span className="font-medium">Mi Perfil (@{user.username})</span>
                  </Link>
                  <button 
                    onClick={() => { logout(); closeMobileMenu(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-left"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className={location.pathname.match(/^\/communities\/[^/]+$/) ? "flex-1 w-full flex flex-col relative" : "flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8"}>
        <Outlet />
      </main>

      <footer className="border-t border-indigo-500/20 py-8 mt-12 bg-black/95">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>&copy; 2026 GameSphere. Todos los derechos reservados al creador.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

