import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Caregivers from './pages/Caregivers';
import CreateService from './pages/CreateService';
import Chat from './pages/Chat';
import ChatPage from './pages/ChatPage';
import NavBar from './components/NavBar';
import GlobalVideoCallManager from './components/GlobalVideoCallManager';
import { AuthProvider } from './context/AuthContext';
import { VideoCallProvider } from './context/VideoCallContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <VideoCallProvider>
        <div className="h-screen flex flex-col bg-gradient-to-b from-white to-[#f5f0e8] text-gray-900">
        {/* Navbar fijo, altura controlada */}
        <div className="flex-none">
          <NavBar />
        </div>

        {/* Contenido desplazable debajo */}
        <div className="flex-1 overflow-y-auto">
          <main className="w-full h-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/crear-servicio"
                element={
                  <ProtectedRoute>
                    <CreateService />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:conversationId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              {/* Ruta legacy para compatibilidad */}
              <Route
                path="/chat-old/:caregiverId"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil/:id"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cuidadores"
                element={
                  <ProtectedRoute>
                    <Caregivers />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>

        {/* Gestor Global de Videollamadas - Aparece en TODA la app */}
        <GlobalVideoCallManager />
      </div>
      </VideoCallProvider>
    </AuthProvider>
  );
}
