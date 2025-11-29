import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api/client';
import { initializeSocket, disconnectSocket } from '../socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          // Inicializar WebSocket cuando hay usuario
          initializeSocket(token);
        })
        .catch(() => {
          localStorage.removeItem('token');
          disconnectSocket();
        });
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.token;
    localStorage.setItem('token', token);
    setUser(res.data.user);
    // Inicializar WebSocket
    initializeSocket(token);
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const token = res.data.token;
    localStorage.setItem('token', token);
    setUser(res.data.user);
    // Inicializar WebSocket
    initializeSocket(token);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Desconectar WebSocket
    disconnectSocket();
  };

  return <AuthContext.Provider value={{ user, login, logout,register }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.node,
};
