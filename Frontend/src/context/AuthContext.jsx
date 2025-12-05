import { createContext, useContext, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import api from '../api/client';
import { initializeSocket, disconnectSocket } from '../socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketInitialized = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          // Solo inicializar si no se ha hecho antes
          if (!socketInitialized.current) {
            socketInitialized.current = true;
            initializeSocket(token);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          disconnectSocket();
          socketInitialized.current = false;
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Cleanup al desmontar
    return () => {
      // No desconectar aquí - solo cuando logout explícito
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.token;
    localStorage.setItem('token', token);
    setUser(res.data.user);
    // Inicializar WebSocket
    socketInitialized.current = true;
    initializeSocket(token);
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const token = res.data.token;
    localStorage.setItem('token', token);
    setUser(res.data.user);
    // Inicializar WebSocket
    socketInitialized.current = true;
    initializeSocket(token);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Desconectar WebSocket
    disconnectSocket();
    socketInitialized.current = false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.node,
};
