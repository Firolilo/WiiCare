import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

/// Pantalla de perfil del usuario
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;

    if (user == null) {
      return const Scaffold(
        body: Center(
          child: Text('No hay usuario autenticado'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar y nombre
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    child: Text(
                      user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                      style: const TextStyle(fontSize: 40, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user.name,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Chip(
                    label: Text(user.role == 'caregiver' ? 'Cuidador' : 'Usuario'),
                    backgroundColor: user.role == 'caregiver'
                        ? Colors.blue.shade100
                        : Colors.green.shade100,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Información del perfil
            _buildInfoCard(
              context,
              icon: Icons.email,
              title: 'Email',
              value: user.email,
            ),
            const SizedBox(height: 12),
            
            if (user.bio != null && user.bio!.isNotEmpty)
              _buildInfoCard(
                context,
                icon: Icons.info,
                title: 'Biografía',
                value: user.bio!,
              ),
            
            if (user.bio != null && user.bio!.isNotEmpty)
              const SizedBox(height: 12),
            
            if (user.location != null && user.location!.isNotEmpty)
              _buildInfoCard(
                context,
                icon: Icons.location_on,
                title: 'Ubicación',
                value: user.location!,
              ),
            
            if (user.location != null && user.location!.isNotEmpty)
              const SizedBox(height: 12),
            
            if (user.rating != null)
              _buildInfoCard(
                context,
                icon: Icons.star,
                title: 'Calificación',
                value: '${user.rating!.toStringAsFixed(1)} / 5.0',
              ),

            const SizedBox(height: 32),

            // Botón de editar perfil
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  // TODO: Navegar a pantalla de edición de perfil
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Funcionalidad de edición próximamente'),
                    ),
                  );
                },
                icon: const Icon(Icons.edit),
                label: const Text('Editar Perfil'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
        subtitle: Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
