import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    const endpoint = user?.role === 'caregiver' 
      ? `/services?caregiver=${user._id}` 
      : '/services';
    
    api
      .get(endpoint)
      .then((res) => {
        const servicesData = res.data.services || [];
        console.log('Servicios recibidos:', servicesData);
        // Solo usar el caregiver si existe y tiene _id
        const servicesWithCaregiver = servicesData.map(service => {
          if (service.caregiver && service.caregiver._id) {
            return service;
          }
          // Si no hay caregiver válido, no agregamos mock
          return {
            ...service,
            caregiver: null
          };
        });
        setServices(servicesWithCaregiver);
      })
      .catch((error) => {
        console.error('Error al cargar servicios:', error);
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSelectService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const isServiceSelected = (serviceId) => {
    return selectedServices.includes(serviceId);
  };

  const handleStartChat = async (service) => {
    try {
      // Crear o obtener conversación con el caregiver
      const res = await api.get(`/chat/with/${service.caregiver._id}`);
      const conversationId = res.data.conversation._id;
      
      // Crear mensaje inicial automático
      const initialMessage = `Hola, me interesa tu servicio "${service.title}". ¿Podrías darme más información?`;
      
      await api.post('/chat/message', {
        conversationId: conversationId,
        content: initialMessage
      });
      
      // Navegar al chat
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error al iniciar chat:', error);
      alert('Error al abrir el chat. Intenta nuevamente.');
    }
  };

  if (loading)
    return (
      <section className="flex justify-center items-center min-h-[calc(95vh-80px)] text-[#2B4C7E]">
        <p className="text-lg font-medium animate-pulse">Cargando servicios...</p>
      </section>
    );

  return (
    <section className="min-h-full flex flex-col items-center justify-start text-center px-6 py-10 bg-gradient-to-b from-white to-[#f5f0e8]">
      <div className="max-w-5xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2B4C7E]">
            {user?.role === 'caregiver' ? 'Mis Servicios' : 'Servicios disponibles'}
          </h1>
          
          {/* Botón solo visible para cuidadores */}
          {user?.role === 'caregiver' && (
            <button
              onClick={() => navigate('/crear-servicio')}
              className="bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-6 py-2.5 rounded-lg transition-all shadow-sm font-medium flex items-center gap-2"
            >
              <i className="bi bi-plus-circle"></i>
              Crear Servicio
            </button>
          )}
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-[#e6e0d2] p-12">
            <p className="text-gray-600 text-lg mb-4">
              {user?.role === 'caregiver' 
                ? 'Aún no has creado ningún servicio.' 
                : 'No hay servicios disponibles en este momento.'}
            </p>
            {user?.role === 'caregiver' && (
              <button
                onClick={() => navigate('/crear-servicio')}
                className="bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-6 py-2.5 rounded-lg transition-all shadow-sm font-medium inline-block"
              >
                Crear mi primer servicio
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <li
                  key={s._id}
                  className={`bg-white rounded-2xl shadow-sm border p-5 text-left transition-all ${
                    isServiceSelected(s._id) 
                      ? 'border-[#3A6EA5] ring-2 ring-[#3A6EA5]/20' 
                      : 'border-[#e6e0d2] hover:shadow-md'
                  }`}
                >
                  {/* Información del Cuidador - solo mostrar si existe */}
                  {s.caregiver && s.caregiver._id && (
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 bg-[#3A6EA5] rounded-full flex items-center justify-center text-white font-bold">
                        {s.caregiver.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#2B4C7E] truncate">
                          {s.caregiver.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {s.caregiver.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <h3 className="font-semibold text-lg text-[#2B4C7E] mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {s.description}
                  </p>
                  
                  {s.location && (
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <i className="bi bi-geo-alt-fill"></i> {s.location}
                    </p>
                  )}
                  
                  {s.tags && s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {s.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-[#f5f0e8] text-[#2B4C7E] px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Tarifa: <span className="font-bold text-[#2B4C7E]">{s.rate} Bs/h</span>
                      </p>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      {/* Botones para PACIENTES */}
                      {user?.role === 'user' && (
                        <>
                          {/* Botón "Me interesa..." */}
                          {s.caregiver?._id && (
                            <button
                              onClick={() => handleStartChat(s)}
                              className="flex-1 bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                              data-cy={`chat-service-${s._id}`}
                            >
                              <i className="bi bi-chat-dots-fill"></i>
                              Me interesa...
                            </button>
                          )}
                        </>
                      )}

                      {/* Botones para CUIDADORES (sus propios servicios) */}
                      {user?.role === 'caregiver' && (
                        <>
                          <button
                            onClick={() => {
                              // TODO: Implementar edición de servicio
                              alert('Función de editar próximamente');
                            }}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <i className="bi bi-pencil-square"></i>
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de eliminar este servicio?')) {
                                api.delete(`/services/${s._id}`)
                                  .then(() => {
                                    setServices(services.filter(service => service._id !== s._id));
                                  })
                                  .catch((error) => {
                                    console.error('Error al eliminar servicio:', error);
                                    alert('Error al eliminar el servicio');
                                  });
                              }
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                          >
                            <i className="bi bi-trash"></i>
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Resumen de servicios seleccionados */}
            {user?.role === 'user' && selectedServices.length > 0 && (
              <div className="mt-8 bg-[#3A6EA5] text-white rounded-xl shadow-lg p-6 sticky bottom-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">
                      {selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''} seleccionado{selectedServices.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-blue-100">
                      Continúa para contactar con los cuidadores
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Implementar lógica de contacto/solicitud
                      alert(`Has seleccionado ${selectedServices.length} servicio(s). Esta funcionalidad se implementará próximamente.`);
                    }}
                    className="bg-white text-[#3A6EA5] hover:bg-gray-100 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
