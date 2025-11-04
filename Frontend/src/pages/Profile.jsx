import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get(`/users/${id}`).then((res) => setUser(res.data.user));
  }, [id]);

  if (!user) return <p>Cargando...</p>;

  return (
    <section>
      <h1 className="text-2xl font-bold">{user.name}</h1>
      {user.location && <p className="text-gray-700">{user.location}</p>}
      {user.bio && <p className="mt-2">{user.bio}</p>}
    </section>
  );
}
