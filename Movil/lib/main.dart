import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/service_provider.dart';
import 'screens/splash_screen.dart';
import 'widgets/incoming_call_overlay.dart';

void main() {
  runApp(const WiiCareApp());
}

class WiiCareApp extends StatelessWidget {
  const WiiCareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => ServiceProvider()),
      ],
      child: MaterialApp(
        title: 'WiiCare',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.blue,
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            filled: true,
          ),
          cardTheme: CardThemeData(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        builder: (context, child) {
          // Agregar overlay de llamadas entrantes global
          return Stack(
            children: [
              child ?? const SizedBox.shrink(),
              const IncomingCallOverlay(),
            ],
          );
        },
        home: const SplashScreen(),
      ),
    );
  }
}
