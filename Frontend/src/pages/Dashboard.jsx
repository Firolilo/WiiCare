import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let active = true; // evita updates después de desmontar

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      if (active) setServices(res.data.services || []);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      if (active) setServices([]); // fallback para error
    } finally {
      if (active) setLoading(false);
    }
  };

  fetchServices();

  return () => {
    active = false;
  };
}, []);


  if (loading)
    return (
      <section className="flex justify-center items-center min-h-[calc(95vh-80px)] text-[#2B4C7E]">
        <p className="text-lg font-medium animate-pulse">Cargando servicios...</p>
      </section>
    );

  return (
    <section className="min-h-[calc(95vh-80px)] flex flex-col items-center justify-start text-center px-6 py-10 bg-gradient-to-b from-white to-[#f5f0e8]">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-[#2B4C7E] mb-6">
          Servicios disponibles
        </h1>

        {services.length === 0 ? (
          <p className="text-gray-600 text-lg">No hay servicios registrados.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <li
                key={s._id}
                className="bg-white rounded-2xl shadow-sm border border-[#e6e0d2] p-5 text-left hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg text-[#2B4C7E] mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {s.description}
                </p>
                <p className="text-sm mt-3 text-gray-600">
                  Tarifa: <span className="font-medium">{s.rate} Bs/h</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
