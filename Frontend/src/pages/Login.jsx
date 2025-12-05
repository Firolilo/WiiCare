import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthForm() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegister && !name)) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setLoading(true);
      if (isRegister) await register(name, email, password, role);
      else await login(email, password);
      navigate('/');
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        (e.message?.includes('Network') && 'Error de conexión con el servidor.') ||
        (e.message?.includes('409') && 'El correo ya está registrado.') ||
        (e.message?.includes('401') && 'Credenciales incorrectas.') ||
        'Error en la autenticación.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // No mostrar el formulario si ya está autenticado
  if (user) {
    return null;
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6 py-10">
      <div className="bg-white shadow-md border border-[#E0D7C6] rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#2B4C7E] mb-6 text-center">
          {isRegister ? 'Registrar cuenta' : 'Iniciar sesión'}
        </h1>

        <form onSubmit={onSubmit} className="space-y-4">
          {isRegister && (
            <>
              <input
                data-cy="register-name"
                name="name"
                className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] p-2 rounded-lg outline-none transition"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <select
                data-cy="register-role"
                name="role"
                className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] p-2 rounded-lg outline-none transition"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">Paciente</option>
                <option value="caregiver">Cuidador</option>
              </select>
            </>
          )}

          <input
            data-cy="login-email"
            name="email"
            type="email"
            className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] p-2 rounded-lg outline-none transition"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            data-cy="login-password"
            name="password"
            type="password"
            className="w-full border border-[#D8CFC4] focus:border-[#3A6EA5] p-2 rounded-lg outline-none transition"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            data-cy="login-submit"
            type="submit"
            disabled={loading}
            className="bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-4 py-2 rounded-lg w-full transition-all shadow-sm disabled:bg-[#8FAFD3]"
          >
            {loading ? 'Procesando...' : isRegister ? 'Registrar' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-[#5A5A5A]">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            data-cy="toggle-auth-mode"
            type="button"
            className="text-[#2B4C7E] hover:underline"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </section>
  );
}