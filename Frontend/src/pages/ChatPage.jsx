import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVideoCall } from '../context/VideoCallContext';
import api from '../api/client';
import { 
  joinConversation, 
  leaveConversation, 
  onNewMessage, 
  onConversationUpdate,
  onUserOnline,
  onUserOffline,
  onOnlineUsersList,
  offNewMessage,
  offConversationUpdate,
  offUserOnline,
  offUserOffline,
  offOnlineUsersList
} from '../socket';

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { calling, startVideoCall, cancelVideoCall } = useVideoCall();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  // Auto-scroll al final cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar lista de conversaciones
  useEffect(() => {
    loadConversations();
  }, []);

  // ✨ Listener para PRESENCIA (solo se ejecuta una vez al montar)
  useEffect(() => {
    console.log('🎬 Iniciando listeners de presencia');
    
    // Recibir la lista inicial de usuarios en línea
    onOnlineUsersList(({ userIds }) => {
      console.log('📋 Lista inicial de usuarios en línea:', userIds);
      setOnlineUsers(new Set(userIds));
      console.log('✅ onlineUsers actualizado a:', userIds);
    });

    // Listener para usuarios que se conectan
    onUserOnline(({ userId }) => {
      console.log('🟢 Usuario conectado en ChatPage:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set([...prev, userId]);
        console.log('✅ onlineUsers después de agregar:', Array.from(newSet));
        return newSet;
      });
    });

    // Listener para usuarios que se desconectan
    onUserOffline(({ userId }) => {
      console.log('🔴 Usuario desconectado en ChatPage:', userId);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        console.log('✅ onlineUsers después de eliminar:', Array.from(newSet));
        return newSet;
      });
    });

    // Cleanup: remover listeners de presencia
    return () => {
      console.log('🧹 Limpiando listeners de presencia');
      offUserOnline();
      offUserOffline();
      offOnlineUsersList();
    };
  }, []); // SIN dependencias - solo se ejecuta al montar/desmontar

  // ✨ Listener GLOBAL para actualizar lista de conversaciones
  useEffect(() => {
    console.log('🎬 Iniciando listeners de conversaciones/mensajes');
    
    // Listener para actualizaciones de conversación (PRIORIDAD ALTA)
    onConversationUpdate((updatedConvo) => {
      console.log('🔄 [CONVERSATION-UPDATED] Recibido:', updatedConvo._id, updatedConvo);
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c._id === updatedConvo._id) {
            console.log('✅ Reemplazando conversación completa en lista');
            return updatedConvo;
          }
          return c;
        }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        
        // Si la conversación no existe en la lista, agregarla
        if (!prev.find(c => c._id === updatedConvo._id)) {
          console.log('➕ Agregando nueva conversación a la lista');
          return [updatedConvo, ...prev].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
        }
        
        return updated;
      });
    });

    // Listener global para nuevos mensajes en CUALQUIER conversación
    onNewMessage((message) => {
      console.log('📨 [NEW-MESSAGE] Recibido:', message);
      
      const msgConvoId = typeof message.conversation === 'string' 
        ? message.conversation 
        : message.conversation?._id || message.conversation?.toString();

      // Si es la conversación activa, agregar a mensajes
      if (msgConvoId === conversationId) {
        console.log('✅ Mensaje agregado a la conversación activa');
        setMessages(prev => {
          // Evitar duplicados
          if (prev.some(m => m._id === message._id || m._id.toString() === message._id.toString())) {
            console.log('⚠️ Mensaje duplicado, ignorando');
            return prev;
          }
          return [...prev, message];
        });
        lastMessageCountRef.current += 1;
        setTimeout(scrollToBottom, 100);
      }
    });

    // Cleanup: remover listeners de conversaciones/mensajes
    return () => {
      console.log('🧹 Limpiando listeners de conversaciones/mensajes');
      offNewMessage();
      offConversationUpdate();
    };
  }, [conversationId]); // Dependencia de conversationId para actualizar mensajes

  // Configurar WebSocket listeners y cargar mensajes
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      
      // ✨ Unirse a la conversación vía WebSocket
      joinConversation(conversationId);
    }

    // Cleanup: salir de la conversación cuando se cambia o desmonta
    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId]);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/chat');
      setConversations(res.data.conversations);
      
      // Si hay conversationId en URL, seleccionarla
      if (conversationId && !silent) {
        const convo = res.data.conversations.find(c => c._id === conversationId);
        setActiveConversation(convo);
      }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadMessages = async (convId, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const res = await api.get(`/chat/${convId}/messages`);
      const newMessages = res.data.messages;
      
      setMessages(newMessages);
      lastMessageCountRef.current = newMessages.length;
      
      // Actualizar el contador de no leídos en la lista
      setConversations(prev => 
        prev.map(c => c._id === convId ? { ...c, unreadCount: 0 } : c)
      );
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    navigate(`/chat/${conversation._id}`);
  };

  // ✨ Iniciar videollamada
  const handleStartVideoCall = () => {
    if (!activeConversation) return;
    
    const targetUserId = activeConversation.otherParticipant._id;
    const callerName = user.name;

    console.log('📞 Iniciando llamada a:', activeConversation.otherParticipant.name);
    startVideoCall(targetUserId, activeConversation._id, callerName);
  };

  // ✨ Cancelar llamada saliente
  const handleCancelCall = () => {
    cancelVideoCall();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);
    const tempMessage = newMessage;
    setNewMessage('');

    try {
      await api.post('/chat/message', {
        conversationId: activeConversation._id,
        content: tempMessage
      });

      // ✨ El WebSocket se encargará de agregar el mensaje automáticamente
      // y actualizar la lista de conversaciones vía 'new-message' event
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setNewMessage(tempMessage); // Restaurar mensaje si falla
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (message) => {
    return message.sender._id === user?._id;
  };

  const formatTime = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffMs = now - msgDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return msgDate.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return (
      <section className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <p className="text-lg text-[#2B4C7E] animate-pulse">Cargando conversaciones...</p>
      </section>
    );
  }

  return (
    <section className="h-[calc(100vh-80px)] flex bg-[#f5f0e8]">
      {/* Columna Izquierda - Lista de Conversaciones (estilo Discord) */}
      <aside className="w-80 bg-[#2B4C7E] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#3A6EA5]">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <i className="bi bi-chat-dots-fill"></i>
            Mensajes
          </h2>
          {/* Debug: Mostrar usuarios en línea */}
          <p className="text-xs text-white/50 mt-1">
            En línea: {Array.from(onlineUsers).join(', ') || 'ninguno'}
          </p>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-white/60">
              <i className="bi bi-inbox text-4xl mb-2 block"></i>
              <p className="text-sm">No hay conversaciones aún</p>
              <p className="text-xs mt-2">Inicia un chat desde el Dashboard</p>
            </div>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo._id}
                onClick={() => handleSelectConversation(convo)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-[#3A6EA5] transition border-b border-[#3A6EA5]/30 ${
                  activeConversation?._id === convo._id ? 'bg-[#3A6EA5]' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-[#5B8BBE] rounded-full flex items-center justify-center text-white font-bold">
                    {convo.otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {/* Indicador de en línea */}
                  {onlineUsers.has(convo.otherParticipant?._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2B4C7E]"></div>
                  )}
                  {/* Badge de mensajes no leídos */}
                  {convo.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {convo.unreadCount}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white text-sm truncate">
                      {convo.otherParticipant?.name || 'Paciente'}
                    </h3>
                    {convo.lastMessageAt && (
                      <span className="text-xs text-white/60">
                        {formatTime(convo.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${convo.unreadCount > 0 ? 'text-white font-medium' : 'text-white/60'}`}>
                    {convo.lastMessage || 'Sin mensajes'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Columna Derecha - Conversación Activa */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Header de conversación */}
            <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3A6EA5] rounded-full flex items-center justify-center text-white font-bold">
                  {activeConversation.otherParticipant?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-[#2B4C7E]">
                    {activeConversation.otherParticipant?.name || 'Paciente'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {activeConversation.otherParticipant?.role === 'caregiver' ? 'Cuidador profesional' : 'Paciente'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Botón de Videollamada */}
                {calling ? (
                  <button
                    onClick={handleCancelCall}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm animate-pulse"
                    title="Cancelar llamada"
                  >
                    <i className="bi bi-telephone-x-fill text-lg"></i>
                    Cancelar llamada...
                  </button>
                ) : (
                  <button
                    onClick={handleStartVideoCall}
                    className="bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm"
                    title="Iniciar videollamada"
                  >
                    <i className="bi bi-camera-video-fill text-lg"></i>
                    Videollamada
                  </button>
                )}

                {/* Indicador de presencia */}
                <div className="flex items-center gap-2">
                  {onlineUsers.has(activeConversation.otherParticipant?._id) ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-sm text-green-600 font-medium">En línea</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="text-sm text-gray-500">
                        Desconectado (ID: {activeConversation.otherParticipant?._id?.slice(-4)})
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Área de mensajes */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-[#f5f0e8]"
            >
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500 animate-pulse">Cargando mensajes...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <i className="bi bi-chat-text text-6xl mb-4 text-gray-300"></i>
                  <p className="text-lg font-semibold">No hay mensajes aún</p>
                  <p className="text-sm">Envía un mensaje para iniciar la conversación</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message, idx) => {
                    const showDate = idx === 0 || 
                      new Date(messages[idx - 1].createdAt).toDateString() !== 
                      new Date(message.createdAt).toDateString();

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {new Date(message.createdAt).toLocaleDateString('es-BO', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              isMyMessage(message)
                                ? 'bg-[#3A6EA5] text-white rounded-br-sm'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                            }`}
                          >
                            {!isMyMessage(message) && (
                              <p className="text-xs font-semibold mb-1 text-[#2B4C7E]">
                                {message.sender?.name}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p
                                className={`text-xs ${
                                  isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString('es-BO', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {isMyMessage(message) && (
                                <span className="text-xs text-blue-100">
                                  {message.readAt ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input de mensaje */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Mensaje a ${activeConversation.otherParticipant?.name || 'paciente'}...`}
                  className="flex-1 border border-gray-300 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 px-4 py-3 rounded-full outline-none transition"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-6 py-3 rounded-full transition-all shadow-sm disabled:bg-[#8FAFD3] disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <i className="bi bi-hourglass-split animate-spin"></i>
                      Enviando
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill"></i>
                      Enviar
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <i className="bi bi-chat-square-text text-8xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Selecciona una conversación</h3>
            <p className="text-sm">Elige un chat de la lista para comenzar</p>
          </div>
        )}
      </div>
    </section>
  );
}
