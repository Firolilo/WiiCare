import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Caregivers() {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchCaregivers = async () => {
        try {
        const res = await api.get('/users/caregivers');
        setCaregivers(res.data.caregivers || []);
        } catch (err) {
        console.error('Error al cargar cuidadores:', err);
        setCaregivers([]); // fallback seguro
        } finally {
        setLoading(false);
        }
    };

    fetchCaregivers();
    }, []);


  if (loading)
    return (
      <section className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <p className="text-[#2B4C7E] font-medium animate-pulse">Cargando cuidadores...</p>
      </section>
    );

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-white to-[#f5f0e8] flex flex-col items-center justify-start px-6 py-10">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-[#2B4C7E] mb-6 text-center">
          Cuidadores registrados
        </h1>

        {caregivers.length === 0 ? (
          <p className="text-gray-600 text-lg text-center">No hay cuidadores disponibles.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {caregivers.map((c) => (
              <li
                key={c._id}
                className="bg-white rounded-2xl shadow-sm border border-[#e6e0d2] p-5 hover:shadow-md transition text-center"
              >
                <h3 className="font-semibold text-lg text-[#2B4C7E] mb-1">
                  {c.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {c.location || 'Ubicación no especificada'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Valoración: ⭐ {c.rating || 'Sin calificación'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
