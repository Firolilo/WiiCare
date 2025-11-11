// Widget tests for WiiCare Mobile App
//
// Tests básicos para verificar que los widgets principales se renderizan correctamente

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:wiicare_movil/providers/auth_provider.dart';
import 'package:wiicare_movil/screens/login_screen.dart';

void main() {
  group('WiiCare App Tests', () {
    testWidgets('LoginScreen muestra campos de email y contraseña', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Verificar que existen los campos de login
      expect(find.byType(TextFormField), findsNWidgets(2)); // Email y Password
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Contraseña'), findsOneWidget);
      expect(find.text('Iniciar Sesión'), findsOneWidget);
    });

    testWidgets('LoginScreen muestra logo de WiiCare', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Verificar que aparece el logo y nombre
      expect(find.byIcon(Icons.favorite), findsOneWidget);
      expect(find.text('WiiCare'), findsOneWidget);
    });

    testWidgets('LoginScreen valida campos vacíos', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Intentar hacer login sin llenar campos
      await tester.tap(find.byKey(const Key('login_submit_button')));
      await tester.pump();

      // Verificar que aparecen mensajes de validación
      expect(find.text('Por favor ingresa tu email'), findsOneWidget);
      expect(find.text('Por favor ingresa tu contraseña'), findsOneWidget);
    });

    testWidgets('LoginScreen valida formato de email', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Ingresar email inválido
      await tester.enterText(
        find.byKey(const Key('login_email_field')),
        'email_invalido',
      );
      await tester.enterText(
        find.byKey(const Key('login_password_field')),
        'password123',
      );

      await tester.tap(find.byKey(const Key('login_submit_button')));
      await tester.pump();

      // Verificar mensaje de validación
      expect(find.text('Ingresa un email válido'), findsOneWidget);
    });

    testWidgets('LoginScreen muestra botón de registro', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Verificar que existe el botón para ir a registro
      expect(find.text('¿No tienes cuenta? Regístrate'), findsOneWidget);
    });

    testWidgets('LoginScreen permite ingresar texto en campos', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );

      // Ingresar texto en los campos
      await tester.enterText(
        find.byKey(const Key('login_email_field')),
        'test@example.com',
      );
      await tester.enterText(
        find.byKey(const Key('login_password_field')),
        'password123',
      );

      // Verificar que el texto se ingresó
      expect(find.text('test@example.com'), findsOneWidget);
      expect(find.text('password123'), findsOneWidget);
    });
  });
}
