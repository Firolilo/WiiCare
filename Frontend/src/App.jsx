import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Caregivers from './pages/Caregivers';
import CreateService from './pages/CreateService';
import Chat from './pages/Chat';
import NavBar from './components/NavBar';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <div className="h-screen flex flex-col bg-gradient-to-b from-white to-[#f5f0e8] text-gray-900">
        {/* Navbar fijo, altura controlada */}
        <div className="flex-none">
          <NavBar />
        </div>

        {/* Contenido desplazable debajo */}
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-5xl mx-auto p-6 pt-6">
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
                path="/chat/:caregiverId"
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
      </div>
    </AuthProvider>
  );
}
