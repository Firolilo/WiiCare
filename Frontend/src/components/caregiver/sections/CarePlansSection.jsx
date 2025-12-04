import { useState, useEffect } from 'react';
import { getCarePlans, createCarePlan, updateCarePlan, achieveGoal } from '../../../api/patientManagement';

export default function CarePlansSection({ patientProfileId }) {
  const [carePlans, setCarePlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', period: 'weekly', startDate: new Date().toISOString().split('T')[0], endDate: '', description: '', goals: [] });
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    loadCarePlans();
  }, []);

  const loadCarePlans = async () => {
    try {
      const data = await getCarePlans({ patientProfile: patientProfileId, isActive: true });
      setCarePlans(data.carePlans);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCarePlan({ patientProfile: patientProfileId, ...form });
      setForm({ title: '', period: 'weekly', startDate: new Date().toISOString().split('T')[0], endDate: '', description: '', goals: [] });
      setShowForm(false);
      loadCarePlans();
    } catch (error) {
      alert('Error al crear plan de cuidado');
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    setForm({ ...form, goals: [...form.goals, { description: newGoal, achieved: false }] });
    setNewGoal('');
  };

  const handleRemoveGoal = (index) => {
    setForm({ ...form, goals: form.goals.filter((_, i) => i !== index) });
  };

  const handleAchieveGoal = async (planId, goalId) => {
    try {
      await achieveGoal(planId, goalId);
      loadCarePlans();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const periods = { weekly: 'Semanal', monthly: 'Mensual', quarterly: 'Trimestral', custom: 'Personalizado' };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Planes de Cuidado</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{showForm ? 'Cancelar' : '+ Nuevo Plan'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Título *</label><input required type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium mb-1">Período *</label><select required value={form.period} onChange={(e) => setForm({...form, period: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{Object.entries(periods).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}</select></div><div><label className="block text-sm font-medium mb-1">Inicio *</label><input required type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div><div><label className="block text-sm font-medium mb-1">Fin *</label><input required type="date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Descripción</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="3" /></div>
            <div><label className="block text-sm font-medium mb-2">Objetivos</label><div className="flex gap-2 mb-2"><input type="text" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGoal())} className="flex-1 px-3 py-2 border rounded-lg" placeholder="Descripción del objetivo" /><button type="button" onClick={handleAddGoal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Añadir</button></div>{form.goals.length > 0 && <ul className="space-y-2">{form.goals.map((goal, idx) => (<li key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded"><span>{goal.description}</span><button type="button" onClick={() => handleRemoveGoal(idx)} className="text-red-600 hover:text-red-800">✕</button></li>))}</ul>}</div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Crear Plan</button>
        </form>
      )}

      {carePlans.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center"><p className="text-gray-600">No hay planes de cuidado activos</p></div>
      ) : (
        <div className="space-y-6">
          {carePlans.map((plan) => {
            const progress = plan.goals.length > 0 ? (plan.goals.filter(g => g.achieved).length / plan.goals.length) * 100 : 0;
            return (
              <div key={plan._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4"><h3 className="text-xl font-bold mb-2">🎯 {plan.title}</h3><div className="flex gap-2 text-sm text-gray-600 mb-2"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{periods[plan.period]}</span><span>📅 {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span></div>{plan.description && <p className="text-gray-700 mb-3">{plan.description}</p>}<div className="mb-2"><div className="flex justify-between text-sm text-gray-600 mb-1"><span>Progreso de objetivos</span><span>{Math.round(progress)}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }} /></div></div></div>
                {plan.goals.length > 0 && (<div><h4 className="font-semibold mb-2">Objetivos:</h4><ul className="space-y-2">{plan.goals.map((goal) => (<li key={goal._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded"><input type="checkbox" checked={goal.achieved} onChange={() => !goal.achieved && handleAchieveGoal(plan._id, goal._id)} className="mt-1 w-4 h-4" disabled={goal.achieved} /><div className="flex-1"><p className={goal.achieved ? 'line-through text-gray-500' : ''}>{goal.description}</p>{goal.achieved && <p className="text-xs text-green-600 mt-1">✓ Logrado el {new Date(goal.achievedDate).toLocaleDateString()}</p>}</div></li>))}</ul></div>)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
