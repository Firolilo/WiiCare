const jwt = require('jsonwebtoken');

// Almacenar usuarios conectados: { userId: socketId }
const connectedUsers = new Map();

function setupSocketIO(io) {
  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`✅ User connected: ${userId}`);

    // Registrar usuario conectado
    connectedUsers.set(userId, socket.id);

    // Enviar al usuario recién conectado la lista de usuarios ya conectados
    const onlineUserIds = Array.from(connectedUsers.keys());
    socket.emit('online-users-list', { userIds: onlineUserIds });
    console.log(`📋 Enviando lista de usuarios en línea a ${userId}:`, onlineUserIds);

    // Emitir a TODOS (incluyendo el que se acaba de conectar) que este usuario está en línea
    io.emit('user-online', { userId });
    console.log(`🟢 Emitiendo user-online para ${userId}`);

    // Solicitar lista de usuarios online (para cuando el cliente se reconecta o navega)
    socket.on('get-online-users', () => {
      const onlineUserIds = Array.from(connectedUsers.keys());
      console.log(`🔄 Usuario ${userId} solicitó lista de online. Enviando:`, onlineUserIds);
      socket.emit('online-users-list', { userIds: onlineUserIds });
    });

    // Unirse a una sala de conversación
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`✅ User ${userId} joined conversation:${conversationId}`);
      console.log(`📊 Total rooms for this socket:`, Array.from(socket.rooms));
    });
    });

    // Salir de una sala de conversación
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });

    // Indicador de "escribiendo..."
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        userId,
        isTyping
      });
    });

    // Marcar mensajes como leídos
    socket.on('mark-read', ({ conversationId, messageIds }) => {
      socket.to(`conversation:${conversationId}`).emit('messages-read', {
        userId,
        messageIds
      });
    });

    // ✨ VIDEOLLAMADAS
    // Iniciar videollamada (notificar al otro usuario)
    socket.on('start-video-call', ({ targetUserId, conversationId, callerName }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        console.log(`📞 Llamada de ${userId} (${callerName}) a ${targetUserId}`);
        io.to(targetSocketId).emit('incoming-video-call', {
          callerId: userId,
          callerName,
          conversationId
        });
      } else {
        console.log(`❌ Usuario ${targetUserId} no está conectado para recibir llamada`);
        socket.emit('call-failed', { reason: 'Usuario no disponible' });
      }
    });

    // Aceptar videollamada
    socket.on('accept-video-call', ({ callerId, conversationId }) => {
      const callerSocketId = connectedUsers.get(callerId);
      if (callerSocketId) {
        console.log(`✅ ${userId} aceptó llamada de ${callerId}`);
        // Emitir a AMBOS usuarios que la llamada fue aceptada
        io.to(callerSocketId).emit('call-accepted', { conversationId });
        socket.emit('call-accepted', { conversationId });
      }
    });

    // Rechazar videollamada
    socket.on('reject-video-call', ({ callerId, reason }) => {
      const callerSocketId = connectedUsers.get(callerId);
      if (callerSocketId) {
        console.log(`❌ ${userId} rechazó llamada de ${callerId}`);
        io.to(callerSocketId).emit('call-rejected', { reason: reason || 'Llamada rechazada' });
      }
    });

    // Cancelar videollamada (antes de que respondan)
    socket.on('cancel-video-call', ({ targetUserId }) => {
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        console.log(`🚫 ${userId} canceló llamada a ${targetUserId}`);
        io.to(targetSocketId).emit('call-cancelled');
      }
    });

    // ✨ SENSOR DE FUERZA
    // Paciente comienza a transmitir datos del sensor
    socket.on('start-sensor-stream', ({ targetUserId }) => {
      socket.sensorTargetUserId = targetUserId;
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        console.log(`📡 ${userId} iniciando streaming de sensor para ${targetUserId}`);
        io.to(targetSocketId).emit('sensor-stream-started', { patientId: userId });
      }
    });

    // Paciente envía datos del sensor
    socket.on('sensor-data', (data) => {
      const targetUserId = socket.sensorTargetUserId;
      if (targetUserId) {
        const targetSocketId = connectedUsers.get(targetUserId);
        if (targetSocketId) {
          io.to(targetSocketId).emit('sensor-data', {
            patientId: userId,
            ...data
          });
        }
      }
    });

    // Paciente detiene streaming del sensor
    socket.on('stop-sensor-stream', () => {
      const targetUserId = socket.sensorTargetUserId;
      if (targetUserId) {
        const targetSocketId = connectedUsers.get(targetUserId);
        if (targetSocketId) {
          console.log(`📡 ${userId} detuvo streaming de sensor`);
          io.to(targetSocketId).emit('sensor-stream-stopped', { patientId: userId });
        }
      }
      socket.sensorTargetUserId = null;
    });

    // Cuidador solicita ver sensor de un paciente
    socket.on('request-sensor-stream', ({ patientId }) => {
      const patientSocketId = connectedUsers.get(patientId);
      if (patientSocketId) {
        console.log(`👁️ Cuidador ${userId} solicita ver sensor de ${patientId}`);
        io.to(patientSocketId).emit('sensor-stream-requested', { caregiverId: userId });
      } else {
        socket.emit('sensor-stream-error', { message: 'Paciente no conectado' });
      }
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${userId}`);
      connectedUsers.delete(userId);
      
      // Emitir a todos que este usuario está desconectado
      io.emit('user-offline', { userId });
      console.log(`🔴 Emitiendo user-offline para ${userId}`);
    });
  });

  return io;
}

// Función para emitir un nuevo mensaje a una conversación
function emitNewMessage(io, conversationId, message) {
  console.log(`📤 Emitiendo mensaje a conversation:${conversationId}`);
  console.log('📨 Mensaje:', JSON.stringify(message, null, 2));
  io.to(`conversation:${conversationId}`).emit('new-message', message);
  console.log('✅ Mensaje emitido correctamente');
}

// Función para notificar actualización de conversación
function emitConversationUpdate(io, userId, conversation) {
  console.log(`📢 Emitiendo conversation-updated a usuario ${userId}`);
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    console.log(`✅ Usuario ${userId} está conectado, enviando actualización`);
    io.to(socketId).emit('conversation-updated', conversation);
  } else {
    console.log(`⚠️ Usuario ${userId} NO está conectado`);
  }
}

// Función para verificar si un usuario está en línea
function isUserOnline(userId) {
  return connectedUsers.has(userId);
}

module.exports = {
  setupSocketIO,
  emitNewMessage,
  emitConversationUpdate,
  connectedUsers,
  isUserOnline
};
