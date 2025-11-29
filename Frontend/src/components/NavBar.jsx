import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();

  // Definir color del header según rol
  const getHeaderStyle = () => {
    if (!user) return 'bg-[#FAF9F6] border-[#E0D7C6]';
    if (user.role === 'admin') return 'bg-gradient-to-r from-slate-900 to-purple-900 border-purple-700';
    if (user.role === 'caregiver') return 'bg-gradient-to-r from-[#5B8BBE] to-[#3A6EA5] border-[#2B4C7E]';
    return 'bg-gradient-to-r from-[#3A6EA5] to-[#5B8BBE] border-[#3A6EA5]';
  };

  const getTextStyle = () => {
    if (!user) return 'text-[#2B4C7E]';
    return 'text-white';
  };

  const getHoverStyle = () => {
    if (!user) return 'hover:text-[#3A6EA5]';
    return 'hover:text-gray-200';
  };

  return (
    <header className={`w-full border-b shadow-lg z-10 ${getHeaderStyle()}`}>
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className={`font-extrabold text-2xl tracking-wide ${getTextStyle()}`}
        >
          WiiCare
        </Link>

        <div className="space-x-6 flex items-center">
          <Link
            to="/"
            className={`${getTextStyle()} ${getHoverStyle()} transition-colors flex items-center gap-2`}
          >
            <i className="bi bi-house-door"></i>
            Inicio
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`${getTextStyle()} ${getHoverStyle()} transition-colors flex items-center gap-2`}
              >
                <i className="bi bi-grid"></i>
                Dashboard
              </Link>
              {user.role === 'caregiver' && (
                <Link
                  to="/crear-servicio"
                  className={`${getTextStyle()} ${getHoverStyle()} transition-colors flex items-center gap-2`}
                >
                  <i className="bi bi-plus-circle"></i>
                  Crear Servicio
                </Link>
              )}
              <Link
                to="/chat"
                className={`${getTextStyle()} ${getHoverStyle()} transition-colors flex items-center gap-2`}
              >
                <i className="bi bi-chat-dots-fill"></i>
                Mensajes
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`${getTextStyle()} ${getHoverStyle()} transition-colors flex items-center gap-2`}
                >
                  <i className="bi bi-shield-check"></i>
                  Panel Admin
                </Link>
              )}
              <Link
                to={`/perfil/${user._id}`}
                className={`${getTextStyle()} ${getHoverStyle()} transition-colors flex items-center gap-2`}
              >
                <i className="bi bi-person-circle"></i>
                Mi perfil
              </Link>
              <button
                onClick={logout}
                className={`${user.role === 'admin' ? 'text-red-400 hover:text-red-300' : 'text-red-200 hover:text-white'} transition-colors flex items-center gap-2`}
              >
                <i className="bi bi-box-arrow-right"></i>
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-5 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <i className="bi bi-box-arrow-in-right"></i>
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
