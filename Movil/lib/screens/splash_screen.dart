import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';
import 'main_navigation.dart';

/// Pantalla de splash que decide si mostrar login o la app principal
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Ejecutar después de que el widget esté completamente construido
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkSession();
    });
  }

  Future<void> _checkSession() async {
    if (!mounted) return;
    
    // Para testing de Appium: agregar un delay pequeño y luego ir directo a login
    await Future.delayed(const Duration(seconds: 2));
    
    if (!mounted) return;

    try {
      final authProvider = context.read<AuthProvider>();
      final hasSession = await authProvider.loadSession().timeout(
        const Duration(seconds: 3),
        onTimeout: () => false, // Si tarda más de 3 segundos, asumir sin sesión
      );

      if (!mounted) return;

      // Navegar según el estado de sesión
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => hasSession ? const MainNavigation() : const LoginScreen(),
        ),
      );
    } catch (e) {
      // Si hay cualquier error, ir al login
      print('Error checking session: $e');
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.favorite,
              size: 80,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 24),
            Text(
              'WiiCare',
              style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
            ),
            const SizedBox(height: 16),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
