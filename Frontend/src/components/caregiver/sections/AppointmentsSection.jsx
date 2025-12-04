import { useState, useEffect } from 'react';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../../../api/patientManagement';

export default function AppointmentsSection({ patientProfileId }) {
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'other', startTime: '', endTime: '', location: '', reminderEnabled: true, reminderTime: 60 });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await getAppointments({ patientProfile: patientProfileId, status: 'scheduled' });
      setAppointments(data.appointments);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAppointment({ patientProfile: patientProfileId, ...form });
      setForm({ title: '', description: '', type: 'other', startTime: '', endTime: '', location: '', reminderEnabled: true, reminderTime: 60 });
      setShowForm(false);
      loadAppointments();
    } catch (error) {
      alert('Error al crear cita');
    }
  };

  const handleComplete = async (id) => {
    const notes = prompt('Notas de la cita:');
    try {
      await updateAppointment(id, { status: 'completed', completionNotes: notes });
      loadAppointments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
      await updateAppointment(id, { status: 'cancelled' });
      loadAppointments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const types = { medical: { label: 'Médica', icon: '🏥' }, therapy: { label: 'Terapia', icon: '🧘' }, checkup: { label: 'Revisión', icon: '🩺' }, visit: { label: 'Visita', icon: '👥' }, other: { label: 'Otra', icon: '📅' } };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Citas y Calendario</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{showForm ? 'Cancelar' : '+ Nueva Cita'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Título *</label><input required type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Descripción</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2" /></div>
            <div><label className="block text-sm font-medium mb-1">Tipo</label><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{Object.entries(types).map(([key, t]) => (<option key={key} value={key}>{t.icon} {t.label}</option>))}</select></div>
            <div><label className="block text-sm font-medium mb-1">Ubicación</label><input type="text" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Inicio *</label><input required type="datetime-local" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Fin</label><input type="datetime-local" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-2"><label className="flex items-center gap-2"><input type="checkbox" checked={form.reminderEnabled} onChange={(e) => setForm({...form, reminderEnabled: e.target.checked})} className="w-4 h-4" /><span className="text-sm font-medium">Activar recordatorio</span></label></div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Crear Cita</button>
        </form>
      )}

      {appointments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center"><p className="text-gray-600">No hay citas programadas</p></div>
      ) : (
        <div className="space-y-4">
          {appointments.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map((apt) => {
            const type = types[apt.type] || types.other;
            const isPast = new Date(apt.startTime) < new Date();
            return (
              <div key={apt._id} className={`rounded-lg shadow-md p-6 ${isPast ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div><span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{type.icon} {type.label}</span></div>
                  <div className="flex gap-2">{!isPast && (<><button onClick={() => handleComplete(apt._id)} className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">Completar</button><button onClick={() => handleCancel(apt._id)} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Cancelar</button></>)}</div>
                </div>
                <h4 className="font-semibold text-lg mb-2">{apt.title}</h4>
                {apt.description && <p className="text-gray-700 mb-2">{apt.description}</p>}
                <p className="text-sm text-gray-600 mb-1">📅 {new Date(apt.startTime).toLocaleString()}</p>
                {apt.location && <p className="text-sm text-gray-600 mb-1">📍 {apt.location}</p>}
                {apt.reminderEnabled && <p className="text-sm text-blue-600">🔔 Recordatorio activado</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
