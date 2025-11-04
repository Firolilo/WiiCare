import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-white border-b">
      <nav className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">WiiCare</Link>
        <div className="space-x-4">
          <Link to="/">Inicio</Link>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={logout} className="text-red-600">Salir</button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-3 py-1 rounded">Entrar</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
