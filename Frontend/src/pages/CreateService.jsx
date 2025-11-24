import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function CreateService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rate: '',
    tags: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirigir si no es cuidador
  if (user?.role !== 'caregiver') {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validaciones
    if (!formData.title || !formData.description || !formData.rate) {
      setError('Por favor completa los campos obligatorios (Título, Descripción y Tarifa).');
      return;
    }

    if (isNaN(formData.rate) || parseFloat(formData.rate) <= 0) {
      setError('La tarifa debe ser un número mayor a 0.');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        rate: parseFloat(formData.rate),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        location: formData.location.trim() || undefined
      };

      await api.post('/services', serviceData);
      
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        rate: '',
        tags: '',
        location: ''
      });

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      const msg = err.response?.data?.message || 
                  err.message || 
                  'Error al crear el servicio. Intenta nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(95vh-80px)] flex items-center justify-center px-6 py-10">
      <div className="bg-white shadow-lg border border-[#E0D7C6] rounded-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-[#2B4C7E] mb-6 text-center">
          Crear Nuevo Servicio
        </h1>

        <p className="text-sm text-gray-600 mb-6 text-center">
          Completa la información del servicio que deseas ofrecer a los pacientes
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            ✅ Servicio creado exitosamente. Redirigiendo...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-[#2B4C7E] mb-2">
              Título del Servicio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              data-cy="service-title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Cuidado de adultos mayores"
              className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 p-3 rounded-lg outline-none transition"
              maxLength="100"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-[#2B4C7E] mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              data-cy="service-description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu servicio, experiencia y habilidades..."
              className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 p-3 rounded-lg outline-none transition resize-none"
              rows="4"
              maxLength="500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          {/* Tarifa */}
          <div>
            <label className="block text-sm font-medium text-[#2B4C7E] mb-2">
              Tarifa por Hora (Bs) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rate"
              data-cy="service-rate"
              value={formData.rate}
              onChange={handleChange}
              placeholder="Ej: 50"
              min="0"
              step="0.01"
              className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 p-3 rounded-lg outline-none transition"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-[#2B4C7E] mb-2">
              Ubicación
            </label>
            <input
              type="text"
              name="location"
              data-cy="service-location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ej: La Paz, Bolivia"
              className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 p-3 rounded-lg outline-none transition"
              maxLength="100"
            />
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-sm font-medium text-[#2B4C7E] mb-2">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              name="tags"
              data-cy="service-tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ej: TEA, Infantil, Adultos mayores"
              className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 p-3 rounded-lg outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ayuda a los pacientes a encontrar tu servicio más fácilmente
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-all font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-cy="service-submit"
              disabled={loading}
              className="flex-1 bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-6 py-3 rounded-lg transition-all shadow-sm disabled:bg-[#8FAFD3] disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creando...' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
