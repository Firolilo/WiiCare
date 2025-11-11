import 'package:flutter/material.dart';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import '../services/video_call_service.dart';

/// Pantalla de videollamada con Agora
class VideoCallScreen extends StatefulWidget {
  final String channelName;
  final String token;
  final int userId;
  final String userName;

  const VideoCallScreen({
    super.key,
    required this.channelName,
    required this.token,
    required this.userId,
    required this.userName,
  });

  @override
  State<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends State<VideoCallScreen> {
  final VideoCallService _videoService = VideoCallService();
  bool _isInitialized = false;
  int? _remoteUid;
  bool _isMuted = false;
  bool _isCameraOff = false;

  @override
  void initState() {
    super.initState();
    _initializeCall();
  }

  Future<void> _initializeCall() async {
    try {
      await _videoService.initialize();
      await _videoService.joinChannel(
        channelName: widget.channelName,
        token: widget.token,
        uid: widget.userId,
      );

      // Escuchar eventos de usuarios
      _videoService.engine?.registerEventHandler(RtcEngineEventHandler(
        onUserJoined: (RtcConnection connection, int remoteUid, int elapsed) {
          setState(() {
            _remoteUid = remoteUid;
          });
        },
        onUserOffline: (RtcConnection connection, int remoteUid,
            UserOfflineReasonType reason) {
          setState(() {
            _remoteUid = null;
          });
        },
      ));

      setState(() {
        _isInitialized = true;
      });
    } catch (e) {
      print('Error al inicializar videollamada: $e');
      _showErrorDialog('Error al iniciar la videollamada');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleMute() async {
    await _videoService.toggleMute();
    setState(() {
      _isMuted = _videoService.isMuted;
    });
  }

  Future<void> _toggleCamera() async {
    await _videoService.toggleCamera();
    setState(() {
      _isCameraOff = _videoService.isCameraOff;
    });
  }

  Future<void> _switchCamera() async {
    await _videoService.switchCamera();
  }

  Future<void> _endCall() async {
    await _videoService.leaveChannel();
    if (mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  void dispose() {
    _videoService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Video remoto (pantalla completa)
          if (_remoteUid != null)
            AgoraVideoView(
              controller: VideoViewController.remote(
                rtcEngine: _videoService.engine!,
                canvas: VideoCanvas(uid: _remoteUid),
                connection: RtcConnection(channelId: widget.channelName),
              ),
            )
          else
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: Colors.white),
                  const SizedBox(height: 16),
                  Text(
                    'Esperando a ${widget.userName}...',
                    style: const TextStyle(color: Colors.white, fontSize: 18),
                  ),
                ],
              ),
            ),

          // Video local (esquina superior derecha)
          Positioned(
            top: 50,
            right: 16,
            child: Container(
              width: 120,
              height: 160,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white, width: 2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: _isInitialized
                    ? AgoraVideoView(
                        controller: VideoViewController(
                          rtcEngine: _videoService.engine!,
                          canvas: const VideoCanvas(uid: 0),
                        ),
                      )
                    : Container(color: Colors.grey[900]),
              ),
            ),
          ),

          // Información de la llamada
          Positioned(
            top: 60,
            left: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.5),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  const Icon(Icons.videocam, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    widget.userName,
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ],
              ),
            ),
          ),

          // Controles de la llamada
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                // Mute/Unmute
                _ControlButton(
                  icon: _isMuted ? Icons.mic_off : Icons.mic,
                  label: _isMuted ? 'Activar' : 'Silenciar',
                  backgroundColor:
                      _isMuted ? Colors.red : Colors.white.withOpacity(0.3),
                  onPressed: _toggleMute,
                ),

                // Cambiar cámara
                _ControlButton(
                  icon: Icons.flip_camera_ios,
                  label: 'Cambiar',
                  backgroundColor: Colors.white.withOpacity(0.3),
                  onPressed: _switchCamera,
                ),

                // Apagar/Encender cámara
                _ControlButton(
                  icon: _isCameraOff ? Icons.videocam_off : Icons.videocam,
                  label: _isCameraOff ? 'Encender' : 'Apagar',
                  backgroundColor: _isCameraOff
                      ? Colors.red
                      : Colors.white.withOpacity(0.3),
                  onPressed: _toggleCamera,
                ),

                // Terminar llamada
                _ControlButton(
                  icon: Icons.call_end,
                  label: 'Terminar',
                  backgroundColor: Colors.red,
                  onPressed: _endCall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ControlButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color backgroundColor;
  final VoidCallback onPressed;

  const _ControlButton({
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: backgroundColor,
            shape: BoxShape.circle,
          ),
          child: IconButton(
            icon: Icon(icon, color: Colors.white, size: 28),
            onPressed: onPressed,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(color: Colors.white, fontSize: 12),
        ),
      ],
    );
  }
}
