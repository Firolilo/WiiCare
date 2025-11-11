import 'package:flutter/material.dart';

/// Pantalla de chat (placeholder)
class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chats'),
      ),
      body: const Center(
        child: Text('Conversaciones activas'),
      ),
    );
  }
}
