import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'browse_services_screen.dart';
import 'my_services_screen.dart';

/// Pantalla de servicios que muestra contenido diferente según el rol del usuario
class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final isCaregiver = authProvider.currentUser?.role == 'caregiver';

    // Si es caregiver, mostrar sus servicios; si es usuario, mostrar todos los servicios
    return isCaregiver 
        ? const MyServicesScreen() 
        : const BrowseServicesScreen();
  }
}
