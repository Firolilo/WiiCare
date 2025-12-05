import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import RatingComponent from '../components/RatingComponent';
import ReviewsList from '../components/ReviewsList';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Si no hay ID en la URL, usar el ID del usuario autenticado
  const userId = id || currentUser?._id;
  const isOwnProfile = userId === currentUser?._id;
  const isCaregiver = user?.role === 'caregiver';

  useEffect(() => {
    if (!userId) {
      console.error('No user ID available');
      navigate('/dashboard');
      return;
    }

    api.get(`/users/${userId}`)
      .then((res) => {
        setUser(res.data.user);
        setForm({
          name: res.data.user.name || '',
          bio: res.data.user.bio || '',
          location: res.data.user.location || '',
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar perfil:', error);
        setLoading(false);
      });
  }, [userId, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await api.put('/users/me', form);
      setUser(res.data.user);
      setEditing(false);
    } catch {
      alert('Error al actualizar el perfil');
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'user': 'Paciente',
      'caregiver': 'Cuidador',
      'admin': 'Administrador'
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      'user': 'bi-person-heart',
      'caregiver': 'bi-briefcase-fill',
      'admin': 'bi-shield-fill-check'
    };
    return icons[role] || 'bi-person';
  };

  const getRoleColor = (role) => {
    const colors = {
      'user': 'from-[#5B8BBE] to-[#3A6EA5]',
      'caregiver': 'from-[#3A6EA5] to-[#2B4C7E]',
      'admin': 'from-[#2B4C7E] to-[#1a3a5c]'
    };
    return colors[role] || 'from-[#7DA5C8] to-[#5B8BBE]';
  };

  if (loading)
    return (
      <section className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6EA5] mx-auto mb-4"></div>
          <p className="text-[#2B4C7E] font-medium">Cargando perfil...</p>
        </div>
      </section>
    );

  if (!user) {
    return (
      <section className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#faf8f5] to-[#f5f0e8]">
        <div className="text-center">
          <i className="bi bi-person-x text-6xl text-[#7DA5C8] mb-4"></i>
          <p className="text-[#2B4C7E]">Paciente no encontrado</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#faf8f5] via-white to-[#f5f0e8] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header del perfil */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Banner */}
          <div className={`h-32 bg-gradient-to-r ${getRoleColor(user.role)} relative`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
          </div>
          
          {/* Avatar y info básica */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
              {/* Avatar */}
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg`}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              {/* Nombre y rol */}
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white`}>
                        <i className={`bi ${getRoleIcon(user.role)}`}></i>
                        {getRoleLabel(user.role)}
                      </span>
                      {user.location && (
                        <span className="inline-flex items-center gap-1 text-gray-500 text-sm">
                          <i className="bi bi-geo-alt"></i>
                          {user.location}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Botón editar */}
                  {isOwnProfile && !editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f0e8] hover:bg-[#e6e0d2] text-[#2B4C7E] rounded-lg transition-colors"
                    >
                      <i className="bi bi-pencil"></i>
                      Editar perfil
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="bg-white rounded-xl shadow-md mb-6 border border-[#e6e0d2]">
          <div className="flex border-b border-[#e6e0d2]">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'info'
                  ? 'text-[#2B4C7E] border-b-2 border-[#3A6EA5] bg-[#f5f0e8]/50'
                  : 'text-gray-500 hover:text-[#2B4C7E] hover:bg-[#faf8f5]'
              }`}
            >
              <i className="bi bi-person-vcard"></i>
              Información
            </button>
            
            {isCaregiver && (
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'reviews'
                    ? 'text-[#2B4C7E] border-b-2 border-[#3A6EA5] bg-[#f5f0e8]/50'
                    : 'text-gray-500 hover:text-[#2B4C7E] hover:bg-[#faf8f5]'
                }`}
              >
                <i className="bi bi-star"></i>
                Reseñas
              </button>
            )}
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'info' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Información principal */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 border border-[#e6e0d2]">
                <h2 className="text-lg font-bold text-[#2B4C7E] mb-4 flex items-center gap-2">
                  <i className="bi bi-info-circle text-[#3A6EA5]"></i>
                  Acerca de
                </h2>
                
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2B4C7E] mb-1">
                        Nombre completo
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className="w-full border border-[#e6e0d2] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#3A6EA5] focus:border-[#3A6EA5] transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2B4C7E] mb-1">
                        <i className="bi bi-geo-alt text-[#7DA5C8] mr-1"></i>
                        Ubicación
                      </label>
                      <input
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Ciudad, País"
                        className="w-full border border-[#e6e0d2] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#3A6EA5] focus:border-[#3A6EA5] transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2B4C7E] mb-1">
                        <i className="bi bi-file-text text-[#7DA5C8] mr-1"></i>
                        Biografía
                      </label>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Cuéntanos sobre ti..."
                        rows="4"
                        className="w-full border border-[#e6e0d2] rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#3A6EA5] focus:border-[#3A6EA5] transition-all resize-none"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-[#3A6EA5] to-[#2B4C7E] text-white px-4 py-2.5 rounded-lg hover:from-[#2B4C7E] hover:to-[#1a3a5c] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <i className="bi bi-check-lg"></i>
                        Guardar cambios
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2.5 border border-[#e6e0d2] text-[#2B4C7E] rounded-lg hover:bg-[#f5f0e8] transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.bio ? (
                      <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                    ) : (
                      <p className="text-gray-400 italic">Sin biografía</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e6e0d2]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f5f0e8] flex items-center justify-center">
                          <i className="bi bi-envelope text-[#3A6EA5]"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#7DA5C8]">Email</p>
                          <p className="text-sm font-medium text-[#2B4C7E]">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#f5f0e8] flex items-center justify-center">
                          <i className="bi bi-calendar3 text-[#3A6EA5]"></i>
                        </div>
                        <div>
                          <p className="text-xs text-[#7DA5C8]">Miembro desde</p>
                          <p className="text-sm font-medium text-[#2B4C7E]">
                            {new Date(user.createdAt).toLocaleDateString('es-ES', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Estadísticas rápidas */}
              {isCaregiver && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-[#e6e0d2]">
                  <h3 className="text-lg font-bold text-[#2B4C7E] mb-4 flex items-center gap-2">
                    <i className="bi bi-graph-up text-[#3A6EA5]"></i>
                    Estadísticas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#f5f0e8] rounded-lg">
                      <span className="text-[#2B4C7E] text-sm">Calificación</span>
                      <div className="flex items-center gap-1">
                        <i className="bi bi-star-fill text-yellow-400"></i>
                        <span className="font-bold text-[#2B4C7E]">{user.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calificar cuidador (solo si no es el propio perfil y es cuidador) */}
              {!isOwnProfile && isCaregiver && currentUser && currentUser.role !== 'caregiver' && (
                <RatingComponent
                  caregiverId={user._id}
                  caregiverName={user.name}
                  showTitle={true}
                />
              )}

              {/* Acciones rápidas para el propio perfil */}
              {isOwnProfile && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-[#e6e0d2]">
                  <h3 className="text-lg font-bold text-[#2B4C7E] mb-4 flex items-center gap-2">
                    <i className="bi bi-lightning text-[#3A6EA5]"></i>
                    Acciones rápidas
                  </h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#f5f0e8] transition-colors text-left"
                    >
                      <i className="bi bi-house text-[#3A6EA5]"></i>
                      <span className="text-[#2B4C7E]">Ir al Dashboard</span>
                    </button>
                    {isCaregiver && (
                      <button 
                        onClick={() => navigate('/crear-servicio')}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#f5f0e8] transition-colors text-left"
                      >
                        <i className="bi bi-plus-circle text-[#3A6EA5]"></i>
                        <span className="text-[#2B4C7E]">Crear servicio</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab de reseñas */}
        {activeTab === 'reviews' && isCaregiver && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ReviewsList caregiverId={user._id} limit={10} />
            </div>
            
            <div>
              {!isOwnProfile && currentUser && currentUser.role !== 'caregiver' && (
                <RatingComponent
                  caregiverId={user._id}
                  caregiverName={user.name}
                  showTitle={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
