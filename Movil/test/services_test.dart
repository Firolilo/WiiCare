// Widget tests for WiiCare Mobile App - Services Flow
//
// Tests para verificar la funcionalidad de servicios

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:wiicare_movil/providers/auth_provider.dart';
import 'package:wiicare_movil/providers/service_provider.dart';
import 'package:wiicare_movil/screens/browse_services_screen.dart';
import 'package:wiicare_movil/screens/service_form_screen.dart';

void main() {
  group('Services Screen Tests', () {
    testWidgets('BrowseServicesScreen se renderiza correctamente', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
            ChangeNotifierProvider(create: (_) => ServiceProvider()),
          ],
          child: const MaterialApp(
            home: BrowseServicesScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verificar que la pantalla se renderiza
      expect(find.byType(Scaffold), findsOneWidget);
    });

    testWidgets('BrowseServicesScreen muestra AppBar', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
            ChangeNotifierProvider(create: (_) => ServiceProvider()),
          ],
          child: const MaterialApp(
            home: BrowseServicesScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verificar que existe el AppBar
      expect(find.byType(AppBar), findsOneWidget);
    });
  });

  group('Service Form Tests', () {
    testWidgets('ServiceFormScreen se renderiza', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
            ChangeNotifierProvider(create: (_) => ServiceProvider()),
          ],
          child: const MaterialApp(
            home: ServiceFormScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verificar que existe el formulario
      expect(find.byType(Scaffold), findsOneWidget);
    });

    testWidgets('ServiceFormScreen contiene formulario', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
            ChangeNotifierProvider(create: (_) => ServiceProvider()),
          ],
          child: const MaterialApp(
            home: ServiceFormScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verificar que existen campos de texto (formulario)
      expect(find.byType(TextFormField), findsWidgets);
    });
  });
}
