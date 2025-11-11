import 'package:flutter/material.dart';
import 'video_call_screen.dart';

/// Pantalla de chat
class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  void _startVideoCall(BuildContext context, String userName, String userId) {
    // Generar un nombre de canal único basado en los IDs de usuario
    final channelName = 'wiicare_call_$userId';
    
    // TODO: En producción, obtener el token de Agora desde el backend
    const token = ''; // Dejar vacío para desarrollo sin autenticación
    
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => VideoCallScreen(
          channelName: channelName,
          token: token,
          userId: int.parse(userId.hashCode.toString().substring(0, 8)),
          userName: userName,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Lista de ejemplo de conversaciones
    final conversations = [
      {
        'id': '1',
        'name': 'María García',
        'lastMessage': 'Hola, ¿cuándo podemos empezar?',
        'time': '10:30',
        'unread': 2,
        'isOnline': true,
      },
      {
        'id': '2',
        'name': 'Juan Pérez',
        'lastMessage': 'Gracias por tu ayuda',
        'time': 'Ayer',
        'unread': 0,
        'isOnline': false,
      },
      {
        'id': '3',
        'name': 'Ana Rodríguez',
        'lastMessage': '¿Disponible mañana?',
        'time': '2 días',
        'unread': 1,
        'isOnline': true,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chats'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Implementar búsqueda de chats
            },
          ),
        ],
      ),
      body: conversations.isEmpty
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chat_bubble_outline, size: 80, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'No tienes conversaciones activas',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                ],
              ),
            )
          : ListView.builder(
              itemCount: conversations.length,
              itemBuilder: (context, index) {
                final chat = conversations[index];
                return ListTile(
                  key: Key('chat_item_${chat['id']}'),
                  leading: Stack(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.blue,
                        child: Text(
                          chat['name'].toString()[0].toUpperCase(),
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                      if (chat['isOnline'] == true)
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: Colors.green,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                          ),
                        ),
                    ],
                  ),
                  title: Text(
                    chat['name'].toString(),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    chat['lastMessage'].toString(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        chat['time'].toString(),
                        style: TextStyle(
                          fontSize: 12,
                          color: chat['unread'] != 0
                              ? Theme.of(context).primaryColor
                              : Colors.grey,
                        ),
                      ),
                      if (chat['unread'] != 0) ...[
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Theme.of(context).primaryColor,
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            chat['unread'].toString(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  onTap: () {
                    // TODO: Navegar a la pantalla de conversación individual
                    _showChatOptions(context, chat);
                  },
                );
              },
            ),
    );
  }

  void _showChatOptions(BuildContext context, Map<String, dynamic> chat) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.message),
              title: const Text('Ver conversación'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Navegar a la conversación
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Funcionalidad de chat en desarrollo'),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.videocam),
              title: const Text('Iniciar videollamada'),
              onTap: () {
                Navigator.pop(context);
                _startVideoCall(
                  context,
                  chat['name'].toString(),
                  chat['id'].toString(),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.phone),
              title: const Text('Llamada de voz'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implementar llamada de voz
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Funcionalidad de llamada de voz en desarrollo'),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

