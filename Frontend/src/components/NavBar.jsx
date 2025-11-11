import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-[#FAF9F6] border-b border-[#E0D7C6] shadow-sm z-10">
      <nav className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-[#2B4C7E] font-extrabold text-2xl tracking-wide"
        >
          WiiCare
        </Link>

        <div className="space-x-4 flex items-center">
          <Link
            to="/"
            className="text-[#2B4C7E] hover:text-[#3A6EA5] transition-colors"
          >
            Inicio
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-[#2B4C7E] hover:text-[#3A6EA5]"
              >
                Dashboard
              </Link>
              <Link
                to={`/perfil/${user._id}`}
                className="text-[#2B4C7E] hover:text-[#3A6EA5]"
              >
                Mi perfil
              </Link>
              <Link
                to="/cuidadores"
                className="text-[#2B4C7E] hover:text-[#3A6EA5]"
              >
                Cuidadores
              </Link>
              <button
                onClick={logout}
                className="text-[#B94A48] hover:text-[#A33D3B] transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
