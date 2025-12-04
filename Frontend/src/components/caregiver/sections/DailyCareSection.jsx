import { useState, useEffect } from 'react';
import { getDailyCare, createDailyCare, completeDailyCare, updateDailyCare, deleteDailyCare } from '../../../api/patientManagement';

export default function DailyCareSection({ patientProfileId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({
    task: '',
    description: '',
    category: 'other',
    scheduledTime: ''
  });

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getDailyCare({ patientProfile: patientProfileId, date: selectedDate });
      setTasks(data.dailyCare);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDailyCare({
        patientProfile: patientProfileId,
        ...form,
        date: selectedDate
      });
      setForm({ task: '', description: '', category: 'other', scheduledTime: '' });
      setShowForm(false);
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear la tarea');
    }
  };

  const handleComplete = async (taskId) => {
    const notes = prompt('Notas sobre la tarea completada (opcional):');
    try {
      await completeDailyCare(taskId, notes);
      loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await deleteDailyCare(taskId);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const categories = {
    'hygiene': { label: 'Higiene', icon: '🚿', color: 'blue' },
    'medication': { label: 'Medicación', icon: '💊', color: 'purple' },
    'nutrition': { label: 'Nutrición', icon: '🍽️', color: 'green' },
    'exercise': { label: 'Ejercicio', icon: '🏃', color: 'orange' },
    'therapy': { label: 'Terapia', icon: '🧘', color: 'pink' },
    'monitoring': { label: 'Monitoreo', icon: '📊', color: 'indigo' },
    'other': { label: 'Otro', icon: '📝', color: 'gray' }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Cuidados Diarios</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Nueva Tarea'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Nueva Tarea</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Tarea *</label>
              <input
                type="text"
                required
                value={form.task}
                onChange={(e) => setForm({...form, task: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ej: Baño matutino"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows="2"
                placeholder="Detalles adicionales..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora programada</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm({...form, scheduledTime: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Crear Tarea
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">Cargando tareas...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No hay tareas para esta fecha</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const cat = categories[task.category] || categories.other;
            return (
              <div
                key={task._id}
                className={`bg-white rounded-lg shadow p-4 ${
                  task.completed ? 'opacity-75 bg-green-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 bg-${cat.color}-100 text-${cat.color}-800 text-xs rounded-full`}>
                        {cat.icon} {cat.label}
                      </span>
                      {task.scheduledTime && (
                        <span className="text-sm text-gray-600">🕐 {task.scheduledTime}</span>
                      )}
                      {task.completed && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          ✓ Completada
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{task.task}</h4>
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    )}
                    {task.notes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        <p className="text-blue-900"><strong>Notas:</strong> {task.notes}</p>
                      </div>
                    )}
                    {task.completed && task.completedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completada: {new Date(task.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {!task.completed && (
                      <button
                        onClick={() => handleComplete(task._id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Completar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
