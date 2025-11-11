import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', location: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${id}`).then((res) => {
      setUser(res.data.user);
      setForm({
        name: res.data.user.name || '',
        bio: res.data.user.bio || '',
        location: res.data.user.location || '',
      });
      setLoading(false);
    });
  }, [id]);

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

  if (loading)
    return (
      <section className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <p className="text-[#2B4C7E] font-medium animate-pulse">Cargando perfil...</p>
      </section>
    );

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-white to-[#f5f0e8] flex flex-col items-center justify-start px-6 py-10">
      <div className="max-w-md w-full bg-white shadow-sm border border-[#e6e0d2] rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[#2B4C7E] mb-4 text-center">Perfil de usuario</h1>

        {!editing ? (
          <>
            <p><span className="font-semibold">Nombre:</span> {user.name}</p>
            <p><span className="font-semibold">Ubicación:</span> {user.location || 'No especificada'}</p>
            <p><span className="font-semibold">Biografía:</span> {user.bio || 'Sin biografía'}</p>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setEditing(true)}
                className="bg-[#2B4C7E] text-white px-4 py-2 rounded-full hover:bg-[#3e64a3] transition"
              >
                Editar perfil
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Ubicación"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Biografía"
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleSave}
                className="bg-[#2B4C7E] text-white px-4 py-2 rounded-full hover:bg-[#3e64a3] transition"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="border border-[#2B4C7E] text-[#2B4C7E] px-4 py-2 rounded-full hover:bg-[#e4e9f3] transition"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
