import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  // Usar la URL del backend directamente (no el proxy de Vite)
  const socketUrl = import.meta.env.VITE_API_URL || 'http://44.211.88.225';
  console.log('🔌 Conectando socket a:', socketUrl);

  socket = io(socketUrl, {
    auth: { token },
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket conectado');
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket desconectado');
  });

  socket.on('connect_error', (error) => {
    console.error('Error de conexión WebSocket:', error.message);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket no inicializado');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversation = (conversationId) => {
  if (socket) {
    console.log(`🔵 Frontend: Uniéndose a conversación ${conversationId}`);
    socket.emit('join-conversation', conversationId);
  } else {
    console.error('❌ Socket no inicializado al intentar unirse a conversación');
  }
};

export const leaveConversation = (conversationId) => {
  if (socket) {
    socket.emit('leave-conversation', conversationId);
  }
};

export const emitTyping = (conversationId, isTyping) => {
  if (socket) {
    socket.emit('typing', { conversationId, isTyping });
  }
};

export const onNewMessage = (callback) => {
  if (socket) {
    console.log('🎧 Frontend: Registrando listener para new-message');
    socket.on('new-message', callback);
  } else {
    console.error('❌ Socket no inicializado al registrar listener');
  }
};

export const onConversationUpdate = (callback) => {
  if (socket) {
    socket.on('conversation-updated', callback);
  }
};

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user-typing', callback);
  }
};

export const onUserOnline = (callback) => {
  if (socket) {
    console.log('🎯 Frontend: Registrando listener para user-online');
    socket.on('user-online', (data) => {
      console.log('🟢 Evento user-online recibido:', data);
      callback(data);
    });
  }
};

export const onUserOffline = (callback) => {
  if (socket) {
    console.log('🎯 Frontend: Registrando listener para user-offline');
    socket.on('user-offline', (data) => {
      console.log('🔴 Evento user-offline recibido:', data);
      callback(data);
    });
  }
};

export const onOnlineUsersList = (callback) => {
  if (socket) {
    console.log('🎯 Frontend: Registrando listener para online-users-list');
    socket.on('online-users-list', (data) => {
      console.log('📋 Evento online-users-list recibido:', data);
      callback(data);
    });
  }
};

export const offNewMessage = () => {
  if (socket) {
    socket.off('new-message');
  }
};

export const offConversationUpdate = () => {
  if (socket) {
    socket.off('conversation-updated');
  }
};

export const offUserTyping = () => {
  if (socket) {
    socket.off('user-typing');
  }
};

export const offUserOnline = () => {
  if (socket) {
    socket.off('user-online');
  }
};

export const offUserOffline = () => {
  if (socket) {
    socket.off('user-offline');
  }
};

export const offOnlineUsersList = () => {
  if (socket) {
    socket.off('online-users-list');
  }
};

// ✨ VIDEOLLAMADAS
export const startVideoCall = (targetUserId, conversationId, callerName) => {
  if (socket) {
    console.log(`📞 Iniciando llamada a ${targetUserId}`);
    socket.emit('start-video-call', { targetUserId, conversationId, callerName });
  }
};

export const acceptVideoCall = (callerId, conversationId) => {
  if (socket) {
    console.log(`✅ Aceptando llamada de ${callerId}`);
    socket.emit('accept-video-call', { callerId, conversationId });
  }
};

export const rejectVideoCall = (callerId, reason) => {
  if (socket) {
    console.log(`❌ Rechazando llamada de ${callerId}`);
    socket.emit('reject-video-call', { callerId, reason });
  }
};

export const cancelVideoCall = (targetUserId) => {
  if (socket) {
    console.log(`🚫 Cancelando llamada a ${targetUserId}`);
    socket.emit('cancel-video-call', { targetUserId });
  }
};

export const onIncomingVideoCall = (callback) => {
  if (socket) {
    console.log('🎧 Registrando listener para incoming-video-call');
    socket.on('incoming-video-call', callback);
  }
};

export const onCallAccepted = (callback) => {
  if (socket) {
    socket.on('call-accepted', callback);
  }
};

export const onCallRejected = (callback) => {
  if (socket) {
    socket.on('call-rejected', callback);
  }
};

export const onCallCancelled = (callback) => {
  if (socket) {
    socket.on('call-cancelled', callback);
  }
};

export const onCallFailed = (callback) => {
  if (socket) {
    socket.on('call-failed', callback);
  }
};

export const offIncomingVideoCall = () => {
  if (socket) {
    socket.off('incoming-video-call');
  }
};

export const offCallAccepted = () => {
  if (socket) {
    socket.off('call-accepted');
  }
};

export const offCallRejected = () => {
  if (socket) {
    socket.off('call-rejected');
  }
};

export const offCallCancelled = () => {
  if (socket) {
    socket.off('call-cancelled');
  }
};

export const offCallFailed = () => {
  if (socket) {
    socket.off('call-failed');
  }
};

// ✨ SENSOR DE FUERZA
export const startSensorStream = (targetUserId) => {
  if (socket) {
    console.log(`📡 Iniciando streaming de sensor para ${targetUserId}`);
    socket.emit('start-sensor-stream', { targetUserId });
  }
};

export const sendSensorData = (data) => {
  if (socket) {
    socket.emit('sensor-data', data);
  }
};

export const stopSensorStream = () => {
  if (socket) {
    console.log('📡 Deteniendo streaming de sensor');
    socket.emit('stop-sensor-stream');
  }
};

export const requestSensorStream = (patientId) => {
  if (socket) {
    console.log(`👁️ Solicitando ver sensor de ${patientId}`);
    socket.emit('request-sensor-stream', { patientId });
  }
};

export const onSensorStreamStarted = (callback) => {
  if (socket) {
    socket.on('sensor-stream-started', callback);
  }
};

export const onSensorData = (callback) => {
  if (socket) {
    socket.on('sensor-data', callback);
  }
};

export const onSensorStreamStopped = (callback) => {
  if (socket) {
    socket.on('sensor-stream-stopped', callback);
  }
};

export const onSensorStreamRequested = (callback) => {
  if (socket) {
    socket.on('sensor-stream-requested', callback);
  }
};

export const onSensorStreamError = (callback) => {
  if (socket) {
    socket.on('sensor-stream-error', callback);
  }
};

export const offSensorStreamStarted = () => {
  if (socket) {
    socket.off('sensor-stream-started');
  }
};

export const offSensorData = () => {
  if (socket) {
    socket.off('sensor-data');
  }
};

export const offSensorStreamStopped = () => {
  if (socket) {
    socket.off('sensor-stream-stopped');
  }
};

export const offSensorStreamRequested = () => {
  if (socket) {
    socket.off('sensor-stream-requested');
  }
};

export const offSensorStreamError = () => {
  if (socket) {
    socket.off('sensor-stream-error');
  }
};
