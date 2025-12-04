import { useState, useEffect } from 'react';
import { getIncidents, createIncident, resolveIncident } from '../../../api/patientManagement';

export default function IncidentsSection({ patientProfileId }) {
  const [incidents, setIncidents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'other', severity: 'medium', title: '', description: '', occurredAt: new Date().toISOString().slice(0, 16), actionsTaken: '' });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await getIncidents({ patientProfile: patientProfileId });
      setIncidents(data.incidents);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIncident({ patientProfile: patientProfileId, ...form });
      setForm({ type: 'other', severity: 'medium', title: '', description: '', occurredAt: new Date().toISOString().slice(0, 16), actionsTaken: '' });
      setShowForm(false);
      loadIncidents();
    } catch (error) {
      alert('Error al registrar incidente');
    }
  };

  const handleResolve = async (id) => {
    const notes = prompt('Notas de resolución:');
    if (notes === null) return;
    try {
      await resolveIncident(id, notes);
      loadIncidents();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const types = { fall: { label: 'Caída', icon: '🤕' }, emergency: { label: 'Emergencia', icon: '🚨' }, symptom: { label: 'Síntoma', icon: '🩺' }, behavior: { label: 'Comportamiento', icon: '😟' }, 'medication-reaction': { label: 'Reacción medicamento', icon: '💊' }, other: { label: 'Otro', icon: '📋' } };
  const severities = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' };
  const severityColors = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800' };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Incidentes y Cambios</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{showForm ? 'Cancelar' : '+ Registrar Incidente'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Tipo *</label><select required value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{Object.entries(types).map(([key, t]) => (<option key={key} value={key}>{t.icon} {t.label}</option>))}</select></div>
            <div><label className="block text-sm font-medium mb-1">Severidad *</label><select required value={form.severity} onChange={(e) => setForm({...form, severity: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{Object.entries(severities).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}</select></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Título *</label><input required type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Descripción *</label><textarea required value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="3" /></div>
            <div><label className="block text-sm font-medium mb-1">Fecha y hora</label><input type="datetime-local" value={form.occurredAt} onChange={(e) => setForm({...form, occurredAt: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Acciones tomadas</label><textarea value={form.actionsTaken} onChange={(e) => setForm({...form, actionsTaken: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2" /></div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Registrar Incidente</button>
        </form>
      )}

      {incidents.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center"><p className="text-gray-600">No hay incidentes registrados</p></div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => {
            const type = types[inc.type] || types.other;
            return (
              <div key={inc._id} className={`rounded-lg shadow-md p-6 ${inc.resolved ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2"><span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{type.icon} {type.label}</span><span className={`px-2 py-1 ${severityColors[inc.severity]} text-xs rounded-full`}>{severities[inc.severity]}</span>{inc.resolved && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✓ Resuelto</span>}</div>
                  {!inc.resolved && <button onClick={() => handleResolve(inc._id)} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Resolver</button>}
                </div>
                <h4 className="font-semibold text-lg mb-2">{inc.title}</h4>
                <p className="text-gray-700 mb-2">{inc.description}</p>
                <p className="text-sm text-gray-600 mb-2">📅 {new Date(inc.occurredAt).toLocaleString()}</p>
                {inc.actionsTaken && <div className="p-3 bg-blue-50 rounded mb-2"><p className="text-sm font-medium text-blue-900 mb-1">Acciones tomadas:</p><p className="text-sm text-blue-800">{inc.actionsTaken}</p></div>}
                {inc.resolved && inc.resolutionNotes && <div className="p-3 bg-green-50 rounded"><p className="text-sm font-medium text-green-900 mb-1">Resolución:</p><p className="text-sm text-green-800">{inc.resolutionNotes}</p><p className="text-xs text-green-600 mt-1">{new Date(inc.resolvedAt).toLocaleString()}</p></div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
