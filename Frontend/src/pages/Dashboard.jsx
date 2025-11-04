import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/services').then((res) => setServices(res.data.services || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Servicios disponibles</h1>
      <ul className="grid md:grid-cols-2 gap-4">
        {services.map((s) => (
          <li key={s._id} className="border rounded p-4 bg-white">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-sm text-gray-700">{s.description}</p>
            <p className="text-sm mt-1">Tarifa: {s.rate} €/h</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
