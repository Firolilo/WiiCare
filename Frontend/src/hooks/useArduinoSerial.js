import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const LOCAL_SERVER_URL = 'http://localhost:3001';

/**
 * Hook para comunicación con el servidor local Arduino
 */
export function useArduinoSerial() {
  const [isConnected, setIsConnected] = useState(false);
  const [ports, setPorts] = useState([]);
  const [currentPort, setCurrentPort] = useState(null);
  const [lastReading, setLastReading] = useState(null);
  const [readings, setReadings] = useState([]);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [isServerOnline, setIsServerOnline] = useState(false);
  
  const socketRef = useRef(null);

  // Conectar al WebSocket del servidor local
  useEffect(() => {
    const socket = io(LOCAL_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('✅ Conectado al servidor local Arduino');
      setIsServerOnline(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor local');
      setIsServerOnline(false);
    });

    socket.on('connect_error', () => {
      setIsServerOnline(false);
      setError('Servidor local no disponible. Ejecuta: cd Frontend/local-server && npm start');
    });

    socket.on('status', (status) => {
      setIsConnected(status.isConnected);
      setCurrentPort(status.port);
      if (status.lastReading) {
        setLastReading(status.lastReading);
      }
    });

    socket.on('force-reading', (reading) => {
      setLastReading(reading);
      setReadings(prev => [...prev.slice(-99), reading]); // Mantener últimas 100
    });

    socket.on('serial-error', ({ error }) => {
      setError(error);
      setIsConnected(false);
    });

    socket.on('serial-disconnected', () => {
      setIsConnected(false);
      setCurrentPort(null);
    });

    socket.on('session-started', (sessionData) => {
      setSession(sessionData);
      setReadings([]);
    });

    socket.on('session-stopped', () => {
      setSession(null);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Listar puertos disponibles
  const listPorts = useCallback(async () => {
    try {
      const response = await fetch(`${LOCAL_SERVER_URL}/ports`);
      const data = await response.json();
      if (data.success) {
        setPorts(data.ports);
        return data.ports;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  // Conectar al Arduino
  const connect = useCallback(async (portPath, baudRate = 9600) => {
    try {
      setError(null);
      const response = await fetch(`${LOCAL_SERVER_URL}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portPath, baudRate })
      });
      const data = await response.json();
      if (data.success) {
        setIsConnected(true);
        setCurrentPort(portPath);
        return true;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // Desconectar
  const disconnect = useCallback(async () => {
    try {
      await fetch(`${LOCAL_SERVER_URL}/disconnect`, { method: 'POST' });
      setIsConnected(false);
      setCurrentPort(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Iniciar sesión de medición
  const startSession = useCallback(async (userId, token) => {
    try {
      // Enviar token de auth
      await fetch(`${LOCAL_SERVER_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const response = await fetch(`${LOCAL_SERVER_URL}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token })
      });
      const data = await response.json();
      if (data.success) {
        setSession(data.session);
        setReadings([]);
        return data.session;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Finalizar sesión
  const stopSession = useCallback(async () => {
    try {
      const response = await fetch(`${LOCAL_SERVER_URL}/session/stop`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setSession(null);
        return data.session;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Calcular estadísticas
  const stats = readings.length > 0 ? {
    avg: readings.reduce((a, r) => a + r.forceNewtons, 0) / readings.length,
    max: Math.max(...readings.map(r => r.forceNewtons)),
    min: Math.min(...readings.map(r => r.forceNewtons)),
    count: readings.length
  } : null;

  return {
    // Estado
    isServerOnline,
    isConnected,
    ports,
    currentPort,
    lastReading,
    readings,
    session,
    error,
    stats,
    
    // Acciones
    listPorts,
    connect,
    disconnect,
    startSession,
    stopSession,
    clearError: () => setError(null)
  };
}

export default useArduinoSerial;
