import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Caregivers from './pages/Caregivers';
import CreateService from './pages/CreateService';
import Chat from './pages/Chat';
import ChatPage from './pages/ChatPage';
import ForceSensor from './pages/ForceSensor';
import PatientForceAnalysis from './pages/PatientForceAnalysis';
import NavBar from './components/NavBar';
import GlobalVideoCallManager from './components/GlobalVideoCallManager';
import { AuthProvider } from './context/AuthContext';
import { VideoCallProvider } from './context/VideoCallContext';
import ProtectedRoute from './components/ProtectedRoute';

// Caregiver components
import ServiceRequests from './components/caregiver/ServiceRequests';
import PatientList from './components/caregiver/PatientList';
import PatientDashboard from './components/caregiver/PatientDashboard';
import SensorMonitor from './components/caregiver/SensorMonitor';

// Patient components
import PatientCareView from './components/patient/PatientCareView';

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
              
              {/* Rutas de Cuidador - Gestión de Pacientes */}
              <Route
                path="/solicitudes"
                element={
                  <ProtectedRoute>
                    <ServiceRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mis-pacientes"
                element={
                  <ProtectedRoute>
                    <PatientList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/paciente/:patientProfileId"
                element={
                  <ProtectedRoute>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/paciente/:patientProfileId/sensor"
                element={
                  <ProtectedRoute>
                    <SensorMonitor />
                  </ProtectedRoute>
                }
              />
              
              {/* Ruta de Paciente - Ver mi cuidado */}
              <Route
                path="/mi-cuidado"
                element={
                  <ProtectedRoute>
                    <PatientCareView />
                  </ProtectedRoute>
                }
              />
              
              {/* Ruta del Sensor de Fuerza - Arduino */}
              <Route
                path="/sensor-fuerza"
                element={
                  <ProtectedRoute>
                    <ForceSensor />
                  </ProtectedRoute>
                }
              />
              
              {/* Análisis de fuerza del paciente - Para cuidadores */}
              <Route
                path="/paciente/:patientId/analisis-fuerza"
                element={
                  <ProtectedRoute>
                    <PatientForceAnalysis />
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
