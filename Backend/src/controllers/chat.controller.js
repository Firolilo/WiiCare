const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { emitNewMessage, emitConversationUpdate } = require('../socket');

exports.listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .populate('participants', 'name email role')
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();

  // Para cada conversación, agregar info del otro participante y contar mensajes no leídos
  const enrichedConversations = await Promise.all(
    conversations.map(async (convo) => {
      // Encontrar el otro participante (no el usuario actual)
      const otherParticipant = convo.participants.find(
        (p) => p._id.toString() !== req.user.id
      );

      // Contar mensajes no leídos
      const unreadCount = await Message.countDocuments({
        conversation: convo._id,
        sender: { $ne: req.user.id },
        readAt: null
      });

      return {
        ...convo,
        otherParticipant,
        unreadCount
      };
    })
  );

  res.json({ conversations: enrichedConversations });
});

exports.listMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  
  // Verificar que el usuario es parte de la conversación
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user.id
  });

  if (!conversation) {
    return res.status(404).json({ message: 'Conversación no encontrada' });
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name email role')
    .sort({ createdAt: 1 })
    .lean();

  // Marcar como leídos los mensajes que no son del usuario actual
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user.id },
      readAt: null
    },
    { readAt: new Date() }
  );

  res.json({ messages });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content, conversationId } = req.body;
  
  if (!content) {
    return res.status(400).json({ message: 'El contenido es requerido' });
  }

  let convo;

  // Si se proporciona conversationId, usarlo
  if (conversationId) {
    convo = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });
    
    if (!convo) {
      return res.status(404).json({ message: 'Conversación no encontrada' });
    }
  } 
  // Si no, crear o encontrar conversación con recipientId
  else if (recipientId) {
    convo = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] }
    });
    
    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user.id, recipientId]
      });
    }
  } else {
    return res.status(400).json({ message: 'recipientId o conversationId son requeridos' });
  }

  const msg = await Message.create({
    conversation: convo._id,
    sender: req.user.id,
    content
  });

  // Actualizar última mensaje en la conversación
  convo.lastMessage = content.substring(0, 100); // Limitar a 100 caracteres
  convo.lastMessageAt = msg.createdAt;
  await convo.save();

  // Poblar el sender en el mensaje antes de devolverlo
  await msg.populate('sender', 'name email role');

  // ✨ EMITIR EVENTO DE WEBSOCKET
  const io = req.app.get('io');
  if (io) {
    // Convertir el mensaje a un objeto plano para emitirlo
    const messageToEmit = {
      _id: msg._id.toString(),
      conversation: convo._id.toString(),
      sender: {
        _id: msg.sender._id.toString(),
        name: msg.sender.name,
        email: msg.sender.email,
        role: msg.sender.role
      },
      content: msg.content,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    };
    
    // Emitir nuevo mensaje a todos en la conversación
    emitNewMessage(io, convo._id.toString(), messageToEmit);
    
    // Notificar a AMBOS participantes sobre la actualización de la conversación
    const populatedConvo = await Conversation.findById(convo._id)
      .populate('participants', 'name email role')
      .lean();
    
    // Agregar información enriquecida para cada participante
    for (const participantId of convo.participants) {
      const otherParticipant = populatedConvo.participants.find(
        p => p._id.toString() !== participantId.toString()
      );
      
      // Contar mensajes no leídos para este participante específico
      const unreadCount = await Message.countDocuments({
        conversation: convo._id,
        sender: { $ne: participantId },
        readAt: null
      });
      
      const enrichedConvo = {
        ...populatedConvo,
        otherParticipant,
        unreadCount
      };
      
      emitConversationUpdate(io, participantId.toString(), enrichedConvo);
    }
  }

  res.status(201).json({ message: msg, conversationId: convo._id });
});

// Nueva función para obtener o crear conversación con un usuario
exports.getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'userId es requerido' });
  }

  // Verificar que el otro usuario existe
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  // Buscar conversación existente
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user.id, userId] }
  }).populate('participants', 'name email role');

  // Si no existe, crearla
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user.id, userId]
    });
    await conversation.populate('participants', 'name email role');
  }

  res.json({ conversation });
});
