import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Shield, Trash2, Check, X, Flag, AlertTriangle, UserX, MessageSquare, Star } from 'lucide-react';

interface ReportedItem {
  id: number;
  type: 'REVIEW' | 'MESSAGE';
  author: string;
  content: string;
  reason: string;
  createdAt: string;
  gameTitle?: string;
}

const mockReports: ReportedItem[] = [
  {
    id: 1,
    type: 'REVIEW',
    author: 'toxic_gamer',
    content: 'Este juego es una basura, no lo compren. El desarrollador es un idiota.',
    reason: 'Lenguaje ofensivo',
    createdAt: '2026-05-15T10:00:00Z',
    gameTitle: 'Cyberpunk 2077'
  },
  {
    id: 2,
    type: 'MESSAGE',
    author: 'spammer123',
    content: 'Gana dinero fácil en www.scam.com !!!',
    reason: 'Spam',
    createdAt: '2026-05-15T10:05:00Z',
    gameTitle: 'General'
  },
  {
    id: 3,
    type: 'REVIEW',
    author: 'troll_face',
    content: '1/10 porque no me gusta la cara del protagonista.',
    reason: 'Reseña no constructiva',
    createdAt: '2026-05-15T09:30:00Z',
    gameTitle: 'The Witcher 3'
  },
  {
    id: 4,
    type: 'MESSAGE',
    author: 'angry_user',
    content: 'Te voy a buscar y te voy a matar @otro_usuario',
    reason: 'Acoso/Amenaza',
    createdAt: '2026-05-15T10:10:00Z',
    gameTitle: 'FIFA 26'
  }
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportedItem[]>(mockReports);

  // Protección de ruta a nivel de componente
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return <Navigate to="/" replace />;
  }

  const handleIgnore = (id: number) => {
    setReports(reports.filter(r => r.id !== id));
    alert(`Reporte ${id} ignorado.`);
  };

  const handleDeleteContent = (id: number) => {
    setReports(reports.filter(r => r.id !== id));
    alert(`Contenido del reporte ${id} eliminado.`);
  };

  const handleBanUser = (username: string) => {
    alert(`Usuario ${username} baneado.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-500" />
            Panel de Moderación
          </h1>
          <p className="text-slate-400 mt-1">Gestiona las denuncias de la comunidad y mantén el orden.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-sm text-slate-400">Rol:</span>
            <span className="text-sm font-bold text-indigo-400">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-red-500/20 p-3 rounded-xl">
              <Flag className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full">Pendientes</span>
          </div>
          <p className="text-3xl font-black text-white">{reports.length}</p>
          <p className="text-sm text-slate-400 mt-1">Total de denuncias</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-amber-500/20 p-3 rounded-xl">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">Revisiones</span>
          </div>
          <p className="text-3xl font-black text-white">
            {reports.filter(r => r.type === 'REVIEW').length}
          </p>
          <p className="text-sm text-slate-400 mt-1">Reseñas reportadas</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">Mensajes</span>
          </div>
          <p className="text-3xl font-black text-white">
            {reports.filter(r => r.type === 'MESSAGE').length}
          </p>
          <p className="text-sm text-slate-400 mt-1">Mensajes reportados</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-emerald-500/20 p-3 rounded-xl">
              <Check className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Acciones</span>
          </div>
          <p className="text-3xl font-black text-white">0</p>
          <p className="text-sm text-slate-400 mt-1">Completadas hoy</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Denuncias Pendientes</h2>
        </div>

        <div className="divide-y divide-white/5">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Check className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
              <p className="text-lg font-medium">¡Buen trabajo!</p>
              <p className="text-sm">No hay denuncias pendientes de revisión.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        report.type === 'REVIEW' 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {report.type === 'REVIEW' ? 'Reseña' : 'Mensaje'}
                      </span>
                      <span className="text-sm font-medium text-indigo-400">@{report.author}</span>
                      <span className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleString()}</span>
                      {report.gameTitle && (
                        <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          Juego: {report.gameTitle}
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                      <p className="text-slate-200 text-sm">{report.content}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Razon del reporte: <strong className="font-bold">{report.reason}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 justify-end lg:justify-start shrink-0">
                    <button
                      onClick={() => handleIgnore(report.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                    >
                      <X className="w-4 h-4" />
                      Ignorar
                    </button>
                    <button
                      onClick={() => handleDeleteContent(report.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-lg shadow-red-600/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Contenido
                    </button>
                    <button
                      onClick={() => handleBanUser(report.author)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                    >
                      <UserX className="w-4 h-4" />
                      Banear Usuario
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
