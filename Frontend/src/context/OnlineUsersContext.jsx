import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import {
  onUserOnline,
  onUserOffline,
  onOnlineUsersList,
  offUserOnline,
  offUserOffline,
  offOnlineUsersList,
  requestOnlineUsers,
  getSocket,
  isSocketConnected
} from '../socket';

const OnlineUsersContext = createContext(null);

export function OnlineUsersProvider({ children }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const listenersRegistered = useRef(false);

  // Función para verificar si un usuario está online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  // Registrar listeners cuando el usuario está autenticado
  useEffect(() => {
    if (!user) {
      setOnlineUsers(new Set());
      listenersRegistered.current = false;
      return;
    }

    // Evitar registrar múltiples veces
    if (listenersRegistered.current) {
      return;
    }

    console.log('🌐 [OnlineUsersContext] Iniciando listeners globales de presencia');
    listenersRegistered.current = true;

    // Recibir la lista de usuarios en línea
    onOnlineUsersList(({ userIds }) => {
      console.log('🌐 [OnlineUsersContext] Lista de usuarios en línea:', userIds);
      setOnlineUsers(new Set(userIds));
    });

    // Listener para usuarios que se conectan
    onUserOnline(({ userId }) => {
      console.log('🌐 [OnlineUsersContext] Usuario conectado:', userId);
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    // Listener para usuarios que se desconectan
    onUserOffline(({ userId }) => {
      console.log('🌐 [OnlineUsersContext] Usuario desconectado:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Solicitar la lista de usuarios online
    const requestList = () => {
      if (isSocketConnected()) {
        console.log('🌐 [OnlineUsersContext] Solicitando lista de usuarios online...');
        requestOnlineUsers();
      }
    };

    // Intentar solicitar inmediatamente
    requestList();

    // También solicitar cuando el socket se conecte/reconecte
    const socket = getSocket();
    if (socket) {
      socket.on('connect', requestList);
    }

    // Cleanup
    return () => {
      console.log('🌐 [OnlineUsersContext] Limpiando listeners globales');
      offUserOnline();
      offUserOffline();
      offOnlineUsersList();
      if (socket) {
        socket.off('connect', requestList);
      }
      listenersRegistered.current = false;
    };
  }, [user]);

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, isUserOnline }}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  if (!context) {
    throw new Error('useOnlineUsers debe usarse dentro de OnlineUsersProvider');
  }
  return context;
};

OnlineUsersProvider.propTypes = {
  children: PropTypes.node,
};
