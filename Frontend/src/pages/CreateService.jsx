import { useState, useEffect, useRef } from 'react';
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
    tags: [],
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const sidebarRef = useRef(null);

  // Tags predefinidas comunes
  const commonTags = [
    'TEA', 'Autismo', 'Síndrome de Down', 'TDAH',
    'Adultos mayores', 'Alzheimer', 'Parkinson',
    'Discapacidad física', 'Discapacidad intelectual',
    'Cuidado infantil', 'Cuidado nocturno', 'Rehabilitación',
    'Enfermería', 'Acompañamiento', 'Terapia física'
  ];

  // Ubicaciones comunes en Bolivia
  const commonLocations = [
    'La Paz', 'El Alto', 'Cochabamba', 'Santa Cruz',
    'Sucre', 'Oruro', 'Potosí', 'Tarija', 'Beni'
  ];

  // Redirigir si no es cuidador
  useEffect(() => {
    if (user && user.role !== 'caregiver') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Efecto de scroll parallax suave
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Ralentizar el scroll en un 30% para efecto parallax
      const offset = scrollTop * 0.7;
      setScrollOffset(offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
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

    if (formData.title.length < 5) {
      setError('El título debe tener al menos 5 caracteres.');
      return;
    }

    if (formData.description.length < 20) {
      setError('La descripción debe tener al menos 20 caracteres.');
      return;
    }

    if (isNaN(formData.rate) || parseFloat(formData.rate) <= 0) {
      setError('La tarifa debe ser un número mayor a 0.');
      return;
    }

    if (parseFloat(formData.rate) > 1000) {
      setError('La tarifa parece muy alta. Verifica el monto.');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        rate: parseFloat(formData.rate),
        tags: formData.tags.length > 0 ? formData.tags : [],
        location: formData.location.trim() || undefined
      };

      await api.post('/services', serviceData);
      
      setSuccess(true);

      // Redirigir al dashboard después de 1.5 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      const msg = err.response?.data?.message || 
                  err.message || 
                  'Error al crear el servicio. Intenta nuevamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'caregiver') {
    return null;
  }

  return (
    <section className="min-h-full bg-gradient-to-b from-white to-[#f5f0e8] px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8 items-start relative">
          {/* Columna Principal - Formulario */}
          <div className="flex-1 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#2B4C7E] mb-3 flex items-center justify-center gap-3">
                <i className="bi bi-plus-circle-fill"></i>
                Crear Nuevo Servicio
              </h1>
              <p className="text-gray-600 text-lg">
                Completa el formulario para ofrecer tu servicio profesional
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-start gap-3">
                <i className="bi bi-exclamation-triangle-fill text-xl"></i>
                <div>
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-start gap-3">
                <i className="bi bi-check-circle-fill text-xl"></i>
                <div>
                  <p className="font-semibold">¡Servicio creado exitosamente!</p>
                  <p>Redirigiendo al dashboard...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
              {/* Información Básica */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-bold text-[#2B4C7E] mb-4 flex items-center gap-2">
                  <i className="bi bi-info-circle"></i>
                  Información Básica
                </h2>

                {/* Título */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título del Servicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    data-cy="service-title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej: Cuidado especializado de adultos mayores con Alzheimer"
                    className="w-full border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 p-3 rounded-lg outline-none transition text-gray-800"
                    maxLength="100"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      <i className="bi bi-lightbulb"></i> Sé específico y claro
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.title.length}/100
                    </p>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción Detallada <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    data-cy="service-description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe tu experiencia, formación, habilidades especiales y qué incluye tu servicio. Ejemplo: 'Cuento con 5 años de experiencia en cuidado de adultos mayores, especialización en Alzheimer y Parkinson. Ofrezco acompañamiento, administración de medicamentos, fisioterapia básica...'"
                    className="w-full border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 p-4 rounded-lg outline-none transition resize-none text-gray-800"
                    rows="6"
                    maxLength="500"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      <i className="bi bi-lightbulb"></i> Incluye tu experiencia y certificaciones
                    </p>
                    <p className={`text-xs ${formData.description.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                      {formData.description.length}/500 (mínimo 20)
                    </p>
                  </div>
                </div>
              </div>

              {/* Tarifa y Ubicación */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-bold text-[#2B4C7E] mb-4 flex items-center gap-2">
                  <i className="bi bi-cash-coin"></i>
                  Tarifa y Ubicación
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Tarifa */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tarifa por Hora (Bs) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">Bs</span>
                      <input
                        type="number"
                        name="rate"
                        data-cy="service-rate"
                        value={formData.rate}
                        onChange={handleChange}
                        placeholder="50"
                        min="0"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 rounded-lg outline-none transition text-gray-800"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      <i className="bi bi-info-circle"></i> Tarifa promedio: 40-80 Bs/h
                    </p>
                  </div>

                  {/* Ubicación */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 p-3 rounded-lg outline-none transition text-gray-800"
                    >
                      <option value="">Seleccionar ciudad...</option>
                      {commonLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      <i className="bi bi-geo-alt"></i> Donde ofreces tus servicios
                    </p>
                  </div>
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <h2 className="text-xl font-bold text-[#2B4C7E] mb-4 flex items-center gap-2">
                  <i className="bi bi-tags"></i>
                  Especialidades y Áreas de Experiencia
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona las especialidades que mejor describan tu servicio (puedes elegir varias)
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {commonTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.tags.includes(tag)
                          ? 'bg-[#3A6EA5] text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {formData.tags.includes(tag) && <i className="bi bi-check-circle-fill mr-1"></i>}
                      {tag}
                    </button>
                  ))}
                </div>

                {formData.tags.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      <i className="bi bi-check2-circle"></i> Especialidades seleccionadas ({formData.tags.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <i className="bi bi-x-circle"></i>
                  Cancelar
                </button>
                <button
                  type="submit"
                  data-cy="service-submit"
                  disabled={loading}
                  className="flex-1 bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-6 py-4 rounded-xl transition-all shadow-lg disabled:bg-[#8FAFD3] disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="bi bi-hourglass-split animate-spin"></i>
                      Creando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill"></i>
                      Crear Servicio
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Columna Lateral - Tips Flotantes (Sticky con Parallax) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div 
              ref={sidebarRef}
              className="sticky top-6"
              style={{
                transform: `translateY(${scrollOffset * 0.15}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              <div className="bg-gradient-to-br from-[#3A6EA5] to-[#2B4C7E] text-white rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <i className="bi bi-lightbulb-fill text-2xl"></i>
                  </div>
                  <h3 className="font-bold text-lg">
                    Consejos para crear un servicio atractivo
                  </h3>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200">
                    <i className="bi bi-check-circle-fill text-xl mt-0.5 flex-shrink-0"></i>
                    <span className="text-sm leading-relaxed">
                      Usa un título <strong>claro y específico</strong> sobre lo que ofreces
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200">
                    <i className="bi bi-check-circle-fill text-xl mt-0.5 flex-shrink-0"></i>
                    <span className="text-sm leading-relaxed">
                      Menciona tu <strong>experiencia, certificaciones</strong> y formación
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200">
                    <i className="bi bi-check-circle-fill text-xl mt-0.5 flex-shrink-0"></i>
                    <span className="text-sm leading-relaxed">
                      Selecciona <strong>especialidades relevantes</strong> para que te encuentren fácilmente
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200">
                    <i className="bi bi-check-circle-fill text-xl mt-0.5 flex-shrink-0"></i>
                    <span className="text-sm leading-relaxed">
                      Establece una <strong>tarifa competitiva</strong> según tu experiencia
                    </span>
                  </li>
                </ul>

                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/80 flex items-center gap-2">
                    <i className="bi bi-info-circle"></i>
                    <span>Un buen servicio atrae más clientes</span>
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
