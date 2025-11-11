import 'package:flutter/material.dart';

/// Pantalla de servicios (placeholder - implementar búsqueda y listado)
class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Servicios'),
      ),
      body: const Center(
        child: Text('Lista de servicios y búsqueda'),
      ),
    );
  }
}
