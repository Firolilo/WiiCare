import { useState, useEffect } from 'react';
import { getCaregiverRequests, acceptServiceRequest, rejectServiceRequest } from '../../api/patientManagement';

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getCaregiverRequests(filter);
      setRequests(data.requests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    if (!confirm('¿Aceptar esta solicitud de servicio?')) return;
    
    try {
      await acceptServiceRequest(id);
      loadRequests();
      alert('Solicitud aceptada. Se ha creado el perfil del paciente.');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Error al aceptar la solicitud');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectServiceRequest(id, rejectNotes);
      setRejectingId(null);
      setRejectNotes('');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error al rechazar la solicitud');
    }
  };

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Solicitudes de Servicio</h1>
        
        <div className="flex gap-2 mb-4">
          {['pending', 'accepted', 'rejected', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'pending' ? 'Pendientes' : 
               status === 'accepted' ? 'Aceptadas' :
               status === 'rejected' ? 'Rechazadas' : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay solicitudes {filter === 'pending' ? 'pendientes' : filter}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{request.patient?.name}</h3>
                  <p className="text-gray-600">{request.patient?.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status === 'pending' ? 'Pendiente' :
                   request.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Servicio</p>
                  <p className="font-medium">{request.service?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de paciente</p>
                  <p className="font-medium">{getPatientTypeLabel(request.patientType)}</p>
                </div>
                {request.startDate && (
                  <div>
                    <p className="text-sm text-gray-500">Inicio</p>
                    <p className="font-medium">{new Date(request.startDate).toLocaleDateString()}</p>
                  </div>
                )}
                {request.endDate && (
                  <div>
                    <p className="text-sm text-gray-500">Fin</p>
                    <p className="font-medium">{new Date(request.endDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {request.message && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Mensaje</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.message}</p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => setRejectingId(request._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Rechazar
                  </button>
                </div>
              )}

              {rejectingId === request._id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium mb-2">
                    Motivo del rechazo (opcional)
                  </label>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                    rows="3"
                    placeholder="Explica por qué rechazas esta solicitud..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(request._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Confirmar rechazo
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectNotes('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {request.notes && request.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-50 rounded">
                  <p className="text-sm text-gray-600 mb-1">Motivo del rechazo:</p>
                  <p className="text-gray-700">{request.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
