import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientProfile, updatePatientProfile } from '../../api/patientManagement';
import DailyCareSection from './sections/DailyCareSection';
import MedicationsSection from './sections/MedicationsSection';
import RecommendationsSection from './sections/RecommendationsSection';
import IncidentsSection from './sections/IncidentsSection';
import AppointmentsSection from './sections/AppointmentsSection';
import HealthIndicatorsSection from './sections/HealthIndicatorsSection';
import CarePlansSection from './sections/CarePlansSection';

export default function PatientDashboard() {
  const { patientProfileId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily-care');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  useEffect(() => {
    loadProfile();
  }, [patientProfileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getPatientProfile(patientProfileId);
      setProfile(data.profile);
      setProfileForm({
        age: data.profile.age || '',
        gender: data.profile.gender || '',
        allergies: data.profile.allergies?.join(', ') || '',
        diagnoses: data.profile.diagnoses?.join(', ') || '',
        chronicConditions: data.profile.chronicConditions?.join(', ') || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updates = {
        age: profileForm.age ? parseInt(profileForm.age) : undefined,
        gender: profileForm.gender || undefined,
        allergies: profileForm.allergies ? profileForm.allergies.split(',').map(s => s.trim()) : [],
        diagnoses: profileForm.diagnoses ? profileForm.diagnoses.split(',').map(s => s.trim()) : [],
        chronicConditions: profileForm.chronicConditions ? profileForm.chronicConditions.split(',').map(s => s.trim()) : [],
      };
      
      await updatePatientProfile(patientProfileId, updates);
      setEditingProfile(false);
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const tabs = [
    { id: 'daily-care', label: 'Cuidados Diarios', icon: 'bi-clipboard-check' },
    { id: 'medications', label: 'Medicamentos', icon: 'bi-capsule' },
    { id: 'recommendations', label: 'Recomendaciones', icon: 'bi-lightbulb' },
    { id: 'incidents', label: 'Incidentes', icon: 'bi-exclamation-triangle' },
    { id: 'appointments', label: 'Citas', icon: 'bi-calendar-event' },
    { id: 'health', label: 'Indicadores de Salud', icon: 'bi-heart-pulse' },
    { id: 'care-plans', label: 'Planes de Cuidado', icon: 'bi-bullseye' },
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

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-screen">Perfil no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{profile.patient?.name}</h1>
              <p className="text-gray-600 mb-2">{profile.patient?.email}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {getPatientTypeLabel(profile.patientType)}
                </span>
                {profile.careTemplate && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <i className="bi bi-file-earmark-text mr-1"></i> {profile.careTemplate.name}
                  </span>
                )}
                {!profile.isActive && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    Inactivo
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/paciente/${profile.patient?._id}/analisis-fuerza`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <i className="bi bi-graph-up"></i>
                Análisis Fuerza
              </Link>
              <Link
                to={`/paciente/${patientProfileId}/sensor`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <i className="bi bi-activity"></i>
                Ver Sensor
              </Link>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingProfile ? 'Cancelar' : 'Editar Perfil'}
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {editingProfile ? (
              <div className="col-span-3 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Información del Paciente</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Edad</label>
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Género</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Seleccionar</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Alergias (separadas por coma)</label>
                  <input
                    type="text"
                    value={profileForm.allergies}
                    onChange={(e) => setProfileForm({...profileForm, allergies: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Polen, penicilina, ..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Diagnósticos (separados por coma)</label>
                  <input
                    type="text"
                    value={profileForm.diagnoses}
                    onChange={(e) => setProfileForm({...profileForm, diagnoses: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Diabetes, hipertensión, ..."
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Condiciones crónicas (separadas por coma)</label>
                  <input
                    type="text"
                    value={profileForm.chronicConditions}
                    onChange={(e) => setProfileForm({...profileForm, chronicConditions: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Artritis, asma, ..."
                  />
                </div>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Guardar Cambios
                </button>
              </div>
            ) : (
              <>
                {profile.age && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Edad</p>
                    <p className="text-lg font-semibold">{profile.age} años</p>
                  </div>
                )}
                {profile.gender && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Género</p>
                    <p className="text-lg font-semibold capitalize">{profile.gender}</p>
                  </div>
                )}
                {profile.allergies?.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg col-span-3">
                    <p className="text-sm text-red-600 font-medium mb-1"><i className="bi bi-exclamation-triangle-fill mr-1"></i> Alergias</p>
                    <p className="text-red-900">{profile.allergies.join(', ')}</p>
                  </div>
                )}
                {profile.diagnoses?.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg col-span-3">
                    <p className="text-sm text-blue-600 font-medium mb-1">Diagnósticos</p>
                    <p className="text-blue-900">{profile.diagnoses.join(', ')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
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
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'daily-care' && <DailyCareSection patientProfileId={patientProfileId} />}
        {activeTab === 'medications' && <MedicationsSection patientProfileId={patientProfileId} />}
        {activeTab === 'recommendations' && <RecommendationsSection patientProfileId={patientProfileId} />}
        {activeTab === 'incidents' && <IncidentsSection patientProfileId={patientProfileId} />}
        {activeTab === 'appointments' && <AppointmentsSection patientProfileId={patientProfileId} />}
        {activeTab === 'health' && <HealthIndicatorsSection patientProfileId={patientProfileId} />}
        {activeTab === 'care-plans' && <CarePlansSection patientProfileId={patientProfileId} />}
      </div>
    </div>
  );
}
