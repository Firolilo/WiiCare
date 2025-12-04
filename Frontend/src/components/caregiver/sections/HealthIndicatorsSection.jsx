import { useState, useEffect } from 'react';
import { getHealthIndicators, createHealthIndicator } from '../../../api/patientManagement';

export default function HealthIndicatorsSection({ patientProfileId }) {
  const [indicators, setIndicators] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'blood-pressure', customName: '', value: '', unit: '', measuredAt: new Date().toISOString().slice(0, 16), notes: '', isAbnormal: false });

  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = async () => {
    try {
      const data = await getHealthIndicators({ patientProfile: patientProfileId });
      setIndicators(data.healthIndicators);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHealthIndicator({ patientProfile: patientProfileId, ...form });
      setForm({ type: 'blood-pressure', customName: '', value: '', unit: '', measuredAt: new Date().toISOString().slice(0, 16), notes: '', isAbnormal: false });
      setShowForm(false);
      loadIndicators();
    } catch (error) {
      alert('Error al registrar indicador');
    }
  };

  const types = { 'blood-pressure': { label: 'Presión arterial', icon: '🩺', unit: 'mmHg' }, 'heart-rate': { label: 'Frecuencia cardíaca', icon: '❤️', unit: 'bpm' }, temperature: { label: 'Temperatura', icon: '🌡️', unit: '°C' }, glucose: { label: 'Glucosa', icon: '🩸', unit: 'mg/dL' }, weight: { label: 'Peso', icon: '⚖️', unit: 'kg' }, oxygen: { label: 'Oxígeno', icon: '🫁', unit: '%' }, mood: { label: 'Estado de ánimo', icon: '😊', unit: '' }, sleep: { label: 'Sueño', icon: '😴', unit: 'horas' }, pain: { label: 'Dolor', icon: '🤕', unit: '0-10' }, custom: { label: 'Personalizado', icon: '📊', unit: '' } };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Indicadores de Salud</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{showForm ? 'Cancelar' : '+ Registrar Indicador'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Tipo *</label><select required value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{Object.entries(types).map(([key, t]) => (<option key={key} value={key}>{t.icon} {t.label}</option>))}</select></div>
            {form.type === 'custom' && <div><label className="block text-sm font-medium mb-1">Nombre personalizado *</label><input required type="text" value={form.customName} onChange={(e) => setForm({...form, customName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>}
            <div><label className="block text-sm font-medium mb-1">Valor *</label><input required type="text" value={form.value} onChange={(e) => setForm({...form, value: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">Unidad</label><input type="text" value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder={types[form.type]?.unit} /></div>
            <div><label className="block text-sm font-medium mb-1">Fecha y hora</label><input type="datetime-local" value={form.measuredAt} onChange={(e) => setForm({...form, measuredAt: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Notas</label><textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2" /></div>
            <div className="col-span-2"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isAbnormal} onChange={(e) => setForm({...form, isAbnormal: e.target.checked})} className="w-4 h-4" /><span className="text-sm font-medium">Marcar como anormal (enviar alerta)</span></label></div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Registrar</button>
        </form>
      )}

      {indicators.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center"><p className="text-gray-600">No hay indicadores registrados</p></div>
      ) : (
        <div className="space-y-4">
          {indicators.map((ind) => {
            const type = types[ind.type] || types.custom;
            return (
              <div key={ind._id} className={`rounded-lg shadow-md p-4 ${ind.isAbnormal ? 'bg-red-50 border-2 border-red-300' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1"><div className="flex items-center gap-2 mb-2"><span className="text-2xl">{type.icon}</span><h4 className="font-semibold text-lg">{ind.type === 'custom' ? ind.customName : type.label}</h4>{ind.isAbnormal && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">⚠️ Anormal</span>}</div><p className="text-2xl font-bold text-blue-600 mb-1">{ind.value} {ind.unit || type.unit}</p><p className="text-sm text-gray-600">📅 {new Date(ind.measuredAt).toLocaleString()}</p>{ind.notes && <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">{ind.notes}</p>}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
