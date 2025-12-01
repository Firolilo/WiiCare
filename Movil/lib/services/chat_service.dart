import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../utils/constants.dart';

/// Servicio para gestionar la comunicación en tiempo real con Socket.IO
class ChatService {
  static final ChatService _instance = ChatService._internal();
  factory ChatService() => _instance;
  ChatService._internal();

  IO.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;
  IO.Socket? get socket => _socket;

  /// Conectar al servidor de WebSocket con autenticación JWT
  Future<void> connect(String token) async {
    if (_isConnected) {
      print('⚠️ Ya estás conectado al servidor de chat');
      return;
    }

    // Obtener la URL base del WebSocket desde la URL de la API
    final socketUrl = AppConstants.apiBaseUrl.replaceAll('/api', '');

    print('🔌 Conectando a WebSocket: $socketUrl');

    _socket = IO.io(
      socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!.onConnect((_) {
      print('✅ Conectado al servidor de chat');
      _isConnected = true;
    });

    _socket!.onDisconnect((_) {
      print('❌ Desconectado del servidor de chat');
      _isConnected = false;
    });

    _socket!.onConnectError((data) {
      print('❌ Error de conexión: $data');
      _isConnected = false;
    });

    _socket!.onError((data) {
      print('❌ Error: $data');
    });

    _socket!.connect();
  }

  /// Desconectar del servidor
  void disconnect() {
    if (_socket != null) {
      print('🔌 Desconectando del servidor de chat');
      _socket!.disconnect();
      _socket = null;
      _isConnected = false;
    }
  }

  // ========== EVENTOS DE CONVERSACIÓN ==========

  /// Unirse a una conversación
  void joinConversation(String conversationId) {
    if (_socket != null) {
      print('📥 Uniéndose a conversación: $conversationId');
      _socket!.emit('join-conversation', conversationId);
    }
  }

  /// Salir de una conversación
  void leaveConversation(String conversationId) {
    if (_socket != null) {
      print('📤 Saliendo de conversación: $conversationId');
      _socket!.emit('leave-conversation', conversationId);
    }
  }

  /// Listener para nuevos mensajes
  void onNewMessage(Function(dynamic) callback) {
    _socket?.on('new-message', callback);
  }

  /// Listener para actualizaciones de conversación
  void onConversationUpdate(Function(dynamic) callback) {
    _socket?.on('conversation-updated', callback);
  }

  /// Remover listener de nuevos mensajes
  void offNewMessage() {
    _socket?.off('new-message');
  }

  /// Remover listener de actualizaciones de conversación
  void offConversationUpdate() {
    _socket?.off('conversation-updated');
  }

  // ========== EVENTOS DE PRESENCIA ==========

  /// Listener para lista de usuarios en línea
  void onOnlineUsersList(Function(dynamic) callback) {
    _socket?.on('online-users-list', callback);
  }

  /// Listener para usuario que se conecta
  void onUserOnline(Function(dynamic) callback) {
    _socket?.on('user-online', callback);
  }

  /// Listener para usuario que se desconecta
  void onUserOffline(Function(dynamic) callback) {
    _socket?.on('user-offline', callback);
  }

  /// Remover listeners de presencia
  void offPresenceListeners() {
    _socket?.off('online-users-list');
    _socket?.off('user-online');
    _socket?.off('user-offline');
  }

  // ========== EVENTOS DE VIDEOLLAMADAS ==========

  /// Iniciar videollamada
  void startVideoCall({
    required String targetUserId,
    required String conversationId,
    required String callerName,
  }) {
    if (_socket != null) {
      print('📞 Iniciando videollamada a: $targetUserId');
      _socket!.emit('start-video-call', {
        'targetUserId': targetUserId,
        'conversationId': conversationId,
        'callerName': callerName,
      });
    }
  }

  /// Aceptar videollamada
  void acceptVideoCall({
    required String callerId,
    required String conversationId,
  }) {
    if (_socket != null) {
      print('✅ Aceptando videollamada de: $callerId');
      _socket!.emit('accept-video-call', {
        'callerId': callerId,
        'conversationId': conversationId,
      });
    }
  }

  /// Rechazar videollamada
  void rejectVideoCall({
    required String callerId,
    String reason = 'Usuario ocupado',
  }) {
    if (_socket != null) {
      print('❌ Rechazando videollamada de: $callerId');
      _socket!.emit('reject-video-call', {
        'callerId': callerId,
        'reason': reason,
      });
    }
  }

  /// Cancelar videollamada
  void cancelVideoCall(String targetUserId) {
    if (_socket != null) {
      print('🚫 Cancelando videollamada a: $targetUserId');
      _socket!.emit('cancel-video-call', {
        'targetUserId': targetUserId,
      });
    }
  }

  /// Listeners para eventos de videollamada
  void onIncomingVideoCall(Function(dynamic) callback) {
    _socket?.on('incoming-video-call', callback);
  }

  void onCallAccepted(Function(dynamic) callback) {
    _socket?.on('call-accepted', callback);
  }

  void onCallRejected(Function(dynamic) callback) {
    _socket?.on('call-rejected', callback);
  }

  void onCallCancelled(Function(dynamic) callback) {
    _socket?.on('call-cancelled', callback);
  }

  void onCallFailed(Function(dynamic) callback) {
    _socket?.on('call-failed', callback);
  }

  /// Remover listeners de videollamada
  void offVideoCallListeners() {
    _socket?.off('incoming-video-call');
    _socket?.off('call-accepted');
    _socket?.off('call-rejected');
    _socket?.off('call-cancelled');
    _socket?.off('call-failed');
  }

  /// Limpiar todos los listeners (sin desconectar)
  void clearAllListeners() {
    offNewMessage();
    offConversationUpdate();
    offPresenceListeners();
    offVideoCallListeners();
  }

  /// Limpiar todos los listeners
  void dispose() {
    clearAllListeners();
    disconnect();
  }
}
