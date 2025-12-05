import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Chat() {
  const { caregiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Validar que caregiverId existe
  useEffect(() => {
    if (!caregiverId || caregiverId === 'undefined') {
      console.error('ID de cuidador inválido');
      navigate('/dashboard');
      return;
    }
  }, [caregiverId, navigate]);

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!caregiverId || caregiverId === 'undefined') return;
    
    // Cargar datos del cuidador
    const loadCaregiverData = async () => {
      try {
        const res = await api.get(`/users/${caregiverId}`);
        setCaregiver(res.data.user);
        
        // MOCKUP: Cargar mensajes simulados
        loadMockMessages();
      } catch (error) {
        console.error('Error al cargar datos del cuidador:', error);
        // Usar datos mock si falla
        setCaregiver({
          _id: caregiverId,
          name: 'Cuidador Demo',
          email: 'demo@example.com',
          role: 'caregiver'
        });
        loadMockMessages();
      } finally {
        setLoading(false);
      }
    };

    loadCaregiverData();
  }, [caregiverId]);

  const loadMockMessages = () => {
    // Mensajes de ejemplo para el mockup
    const mockMessages = [
      {
        _id: '1',
        sender: { _id: caregiverId, name: 'Cuidador Demo' },
        content: '¡Hola! Gracias por tu interés en mi servicio. ¿En qué puedo ayudarte?',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        readAt: new Date(Date.now() - 3500000).toISOString()
      },
      {
        _id: '2',
        sender: { _id: user?._id, name: user?.name || 'Tú' },
        content: 'Hola, me interesa el servicio de cuidado de adultos mayores. ¿Tienes disponibilidad para la próxima semana?',
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        readAt: new Date(Date.now() - 2900000).toISOString()
      },
      {
        _id: '3',
        sender: { _id: caregiverId, name: 'Cuidador Demo' },
        content: 'Sí, tengo disponibilidad. ¿Qué días y horarios necesitas?',
        createdAt: new Date(Date.now() - 2400000).toISOString(),
        readAt: new Date(Date.now() - 2300000).toISOString()
      },
      {
        _id: '4',
        sender: { _id: user?._id, name: user?.name || 'Tú' },
        content: 'Necesito de lunes a viernes, de 8:00 a 14:00. ¿Cuál sería la tarifa?',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        readAt: new Date(Date.now() - 1700000).toISOString()
      },
      {
        _id: '5',
        sender: { _id: caregiverId, name: 'Cuidador Demo' },
        content: 'Perfecto, puedo cubrir ese horario. La tarifa es de 50 Bs/h, con un descuento del 10% para servicios de semana completa.',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        readAt: null
      }
    ];
    setMessages(mockMessages);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);

    try {
      // MOCKUP: Simular envío de mensaje
      const mockNewMessage = {
        _id: Date.now().toString(),
        sender: { _id: user?._id, name: user?.name || 'Tú' },
        content: newMessage,
        createdAt: new Date().toISOString(),
        readAt: null
      };

      setMessages(prev => [...prev, mockNewMessage]);
      setNewMessage('');

      // Simular respuesta automática del cuidador después de 2 segundos
      setTimeout(() => {
        const autoReply = {
          _id: (Date.now() + 1).toString(),
          sender: { _id: caregiverId, name: caregiver?.name || 'Cuidador Demo' },
          content: 'Gracias por tu mensaje. Te responderé en breve. 😊',
          createdAt: new Date().toISOString(),
          readAt: null
        };
        setMessages(prev => [...prev, autoReply]);
      }, 2000);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (message) => {
    return message.sender._id === user?._id;
  };

  if (loading) {
    return (
      <section className="flex justify-center items-center min-h-[calc(95vh-80px)]">
        <p className="text-lg text-[#2B4C7E] animate-pulse">Cargando chat...</p>
      </section>
    );
  }

  return (
    <section className="h-[calc(100vh-80px)] flex flex-col bg-gradient-to-b from-white to-[#f5f0e8]">
      {/* Header del Chat */}
      <div className="bg-white border-b border-[#E0D7C6] shadow-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-[#2B4C7E] hover:text-[#3A6EA5] transition"
            >
              ← Volver
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#3A6EA5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {caregiver?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <h2 className="font-bold text-[#2B4C7E] text-lg">
                  {caregiver?.name || 'Cuidador'}
                </h2>
                <p className="text-sm text-gray-500">
                  {caregiver?.role === 'caregiver' ? 'Cuidador profesional' : 'Paciente'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">En línea</span>
          </div>
        </div>
      </div>

      {/* Banner de Mockup */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Modo Demo:</strong> Este es un mockup del chat. Los mensajes son simulados.
          </p>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">No hay mensajes aún</p>
              <p className="text-sm">Envía un mensaje para iniciar la conversación</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    isMyMessage(message)
                      ? 'bg-[#3A6EA5] text-white rounded-br-sm'
                      : 'bg-white border border-[#E0D7C6] text-gray-800 rounded-bl-sm'
                  }`}
                >
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
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input de Mensaje */}
      <div className="bg-white border-t border-[#E0D7C6] px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 border border-[#D8CFC4] focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 px-4 py-3 rounded-full outline-none transition"
              disabled={sending}
              data-cy="chat-input"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-[#3A6EA5] hover:bg-[#2B4C7E] text-white px-6 py-3 rounded-full transition-all shadow-sm disabled:bg-[#8FAFD3] disabled:cursor-not-allowed font-medium flex items-center gap-2"
              data-cy="chat-send"
            >
              {sending ? (
                <>
                  <span className="animate-spin">↻</span>
                  Enviando...
                </>
              ) : (
                <>
                  Enviar
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
