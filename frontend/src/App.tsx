import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Catalog from './pages/Catalog';
import GameDetail from './pages/GameDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Communities from './pages/Communities';
import CommunityRoom from './pages/CommunityRoom';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import { NotificationProvider } from './context/NotificationContext';
import { CommunityProvider } from './context/CommunityContext';
import ChatWidget from './components/chat/ChatWidget';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <CommunityProvider>
          <Routes>
            {/* Rutas dentro del layout principal (con navbar/footer) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Catalog />} />
              <Route path="games/:id" element={<GameDetail />} />
              <Route path="profile/:username" element={<Profile />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              {/* Hub de comunidades (dentro del layout normal) */}
              <Route path="communities" element={<Communities />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:username" element={<Messages />} />
            </Route>

            {/* Sala de comunidad: pantalla completa, sin layout estándar */}
            <Route path="/communities/:gameId" element={<CommunityRoom />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* El ChatWidget solo se muestra fuera de /communities/:gameId */}
          <ChatWidget />
        </CommunityProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;
