import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCaregiverDashboardStats } from '../api/reviews';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Cargar estadísticas del cuidador
  useEffect(() => {
    if (user?.role === 'caregiver') {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getCaregiverDashboardStats();
      setDashboardStats(data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Landing page para usuarios NO autenticados
  if (!user) {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#f8f9fa] via-white to-[#f5f0e8]">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-extrabold text-[#2B4C7E] mb-6 leading-tight">
              Bienvenido a <span className="text-[#3A6EA5]">WiiCare</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              La plataforma que conecta <span className="font-bold text-[#2B4C7E]">cuidadores profesionales</span> con 
              <span className="font-bold text-[#2B4C7E]"> personas con necesidades especiales</span>.
            </p>
          </div>

          {/* Cards de características */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-[#3A6EA5] hover:shadow-xl transition-all">
              <div className="text-5xl mb-4 text-[#3A6EA5]"><i className="bi bi-people-fill"></i></div>
              <h3 className="text-2xl font-bold text-[#2B4C7E] mb-3">Conecta</h3>
              <p className="text-gray-600">Encuentra cuidadores certificados cerca de ti con experiencia en diferentes necesidades</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-[#5B8BBE] hover:shadow-xl transition-all">
              <div className="text-5xl mb-4 text-[#5B8BBE]"><i className="bi bi-chat-dots-fill"></i></div>
              <h3 className="text-2xl font-bold text-[#2B4C7E] mb-3">Comunica</h3>
              <p className="text-gray-600">Chat directo con cuidadores para coordinar servicios y resolver dudas</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-[#7DA5C8] hover:shadow-xl transition-all">
              <div className="text-5xl mb-4 text-[#7DA5C8]"><i className="bi bi-star-fill"></i></div>
              <h3 className="text-2xl font-bold text-[#2B4C7E] mb-3">Confía</h3>
              <p className="text-gray-600">Sistema de reseñas y verificación para garantizar servicios de calidad</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#3A6EA5] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#2B4C7E] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <i className="bi bi-search"></i>
                Buscar Cuidadores
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="border-2 border-[#3A6EA5] text-[#3A6EA5] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#3A6EA5] hover:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <i className="bi bi-briefcase"></i>
                Ofrecer Servicios
              </button>
            </div>
            <p className="text-gray-500 text-sm">¿Ya tienes cuenta? <button onClick={() => navigate('/login')} className="text-[#3A6EA5] font-semibold hover:underline">Inicia sesión</button></p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#2B4C7E] text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">500+</div>
                <div className="text-blue-200 text-lg">Cuidadores Certificados</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">1,200+</div>
                <div className="text-blue-200 text-lg">Familias Atendidas</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">98%</div>
                <div className="text-blue-200 text-lg">Satisfacción</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Dashboard para USUARIO (paciente)
  if (user.role === 'user') {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-white to-[#f5f0e8] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#3A6EA5] to-[#5B8BBE] rounded-2xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">¡Hola, {user.name}! <i className="bi bi-hand-wave-fill"></i></h1>
            <p className="text-blue-100 text-lg">Encuentra el cuidado perfecto para ti o tus seres queridos</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#3A6EA5] group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-search"></i></div>
              <h3 className="font-bold text-[#2B4C7E] text-lg mb-1">Explorar Servicios</h3>
              <p className="text-gray-600 text-sm">Ver todos los cuidadores disponibles</p>
            </button>

            <button 
              onClick={() => navigate('/perfil')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#3A6EA5] group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-person-circle"></i></div>
              <h3 className="font-bold text-[#2B4C7E] text-lg mb-1">Mi Perfil</h3>
              <p className="text-gray-600 text-sm">Actualizar información personal</p>
            </button>

            <button 
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#3A6EA5] group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-chat-dots"></i></div>
              <h3 className="font-bold text-[#2B4C7E] text-lg mb-1">Mis Chats</h3>
              <p className="text-gray-600 text-sm">Conversaciones activas</p>
            </button>

            <button 
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#3A6EA5] group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-calendar-check"></i></div>
              <h3 className="font-bold text-[#2B4C7E] text-lg mb-1">Mis Reservas</h3>
              <p className="text-gray-600 text-sm">Servicios programados</p>
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border-l-4 border-[#3A6EA5] rounded-xl p-6">
              <h3 className="font-bold text-[#2B4C7E] text-xl mb-3 flex items-center gap-2"><i className="bi bi-lightbulb"></i> Consejos para elegir</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#3A6EA5]"><i className="bi bi-check-circle-fill"></i></span>
                  <span>Revisa las reseñas y calificaciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3A6EA5]"><i className="bi bi-check-circle-fill"></i></span>
                  <span>Verifica la experiencia en tu necesidad específica</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3A6EA5]"><i className="bi bi-check-circle-fill"></i></span>
                  <span>Usa el chat para hacer preguntas antes de contratar</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6">
              <h3 className="font-bold text-green-700 text-xl mb-3 flex items-center gap-2"><i className="bi bi-gift"></i> Bienvenido a WiiCare</h3>
              <p className="text-gray-700 mb-3">Estamos aquí para ayudarte a encontrar el cuidado que necesitas.</p>
              <button className="text-green-700 font-semibold hover:underline flex items-center gap-1">Ver guía de uso <i className="bi bi-arrow-right"></i></button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Dashboard para CAREGIVER (cuidador)
  if (user.role === 'caregiver') {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-white to-[#f0f8ff] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#5B8BBE] to-[#3A6EA5] rounded-2xl shadow-xl p-8 mb-8 text-white">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">¡Bienvenido, {user.name}! <i className="bi bi-briefcase-fill"></i></h1>
            <p className="text-blue-100 text-lg">Gestiona tus servicios y conecta con más familias</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button 
              onClick={() => navigate('/crear-servicio')}
              className="bg-gradient-to-br from-[#3A6EA5] to-[#5B8BBE] text-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-3"><i className="bi bi-plus-circle"></i></div>
              <h3 className="font-bold text-lg mb-1">Crear Servicio</h3>
              <p className="text-blue-100 text-sm">Publica un nuevo servicio</p>
            </button>

            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#3A6EA5] group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-list-check"></i></div>
              <h3 className="font-bold text-[#2B4C7E] text-lg mb-1">Mis Servicios</h3>
              <p className="text-gray-600 text-sm">Ver y editar publicaciones</p>
            </button>

            <button 
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#3A6EA5] group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-chat-left-text"></i></div>
              <h3 className="font-bold text-[#2B4C7E] text-lg mb-1">Mensajes</h3>
              <p className="text-gray-600 text-sm">Responder consultas</p>
            </button>

            <button 
              onClick={() => navigate('/perfil')}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-[#3A6EA5] group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-star-fill"></i></div>
              <h3 className="font-bold text-[#2B4C7E] text-lg mb-1">Mi Perfil</h3>
              <p className="text-gray-600 text-sm">Perfil y reseñas</p>
            </button>
          </div>

          {/* Stats Dashboard */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#3A6EA5]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#2B4C7E] font-medium">Servicios Activos</span>
                <span className="text-3xl text-[#3A6EA5]"><i className="bi bi-bar-chart-fill"></i></span>
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-[#f5f0e8] rounded w-16"></div>
              ) : (
                <div className="text-3xl font-bold text-[#2B4C7E]">{dashboardStats?.activeServices || 0}</div>
              )}
              <div className="text-sm text-[#5B8BBE] mt-1">Servicios publicados</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#5B8BBE]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#2B4C7E] font-medium">Solicitudes Nuevas</span>
                <span className="text-3xl text-[#5B8BBE]"><i className="bi bi-chat-dots-fill"></i></span>
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-[#f5f0e8] rounded w-16"></div>
              ) : (
                <div className="text-3xl font-bold text-[#2B4C7E]">{dashboardStats?.newRequests || 0}</div>
              )}
              <div className="text-sm text-[#3A6EA5] mt-1">Pendientes de respuesta</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#7DA5C8]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#2B4C7E] font-medium">Calificación</span>
                <span className="text-3xl text-yellow-500"><i className="bi bi-star-fill"></i></span>
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-8 bg-[#f5f0e8] rounded w-16"></div>
              ) : (
                <div className="text-3xl font-bold text-[#2B4C7E]">
                  {dashboardStats?.averageRating?.toFixed(1) || 'N/A'}
                </div>
              )}
              <div className="text-sm text-[#5B8BBE] mt-1">{dashboardStats?.totalReviews || 0} reseñas</div>
            </div>
          </div>

          {/* Tips for Caregivers */}
          <div className="bg-gradient-to-r from-[#f5f0e8] to-[#faf8f5] border-l-4 border-[#3A6EA5] rounded-xl p-6">
            <h3 className="font-bold text-[#2B4C7E] text-xl mb-3 flex items-center gap-2"><i className="bi bi-lightbulb"></i> Consejos para destacar</h3>
            <ul className="space-y-2 text-[#2B4C7E]">
              <li className="flex items-start gap-2">
                <span className="text-[#3A6EA5]"><i className="bi bi-check-circle-fill"></i></span>
                <span>Actualiza tus servicios regularmente con fotos y descripciones claras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#3A6EA5]"><i className="bi bi-check-circle-fill"></i></span>
                <span>Responde rápido a los mensajes (menos de 2 horas)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#3A6EA5]"><i className="bi bi-check-circle-fill"></i></span>
                <span>Pide reseñas a tus clientes satisfechos</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  // Dashboard para ADMIN
  if (user.role === 'admin') {
    return (
      <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#2B4C7E] via-[#3A6EA5] to-[#2B4C7E] px-6 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Admin Header */}
          <div className="bg-gradient-to-r from-[#1a3a5c] to-[#2B4C7E] rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 text-9xl"><i className="bi bi-shield-fill-check"></i></div>
            <h1 className="text-5xl font-extrabold mb-2 relative z-10">Panel de Administración</h1>
            <p className="text-[#A8C5DB] text-xl relative z-10">Bienvenido, {user.name} | Control total de WiiCare</p>
          </div>

          {/* Admin Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all border-t-4 border-[#3A6EA5]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-5xl text-[#3A6EA5]"><i className="bi bi-people-fill"></i></div>
                <div className="bg-[#f5f0e8] text-[#2B4C7E] rounded-full px-3 py-1 text-sm font-medium">+12%</div>
              </div>
              <div className="text-3xl font-bold mb-1 text-[#2B4C7E]">1,247</div>
              <div className="text-[#5B8BBE]">Usuarios Totales</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all border-t-4 border-[#5B8BBE]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-5xl text-[#5B8BBE]"><i className="bi bi-briefcase-fill"></i></div>
                <div className="bg-[#f5f0e8] text-[#2B4C7E] rounded-full px-3 py-1 text-sm font-medium">+8%</div>
              </div>
              <div className="text-3xl font-bold mb-1 text-[#2B4C7E]">532</div>
              <div className="text-[#5B8BBE]">Cuidadores Activos</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all border-t-4 border-[#7DA5C8]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-5xl text-[#7DA5C8]"><i className="bi bi-clipboard-check-fill"></i></div>
                <div className="bg-[#f5f0e8] text-[#2B4C7E] rounded-full px-3 py-1 text-sm font-medium">+24</div>
              </div>
              <div className="text-3xl font-bold mb-1 text-[#2B4C7E]">89</div>
              <div className="text-[#5B8BBE]">Servicios Publicados</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all border-t-4 border-[#A8C5DB]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-5xl text-[#A8C5DB]"><i className="bi bi-chat-left-dots-fill"></i></div>
                <div className="bg-[#f5f0e8] text-[#2B4C7E] rounded-full px-3 py-1 text-sm font-medium">Live</div>
              </div>
              <div className="text-3xl font-bold mb-1 text-[#2B4C7E]">342</div>
              <div className="text-[#5B8BBE]">Conversaciones Activas</div>
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <button className="bg-white/90 backdrop-blur-md border border-[#e6e0d2] rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-person-lines-fill"></i></div>
              <h3 className="font-bold text-lg mb-1 text-[#2B4C7E]">Gestionar Usuarios</h3>
              <p className="text-[#5B8BBE] text-sm">Ver, editar y eliminar usuarios</p>
            </button>

            <button className="bg-white/90 backdrop-blur-md border border-[#e6e0d2] rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-gear-fill"></i></div>
              <h3 className="font-bold text-lg mb-1 text-[#2B4C7E]">Configuración</h3>
              <p className="text-[#5B8BBE] text-sm">Ajustes de la plataforma</p>
            </button>

            <button className="bg-white/90 backdrop-blur-md border border-[#e6e0d2] rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-[#3A6EA5]"><i className="bi bi-graph-up"></i></div>
              <h3 className="font-bold text-lg mb-1 text-[#2B4C7E]">Reportes</h3>
              <p className="text-[#5B8BBE] text-sm">Analíticas y estadísticas</p>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#e6e0d2]">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[#2B4C7E]">
              <i className="bi bi-bell-fill text-[#3A6EA5]"></i> Actividad Reciente
            </h3>
            <div className="space-y-3">
              <div className="bg-[#faf8f5] rounded-lg p-4 hover:bg-[#f5f0e8] transition-all border border-[#e6e0d2]">
                <div className="flex items-center justify-between">
                  <div className="text-[#2B4C7E]">
                    <span className="font-semibold">Nuevo usuario registrado:</span> María González
                  </div>
                  <span className="text-sm text-[#7DA5C8]">Hace 5 min</span>
                </div>
              </div>
              <div className="bg-[#faf8f5] rounded-lg p-4 hover:bg-[#f5f0e8] transition-all border border-[#e6e0d2]">
                <div className="flex items-center justify-between">
                  <div className="text-[#2B4C7E]">
                    <span className="font-semibold">Servicio publicado:</span> Cuidado de adultos mayores
                  </div>
                  <span className="text-sm text-[#7DA5C8]">Hace 12 min</span>
                </div>
              </div>
              <div className="bg-[#faf8f5] rounded-lg p-4 hover:bg-[#f5f0e8] transition-all border border-[#e6e0d2]">
                <div className="flex items-center justify-between">
                  <div className="text-[#2B4C7E]">
                    <span className="font-semibold">Reseña nueva:</span> <i className="bi bi-star-fill text-yellow-400"></i><i className="bi bi-star-fill text-yellow-400"></i><i className="bi bi-star-fill text-yellow-400"></i><i className="bi bi-star-fill text-yellow-400"></i><i className="bi bi-star-fill text-yellow-400"></i> por Juan Pérez
                  </div>
                  <span className="text-sm text-[#7DA5C8]">Hace 1 hora</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback
  return (
    <section className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#2B4C7E] mb-3">Rol no reconocido</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#3A6EA5] text-white px-6 py-2 rounded-lg hover:bg-[#2B4C7E] transition"
        >
          Ir al Dashboard
        </button>
      </div>
    </section>
  );
}