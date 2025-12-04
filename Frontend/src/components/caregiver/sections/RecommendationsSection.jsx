import { useState, useEffect } from 'react';
import { getRecommendations, createRecommendation, updateRecommendation, deleteRecommendation } from '../../../api/patientManagement';

export default function RecommendationsSection({ patientProfileId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', priority: 'medium' });

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await getRecommendations({ patientProfile: patientProfileId, isActive: true });
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRecommendation({ patientProfile: patientProfileId, ...form });
      setForm({ title: '', content: '', category: 'general', priority: 'medium' });
      setShowForm(false);
      loadRecommendations();
    } catch (error) {
      alert('Error al crear recomendación');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta recomendación?')) return;
    try {
      await deleteRecommendation(id);
      loadRecommendations();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const categories = {
    nutrition: { label: 'Nutrición', icon: '🥗', color: 'green' },
    exercise: { label: 'Ejercicio', icon: '🏃', color: 'blue' },
    therapy: { label: 'Terapia', icon: '🧘', color: 'purple' },
    lifestyle: { label: 'Estilo de vida', icon: '🌟', color: 'yellow' },
    safety: { label: 'Seguridad', icon: '🛡️', color: 'red' },
    general: { label: 'General', icon: '📝', color: 'gray' }
  };

  const priorities = {
    low: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
    medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Alta', color: 'bg-red-100 text-red-800' }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recomendaciones</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {showForm ? 'Cancelar' : '+ Nueva Recomendación'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input required type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contenido *</label>
              <textarea required value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="4" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {Object.entries(categories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prioridad</label>
                <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {Object.entries(priorities).map(([key, p]) => (
                    <option key={key} value={key}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Crear Recomendación</button>
        </form>
      )}

      {recommendations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center"><p className="text-gray-600">No hay recomendaciones</p></div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const cat = categories[rec.category] || categories.general;
            const priority = priorities[rec.priority];
            return (
              <div key={rec._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 bg-${cat.color}-100 text-${cat.color}-800 text-xs rounded-full`}>{cat.icon} {cat.label}</span>
                    <span className={`px-2 py-1 ${priority.color} text-xs rounded-full`}>Prioridad: {priority.label}</span>
                  </div>
                  <button onClick={() => handleDelete(rec._id)} className="text-red-600 hover:text-red-800">🗑️</button>
                </div>
                <h4 className="font-semibold text-lg mb-2">{rec.title}</h4>
                <p className="text-gray-700">{rec.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
