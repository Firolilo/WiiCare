import 'package:flutter/material.dart';
import 'package:jitsi_meet_flutter_sdk/jitsi_meet_flutter_sdk.dart';

/// Pantalla de videollamada con Jitsi Meet
class VideoCallScreen extends StatefulWidget {
  final String conversationId;
  final String userName;
  final String otherUserName;

  const VideoCallScreen({
    super.key,
    required this.conversationId,
    required this.userName,
    required this.otherUserName,
  });

  @override
  State<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends State<VideoCallScreen> {
  final _jitsiMeet = JitsiMeet();
  bool _isJoining = true;

  @override
  void initState() {
    super.initState();
    _joinCall();
  }

  Future<void> _joinCall() async {
    try {
      // Generar nombre de sala único basado en conversationId
      final roomName = 'wiicare-${widget.conversationId}';
      
      // Configurar opciones de Jitsi
      var options = JitsiMeetConferenceOptions(
        serverURL: "https://meet.jit.si",
        room: roomName,
        configOverrides: {
          "startWithAudioMuted": false,
          "startWithVideoMuted": false,
          "subject": "WiiCare - Videollamada",
        },
        featureFlags: {
          "unsaferoomwarning.enabled": false,
          "prejoinpage.enabled": false, // Saltar pantalla de prejoin
          "chat.enabled": true,
          "meeting-name.enabled": true,
          "recording.enabled": false,
        },
        userInfo: JitsiMeetUserInfo(
          displayName: widget.userName,
          email: "",
        ),
      );

      // Registrar listeners de eventos
      var listener = JitsiMeetEventListener(
        conferenceJoined: (url) {
          print("✅ Usuario unido a la conferencia");
          setState(() {
            _isJoining = false;
          });
        },
        conferenceTerminated: (url, error) {
          print("📞 Conferencia terminada");
          if (mounted) {
            Navigator.of(context).pop();
          }
        },
        conferenceWillJoin: (url) {
          print("📞 Uniéndose a la conferencia...");
        },
        participantJoined: (email, name, role, participantId) {
          print("🟢 Participante unido: $name");
        },
        participantLeft: (participantId) {
          print("🔴 Participante salió");
        },
        audioMutedChanged: (muted) {
          print("🎤 Audio ${muted ? 'silenciado' : 'activado'}");
        },
        videoMutedChanged: (muted) {
          print("📹 Video ${muted ? 'desactivado' : 'activado'}");
        },
        endpointTextMessageReceived: (senderId, message) {
          print("💬 Mensaje recibido: $message");
        },
        screenShareToggled: (participantId, sharing) {
          print("🖥️ Compartir pantalla: $sharing");
        },
        readyToClose: () {
          print("👋 Listo para cerrar");
          if (mounted) {
            Navigator.of(context).pop();
          }
        },
      );

      await _jitsiMeet.join(options, listener);
    } catch (e) {
      print('❌ Error al unirse a la videollamada: $e');
      if (mounted) {
        _showErrorDialog('Error al iniciar la videollamada: $e');
      }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: _isJoining
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: Colors.white),
                  const SizedBox(height: 24),
                  Text(
                    'Conectando con ${widget.otherUserName}...',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Por favor, espera un momento',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            )
          : Container(), // Jitsi maneja su propia UI
    );
  }

  @override
  void dispose() {
    _jitsiMeet.hangUp();
    super.dispose();
  }
}