import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCaregiverPatients } from '../../api/patientManagement';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('true'); // active by default

  useEffect(() => {
    loadPatients();
  }, [filter]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getCaregiverPatients(filter);
      setPatients(data.patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
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

  const getPatientTypeColor = (type) => {
    const colors = {
      'elderly': 'bg-[#A8C5DB] text-[#2B4C7E]',
      'child': 'bg-[#f5f0e8] text-[#3A6EA5]',
      'disability': 'bg-[#7DA5C8] text-white',
      'post-surgery': 'bg-[#5B8BBE] text-white',
      'temporary': 'bg-[#e6e0d2] text-[#2B4C7E]'
    };
    return colors[type] || 'bg-[#e6e0d2] text-[#2B4C7E]';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Mis Pacientes</h1>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('true')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'true' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFilter('false')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'false' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inactivos
          </button>
          <button
            onClick={() => setFilter(undefined)}
            className={`px-4 py-2 rounded-lg ${
              filter === undefined 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : patients.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No tienes pacientes asignados</p>
          <Link 
            to="/solicitudes"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ver solicitudes pendientes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((profile) => (
            <Link
              key={profile._id}
              to={`/paciente/${profile._id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{profile.patient?.name}</h3>
                  <p className="text-sm text-gray-600">{profile.patient?.email}</p>
                </div>
                {!profile.isActive && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    Inactivo
                  </span>
                )}
              </div>

              <div className="mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPatientTypeColor(profile.patientType)}`}>
                  {getPatientTypeLabel(profile.patientType)}
                </span>
              </div>

              {profile.careTemplate && (
                <div className="text-sm text-gray-600 mb-2">
                  <p className="font-medium">Plantilla: {profile.careTemplate.name}</p>
                </div>
              )}

              {profile.age && (
                <p className="text-sm text-gray-600">Edad: {profile.age} años</p>
              )}

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Desde {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
