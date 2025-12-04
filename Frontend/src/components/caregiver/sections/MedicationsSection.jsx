import { useState, useEffect } from 'react';
import { getMedications, createMedication, updateMedication, deleteMedication } from '../../../api/patientManagement';

export default function MedicationsSection({ patientProfileId }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: '',
    dose: '',
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: '',
    sideEffects: '',
    reminderEnabled: true
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await getMedications({ patientProfile: patientProfileId, isActive: true });
      setMedications(data.medications);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMedication({ patientProfile: patientProfileId, ...form });
      setForm({
        name: '',
        type: '',
        dose: '',
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        instructions: '',
        sideEffects: '',
        reminderEnabled: true
      });
      setShowForm(false);
      loadMedications();
    } catch (error) {
      console.error('Error creating medication:', error);
      alert('Error al crear medicamento');
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('¿Desactivar este medicamento?')) return;
    try {
      await updateMedication(id, { isActive: false });
      loadMedications();
    } catch (error) {
      console.error('Error deactivating medication:', error);
    }
  };

  const frequencies = {
    'once': 'Una vez',
    'daily': 'Diario',
    'twice-daily': '2 veces al día',
    'three-times-daily': '3 veces al día',
    'weekly': 'Semanal',
    'custom': 'Personalizado'
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medicamentos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Medicamento'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Nuevo Medicamento</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <input
                type="text"
                value={form.type}
                onChange={(e) => setForm({...form, type: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Pastilla, jarabe, inyección..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dosis *</label>
              <input
                type="text"
                required
                value={form.dose}
                onChange={(e) => setForm({...form, dose: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="10mg, 2 pastillas..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frecuencia</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({...form, frequency: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {Object.entries(frequencies).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({...form, startDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de fin (opcional)</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({...form, endDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Instrucciones</label>
              <textarea
                value={form.instructions}
                onChange={(e) => setForm({...form, instructions: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows="2"
                placeholder="Tomar con comida, antes de dormir..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Efectos secundarios conocidos</label>
              <textarea
                value={form.sideEffects}
                onChange={(e) => setForm({...form, sideEffects: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows="2"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.reminderEnabled}
                  onChange={(e) => setForm({...form, reminderEnabled: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Activar recordatorios</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Agregar Medicamento
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">Cargando medicamentos...</div>
      ) : medications.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay medicamentos activos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => (
            <div key={med._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xl font-semibold mb-1">💊 {med.name}</h4>
                  {med.type && <p className="text-sm text-gray-600">{med.type}</p>}
                </div>
                {med.reminderEnabled && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    🔔 Recordatorio
                  </span>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium">Dosis:</span> {med.dose}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Frecuencia:</span> {frequencies[med.frequency]}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Desde:</span> {new Date(med.startDate).toLocaleDateString()}
                  {med.endDate && ` hasta ${new Date(med.endDate).toLocaleDateString()}`}
                </p>
              </div>

              {med.instructions && (
                <div className="mb-3 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-900 mb-1">Instrucciones:</p>
                  <p className="text-sm text-blue-800">{med.instructions}</p>
                </div>
              )}

              {med.sideEffects && (
                <div className="mb-3 p-3 bg-yellow-50 rounded">
                  <p className="text-sm font-medium text-yellow-900 mb-1">⚠️ Efectos secundarios:</p>
                  <p className="text-sm text-yellow-800">{med.sideEffects}</p>
                </div>
              )}

              <button
                onClick={() => handleDeactivate(med._id)}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Desactivar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
