import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { createServiceRequest } from '../api/patientManagement';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // Modal de solicitud
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [requestForm, setRequestForm] = useState({
    patientType: 'elderly',
    message: '',
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

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
    // Abrir modal de solicitud en lugar de ir directo al chat
    setSelectedService(service);
    setRequestForm({
      patientType: 'elderly',
      message: `Hola, me interesa tu servicio "${service.title}". ¿Podrías darme más información?`,
      startDate: '',
      endDate: ''
    });
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedService) return;
    
    setSubmitting(true);
    try {
      // 1. Crear la solicitud de servicio
      await createServiceRequest({
        caregiver: selectedService.caregiver._id,
        service: selectedService._id,
        patientType: requestForm.patientType,
        message: requestForm.message,
        startDate: requestForm.startDate || undefined,
        endDate: requestForm.endDate || undefined
      });

      // 2. También crear/abrir conversación con mensaje
      const res = await api.get(`/chat/with/${selectedService.caregiver._id}`);
      const conversationId = res.data.conversation._id;
      
      await api.post('/chat/message', {
        conversationId: conversationId,
        content: requestForm.message
      });
      
      setShowRequestModal(false);
      setSelectedService(null);
      
      // Preguntar si quiere ir al chat
      if (confirm('¡Solicitud enviada! El cuidador será notificado. ¿Deseas ir al chat?')) {
        navigate(`/chat/${conversationId}`);
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert(error.response?.data?.message || 'Error al enviar la solicitud. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const patientTypes = [
    { value: 'elderly', label: 'Adulto Mayor', icon: 'bi-person-fill', description: 'Cuidado para personas de tercera edad' },
    { value: 'child', label: 'Niño/a', icon: 'bi-emoji-smile-fill', description: 'Cuidado infantil especializado' },
    { value: 'disability', label: 'Discapacidad', icon: 'bi-heart-pulse-fill', description: 'Asistencia para personas con discapacidad' },
    { value: 'post-surgery', label: 'Post-operatorio', icon: 'bi-hospital-fill', description: 'Recuperación después de cirugía' },
    { value: 'temporary', label: 'Temporal', icon: 'bi-clock-fill', description: 'Cuidado por tiempo limitado' }
  ];

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
                            className="flex-1 bg-[#5B8BBE] hover:bg-[#3A6EA5] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
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
                    <p className="text-sm text-[#A8C5DB]">
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

      {/* Modal de Solicitud de Servicio */}
      {showRequestModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3A6EA5] to-[#5B8BBE] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Solicitar Servicio</h2>
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                {selectedService.title} - {selectedService.caregiver?.name}
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5">
              {/* Tipo de Paciente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de cuidado que necesitas *
                </label>
                <div className="grid gap-2">
                  {patientTypes.map((type) => (
                    <label 
                      key={type.value}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        requestForm.patientType === type.value 
                          ? 'border-[#3A6EA5] bg-[#f5f0e8]' 
                          : 'border-[#e6e0d2] hover:border-[#5B8BBE]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="patientType"
                        value={type.value}
                        checked={requestForm.patientType === type.value}
                        onChange={(e) => setRequestForm({...requestForm, patientType: e.target.value})}
                        className="sr-only"
                      />
                      <i className={`bi ${type.icon} text-2xl mr-3 text-[#3A6EA5]`}></i>
                      <div>
                        <p className="font-medium text-gray-800">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                      {requestForm.patientType === type.value && (
                        <i className="bi bi-check-circle-fill text-[#3A6EA5] ml-auto text-xl"></i>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha inicio (opcional)
                  </label>
                  <input
                    type="date"
                    value={requestForm.startDate}
                    onChange={(e) => setRequestForm({...requestForm, startDate: e.target.value})}
                    className="w-full p-3 border border-[#e6e0d2] rounded-lg focus:ring-2 focus:ring-[#3A6EA5] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha fin (opcional)
                  </label>
                  <input
                    type="date"
                    value={requestForm.endDate}
                    onChange={(e) => setRequestForm({...requestForm, endDate: e.target.value})}
                    className="w-full p-3 border border-[#e6e0d2] rounded-lg focus:ring-2 focus:ring-[#3A6EA5] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mensaje para el cuidador
                </label>
                <textarea
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-[#e6e0d2] rounded-lg focus:ring-2 focus:ring-[#3A6EA5] focus:border-transparent resize-none"
                  placeholder="Describe brevemente lo que necesitas..."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 border border-[#e6e0d2] text-[#2B4C7E] rounded-lg hover:bg-[#f5f0e8] font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <i className="bi bi-arrow-repeat animate-spin"></i>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill"></i>
                      Enviar Solicitud
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
