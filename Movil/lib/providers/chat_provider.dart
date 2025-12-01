import 'package:flutter/material.dart';
import '../models/conversation.dart';
import '../models/message.dart';
import '../services/api_service.dart';
import '../services/chat_service.dart';

/// Provider para gestionar el estado global del chat
class ChatProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final ChatService _chatService = ChatService();

  List<Conversation> _conversations = [];
  Map<String, List<Message>> _messagesByConversation = {};
  Set<String> _onlineUsers = {};
  bool _isLoading = false;
  String? _error;
  bool _listenersConfigured = false; // Flag para evitar múltiples configuraciones

  // Estado de videollamadas
  Map<String, dynamic>? _incomingCall; // { callerId, callerName, conversationId }
  bool _isCalling = false;
  String? _activeCallConversationId;

  // Getters
  List<Conversation> get conversations => _conversations;
  Map<String, List<Message>> get messagesByConversation => _messagesByConversation;
  Set<String> get onlineUsers => _onlineUsers;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get incomingCall => _incomingCall;
  bool get isCalling => _isCalling;
  String? get activeCallConversationId => _activeCallConversationId;

  /// Inicializar conexión con WebSocket
  Future<void> initialize(String token) async {
    try {
      print('🎬 Inicializando ChatProvider');
      await _chatService.connect(token);
      
      // Solo configurar listeners una vez
      if (!_listenersConfigured) {
        _setupListeners();
        _listenersConfigured = true;
      }
      
      await loadConversations();
    } catch (e) {
      print('❌ Error al inicializar chat: $e');
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Configurar listeners de WebSocket
  void _setupListeners() {
    print('🎧 Configurando listeners de WebSocket');
    
    // Limpiar listeners previos para evitar duplicados
    _chatService.clearAllListeners();

    // Listener para nuevos mensajes
    _chatService.onNewMessage((data) {
      print('💬 Nuevo mensaje recibido: $data');
      try {
        final message = Message.fromJson(data as Map<String, dynamic>);
        _addMessageToConversation(message);
      } catch (e) {
        print('❌ Error al procesar nuevo mensaje: $e');
      }
    });

    // Listener para actualizaciones de conversación
    _chatService.onConversationUpdate((data) {
      print('🔄 Actualización de conversación: $data');
      try {
        final conversation = Conversation.fromJson(data as Map<String, dynamic>);
        _updateConversation(conversation);
      } catch (e) {
        print('❌ Error al procesar actualización de conversación: $e');
      }
    });

    // Listeners de presencia
    _chatService.onOnlineUsersList((data) {
      print('📋 Lista de usuarios en línea: $data');
      final userIds = List<String>.from(data['userIds'] as List);
      _onlineUsers = userIds.toSet();
      notifyListeners();
    });

    _chatService.onUserOnline((data) {
      print('🟢 Usuario conectado: ${data['userId']}');
      _onlineUsers.add(data['userId'] as String);
      notifyListeners();
    });

    _chatService.onUserOffline((data) {
      print('🔴 Usuario desconectado: ${data['userId']}');
      _onlineUsers.remove(data['userId'] as String);
      notifyListeners();
    });

    // Listeners de videollamadas
    _chatService.onIncomingVideoCall((data) {
      print('📞 Llamada entrante: $data');
      _incomingCall = data as Map<String, dynamic>;
      notifyListeners();
    });

    _chatService.onCallAccepted((data) {
      print('✅ Llamada aceptada: $data');
      _isCalling = false;
      _activeCallConversationId = data['conversationId'] as String?;
      notifyListeners();
    });

    _chatService.onCallRejected((data) {
      print('❌ Llamada rechazada: $data');
      _isCalling = false;
      notifyListeners();
    });

    _chatService.onCallCancelled((data) {
      print('🚫 Llamada cancelada');
      _incomingCall = null;
      notifyListeners();
    });

    _chatService.onCallFailed((data) {
      print('⚠️ Llamada fallida: $data');
      _isCalling = false;
      notifyListeners();
    });
  }

  /// Cargar lista de conversaciones
  Future<void> loadConversations() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final response = await _apiService.get('/chat');
      final conversationsData = response['conversations'] as List;
      _conversations = conversationsData
          .map((c) => Conversation.fromJson(c as Map<String, dynamic>))
          .toList();

      print('✅ ${_conversations.length} conversaciones cargadas');
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      print('❌ Error al cargar conversaciones: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Cargar mensajes de una conversación
  Future<void> loadMessages(String conversationId) async {
    try {
      final response = await _apiService.get('/chat/$conversationId/messages');
      final messagesData = response['messages'] as List;
      _messagesByConversation[conversationId] = messagesData
          .map((m) => Message.fromJson(m as Map<String, dynamic>))
          .toList();

      // Unirse a la sala de WebSocket
      _chatService.joinConversation(conversationId);

      print('✅ ${_messagesByConversation[conversationId]!.length} mensajes cargados para $conversationId');
      notifyListeners();
    } catch (e) {
      print('❌ Error al cargar mensajes: $e');
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Enviar mensaje
  Future<void> sendMessage(String conversationId, String content) async {
    try {
      await _apiService.post('/chat/message', {
        'conversationId': conversationId,
        'content': content,
      });
      // El mensaje se agregará automáticamente vía WebSocket
      print('✅ Mensaje enviado');
    } catch (e) {
      print('❌ Error al enviar mensaje: $e');
      throw e;
    }
  }

  /// Agregar mensaje a la conversación local
  void _addMessageToConversation(Message message) {
    final conversationId = message.conversationId;
    if (!_messagesByConversation.containsKey(conversationId)) {
      _messagesByConversation[conversationId] = [];
    }
    _messagesByConversation[conversationId]!.add(message);
    notifyListeners();
  }

  /// Actualizar conversación en la lista
  void _updateConversation(Conversation updatedConvo) {
    final index = _conversations.indexWhere((c) => c.id == updatedConvo.id);
    if (index != -1) {
      _conversations[index] = updatedConvo;
      // Mover al inicio
      final conversation = _conversations.removeAt(index);
      _conversations.insert(0, conversation);
    } else {
      _conversations.insert(0, updatedConvo);
    }
    notifyListeners();
  }

  /// Verificar si un usuario está en línea
  bool isUserOnline(String userId) {
    return _onlineUsers.contains(userId);
  }

  /// Obtener mensajes de una conversación
  List<Message> getMessages(String conversationId) {
    return _messagesByConversation[conversationId] ?? [];
  }

  // ========== VIDEOLLAMADAS ==========

  /// Iniciar videollamada
  void startVideoCall(String targetUserId, String conversationId, String callerName) {
    _isCalling = true;
    _chatService.startVideoCall(
      targetUserId: targetUserId,
      conversationId: conversationId,
      callerName: callerName,
    );
    notifyListeners();
  }

  /// Aceptar videollamada
  void acceptVideoCall() {
    if (_incomingCall != null) {
      _chatService.acceptVideoCall(
        callerId: _incomingCall!['callerId'] as String,
        conversationId: _incomingCall!['conversationId'] as String,
      );
      _activeCallConversationId = _incomingCall!['conversationId'] as String;
      _incomingCall = null;
      notifyListeners();
    }
  }

  /// Rechazar videollamada
  void rejectVideoCall() {
    if (_incomingCall != null) {
      _chatService.rejectVideoCall(
        callerId: _incomingCall!['callerId'] as String,
      );
      _incomingCall = null;
      notifyListeners();
    }
  }

  /// Cancelar videollamada saliente
  void cancelVideoCall(String targetUserId) {
    _chatService.cancelVideoCall(targetUserId);
    _isCalling = false;
    notifyListeners();
  }

  /// Terminar llamada activa
  void endActiveCall() {
    _activeCallConversationId = null;
    _isCalling = false;
    notifyListeners();
  }

  /// Limpiar recursos
  @override
  void dispose() {
    _chatService.dispose();
    super.dispose();
  }
}
