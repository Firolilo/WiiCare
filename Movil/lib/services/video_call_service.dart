import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:permission_handler/permission_handler.dart';

/// Servicio para gestión de videollamadas con Agora
class VideoCallService {
  static const String appId = String.fromEnvironment(
    'AGORA_APP_ID',
    defaultValue: 'YOUR_AGORA_APP_ID', // Reemplazar con tu App ID de Agora
  );

  RtcEngine? _engine;
  RtcEngine? get engine => _engine;

  bool _isMuted = false;
  bool _isCameraOff = false;

  bool get isMuted => _isMuted;
  bool get isCameraOff => _isCameraOff;

  /// Inicializar el motor de Agora
  Future<void> initialize() async {
    // Solicitar permisos
    await _requestPermissions();

    // Crear instancia del motor
    _engine = createAgoraRtcEngine();
    await _engine!.initialize(RtcEngineContext(
      appId: appId,
      channelProfile: ChannelProfileType.channelProfileCommunication,
    ));

    // Configurar eventos
    _engine!.registerEventHandler(RtcEngineEventHandler(
      onJoinChannelSuccess: (RtcConnection connection, int elapsed) {
        print('📞 Unido al canal: ${connection.channelId}');
      },
      onUserJoined: (RtcConnection connection, int remoteUid, int elapsed) {
        print('👤 Usuario remoto unido: $remoteUid');
      },
      onUserOffline: (RtcConnection connection, int remoteUid,
          UserOfflineReasonType reason) {
        print('👋 Usuario remoto salió: $remoteUid');
      },
      onError: (ErrorCodeType err, String msg) {
        print('❌ Error: $msg');
      },
    ));

    // Habilitar video
    await _engine!.enableVideo();
    await _engine!.startPreview();
  }

  /// Solicitar permisos de cámara y micrófono
  Future<void> _requestPermissions() async {
    await [Permission.camera, Permission.microphone].request();
  }

  /// Unirse a un canal de videollamada
  Future<void> joinChannel({
    required String channelName,
    required String token,
    required int uid,
  }) async {
    if (_engine == null) {
      throw Exception('Engine no inicializado. Llama a initialize() primero.');
    }

    await _engine!.joinChannel(
      token: token,
      channelId: channelName,
      uid: uid,
      options: const ChannelMediaOptions(
        channelProfile: ChannelProfileType.channelProfileCommunication,
        clientRoleType: ClientRoleType.clientRoleBroadcaster,
      ),
    );
  }

  /// Salir del canal
  Future<void> leaveChannel() async {
    await _engine?.leaveChannel();
  }

  /// Alternar mute del micrófono
  Future<void> toggleMute() async {
    _isMuted = !_isMuted;
    await _engine?.muteLocalAudioStream(_isMuted);
  }

  /// Alternar cámara (on/off)
  Future<void> toggleCamera() async {
    _isCameraOff = !_isCameraOff;
    await _engine?.muteLocalVideoStream(_isCameraOff);
  }

  /// Cambiar entre cámara frontal y trasera
  Future<void> switchCamera() async {
    await _engine?.switchCamera();
  }

  /// Limpiar recursos
  Future<void> dispose() async {
    await _engine?.leaveChannel();
    await _engine?.release();
    _engine = null;
  }
}
