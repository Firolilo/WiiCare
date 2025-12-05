import { useState, useEffect } from 'react';
import { getMyCareDashboard } from '../../api/patientManagement';
import RatingComponent from '../RatingComponent';

export default function PatientCareView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboard = await getMyCareDashboard();
      setData(dashboard);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando tu información de cuidado...</div>;
  }

  if (!data || !data.profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">No tienes un cuidador asignado actualmente</p>
          <p className="text-gray-600">Solicita un servicio de cuidado para comenzar</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: 'bi-grid-1x2' },
    { id: 'daily-care', label: 'Cuidados Diarios', icon: 'bi-clipboard-check', count: data.dailyCare?.length },
    { id: 'medications', label: 'Medicamentos', icon: 'bi-capsule', count: data.medications?.length },
    { id: 'recommendations', label: 'Recomendaciones', icon: 'bi-lightbulb', count: data.recommendations?.length },
    { id: 'appointments', label: 'Citas', icon: 'bi-calendar-event', count: data.appointments?.length },
    { id: 'incidents', label: 'Historial', icon: 'bi-exclamation-triangle', count: data.incidents?.length },
    { id: 'health', label: 'Salud', icon: 'bi-heart-pulse' },
    { id: 'care-plans', label: 'Plan de Cuidado', icon: 'bi-bullseye', count: data.carePlans?.length },
  ];

  const getPatientTypeLabel = (type) => {
    const labels = {
      'elderly': 'Adulto mayor',
      'child': 'Niño',
      'disability': 'Discapacidad',
      'post-surgery': 'Post-operatorio',
      'temporary': 'Temporal/Emergencia'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3A6EA5] to-[#5B8BBE] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Mi Panel de Cuidado</h1>
            {data.profile.caregiver && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow-lg"
              >
                <i className="bi bi-star-fill"></i>
                Calificar a mi Cuidador
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-full px-4 py-2">
              <p className="text-sm">Tu Cuidador</p>
              <p className="font-semibold text-lg">{data.profile.caregiver?.name}</p>
            </div>
            <div className="bg-white/20 rounded-full px-4 py-2">
              <p className="text-sm">Tipo de Cuidado</p>
              <p className="font-semibold">{getPatientTypeLabel(data.profile.patientType)}</p>
            </div>
            {data.profile.careTemplate && (
              <div className="bg-white/20 rounded-full px-4 py-2">
                <p className="text-sm">Plantilla</p>
                <p className="font-semibold">{data.profile.careTemplate.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className={`bi ${tab.icon} mr-2`}></i>
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Tareas Hoy</h3>
                  <i className="bi bi-clipboard-check text-3xl text-blue-500"></i>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {data.dailyCare?.filter(t => {
                    const today = new Date().toDateString();
                    return new Date(t.date).toDateString() === today && !t.completed;
                  }).length || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">Pendientes</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Medicamentos</h3>
                  <i className="bi bi-capsule text-3xl text-[#7DA5C8]"></i>
                </div>
                <p className="text-3xl font-bold text-[#3A6EA5]">{data.medications?.length || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Activos</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Próximas Citas</h3>
                  <i className="bi bi-calendar-event text-3xl text-[#5B8BBE]"></i>
                </div>
                <p className="text-3xl font-bold text-[#2B4C7E]">{data.appointments?.length || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Programadas</p>
              </div>
            </div>

            {/* Recomendaciones destacadas */}
            {data.recommendations?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4"><i className="bi bi-lightbulb mr-2"></i>Recomendaciones de tu Cuidador</h3>
                <div className="space-y-3">
                  {data.recommendations.slice(0, 3).map((rec) => (
                    <div key={rec._id} className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-700">{rec.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Próximas citas */}
            {data.appointments?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4"><i className="bi bi-calendar-event mr-2"></i>Próximas Citas</h3>
                <div className="space-y-3">
                  {data.appointments.slice(0, 3).map((apt) => (
                    <div key={apt._id} className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold mb-1">{apt.title}</h4>
                      <p className="text-sm text-gray-600"><i className="bi bi-calendar3 mr-1"></i>{new Date(apt.startTime).toLocaleString()}</p>
                      {apt.location && <p className="text-sm text-gray-600"><i className="bi bi-geo-alt mr-1"></i>{apt.location}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'daily-care' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Cuidados Diarios</h2>
            {data.dailyCare?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay tareas registradas</p>
            ) : (
              data.dailyCare?.map((task) => (
                <div key={task._id} className={`bg-white rounded-lg shadow p-4 ${task.completed ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {task.completed && <i className="bi bi-check-circle-fill text-green-600"></i>}
                        <h4 className="font-semibold">{task.task}</h4>
                      </div>
                      {task.description && <p className="text-sm text-gray-600 mb-2">{task.description}</p>}
                      <p className="text-xs text-gray-500">
                        {new Date(task.date).toLocaleDateString()}
                        {task.scheduledTime && ` • ${task.scheduledTime}`}
                      </p>
                      {task.notes && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <p className="text-blue-900"><strong>Notas:</strong> {task.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Mis Medicamentos</h2>
            {data.medications?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay medicamentos registrados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.medications?.map((med) => (
                  <div key={med._id} className="bg-white rounded-lg shadow p-6 border border-[#e6e0d2]">
                    <h4 className="text-xl font-semibold mb-2"><i className="bi bi-capsule mr-2 text-[#3A6EA5]"></i>{med.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Dosis:</strong> {med.dose} | <strong>Frecuencia:</strong> {med.frequency}
                    </p>
                    {med.instructions && (
                      <div className="p-3 bg-blue-50 rounded mb-2">
                        <p className="text-sm text-blue-900"><strong>Instrucciones:</strong> {med.instructions}</p>
                      </div>
                    )}
                    {med.sideEffects && (
                      <div className="p-3 bg-yellow-50 rounded">
                        <p className="text-sm text-yellow-900"><i className="bi bi-exclamation-triangle-fill mr-1"></i><strong>Efectos secundarios:</strong> {med.sideEffects}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recomendaciones</h2>
            {data.recommendations?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay recomendaciones</p>
            ) : (
              <div className="space-y-4">
                {data.recommendations?.map((rec) => (
                  <div key={rec._id} className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-lg mb-2">{rec.title}</h4>
                    <p className="text-gray-700">{rec.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Mis Citas</h2>
            {data.appointments?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay citas programadas</p>
            ) : (
              <div className="space-y-4">
                {data.appointments?.map((apt) => (
                  <div key={apt._id} className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-lg mb-2"><i className="bi bi-calendar-event mr-2 text-green-600"></i>{apt.title}</h4>
                    {apt.description && <p className="text-gray-700 mb-2">{apt.description}</p>}
                    <p className="text-sm text-gray-600 mb-1"><i className="bi bi-clock mr-1"></i>{new Date(apt.startTime).toLocaleString()}</p>
                    {apt.location && <p className="text-sm text-gray-600"><i className="bi bi-geo-alt mr-1"></i>{apt.location}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'incidents' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Historial de Incidentes</h2>
            {data.incidents?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay incidentes registrados</p>
            ) : (
              <div className="space-y-4">
                {data.incidents?.map((inc) => (
                  <div key={inc._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{inc.title}</h4>
                      {inc.resolved && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"><i className="bi bi-check-circle-fill mr-1"></i>Resuelto</span>}
                    </div>
                    <p className="text-gray-700 mb-2">{inc.description}</p>
                    <p className="text-sm text-gray-600"><i className="bi bi-calendar3 mr-1"></i>{new Date(inc.occurredAt).toLocaleString()}</p>
                    {inc.actionsTaken && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-900"><strong>Acciones tomadas:</strong> {inc.actionsTaken}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Indicadores de Salud</h2>
            {data.healthIndicators?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay indicadores registrados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.healthIndicators?.slice(0, 12).map((ind) => (
                  <div key={ind._id} className={`rounded-lg shadow p-4 ${ind.isAbnormal ? 'bg-red-50' : 'bg-white'}`}>
                    <h4 className="font-semibold mb-1">{ind.type}</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-1">{ind.value} {ind.unit}</p>
                    <p className="text-xs text-gray-600">{new Date(ind.measuredAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'care-plans' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Mi Plan de Cuidado</h2>
            {data.carePlans?.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No hay planes de cuidado activos</p>
            ) : (
              <div className="space-y-6">
                {data.carePlans?.map((plan) => {
                  const progress = plan.goals.length > 0 ? (plan.goals.filter(g => g.achieved).length / plan.goals.length) * 100 : 0;
                  return (
                    <div key={plan._id} className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-xl font-bold mb-2"><i className="bi bi-bullseye mr-2 text-blue-600"></i>{plan.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </p>
                      {plan.description && <p className="text-gray-700 mb-4">{plan.description}</p>}
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progreso</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {plan.goals.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Objetivos:</h4>
                          <ul className="space-y-2">
                            {plan.goals.map((goal) => (
                              <li key={goal._id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                                <i className={`bi ${goal.achieved ? 'bi-check-circle-fill text-green-600' : 'bi-circle text-gray-400'} text-xl`}></i>
                                <div>
                                  <p className={goal.achieved ? 'line-through text-gray-500' : ''}>{goal.description}</p>
                                  {goal.achieved && (
                                    <p className="text-xs text-green-600">Logrado el {new Date(goal.achievedDate).toLocaleDateString()}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Calificación */}
      {showRatingModal && data.profile.caregiver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3A6EA5] to-[#5B8BBE] text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <i className="bi bi-star-fill"></i>
                  Calificar a tu Cuidador
                </h2>
                <button 
                  onClick={() => setShowRatingModal(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <p className="text-[#A8C5DB] text-sm mt-1">
                Comparte tu experiencia con {data.profile.caregiver.name}
              </p>
            </div>

            {/* Rating Component */}
            <div className="p-6">
              <RatingComponent
                caregiverId={data.profile.caregiver._id}
                caregiverName={data.profile.caregiver.name}
                showTitle={false}
                onReviewSubmitted={() => {
                  setTimeout(() => setShowRatingModal(false), 1500);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
