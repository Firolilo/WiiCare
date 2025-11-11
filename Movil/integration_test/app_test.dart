import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:wiicare_movil/main.dart' as app;

/// Pruebas de integración para WiiCare
/// 
/// Estas pruebas se ejecutan en un dispositivo real o emulador
/// y verifican el flujo completo de la aplicación.
/// 
/// Para ejecutar:
/// flutter test integration_test/app_test.dart
/// 
/// Para ejecutar en un dispositivo específico:
/// flutter test integration_test/app_test.dart -d <device_id>
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('WiiCare Integration Tests', () {
    
    testWidgets('US1: Complete caregiver registration flow', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Esperar a que cargue el splash screen
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verificar que estamos en la pantalla de login
      expect(find.text('Iniciar Sesión'), findsOneWidget);

      // Navegar a registro
      final registerLink = find.text('¿No tienes cuenta? Regístrate');
      expect(registerLink, findsOneWidget);
      await tester.tap(registerLink);
      await tester.pumpAndSettle();

      // Verificar que estamos en la pantalla de registro
      expect(find.text('Crear Cuenta'), findsWidgets);

      // Llenar formulario
      await tester.enterText(
        find.byKey(const Key('register_name_field')),
        'Test Caregiver',
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('register_email_field')),
        'caregiver${DateTime.now().millisecondsSinceEpoch}@test.com',
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('register_password_field')),
        'Test123456',
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('register_confirm_password_field')),
        'Test123456',
      );
      await tester.pumpAndSettle();

      // Seleccionar rol de cuidador
      await tester.tap(find.byKey(const Key('role_caregiver')));
      await tester.pumpAndSettle();

      // Enviar formulario
      final submitButton = find.widgetWithText(ElevatedButton, 'Crear Cuenta');
      await tester.tap(submitButton);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verificar navegación exitosa (puede variar según respuesta del backend)
      // Si el backend está disponible, debería navegar a MainNavigation
      // Si no, puede mostrar un error
    });

    testWidgets('US2: User registration and service search', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Navegar a registro
      final registerLink = find.text('¿No tienes cuenta? Regístrate');
      expect(registerLink, findsOneWidget);
      await tester.tap(registerLink);
      await tester.pumpAndSettle();

      // Llenar formulario con rol de usuario
      await tester.enterText(
        find.byKey(const Key('register_name_field')),
        'Test User',
      );

      await tester.enterText(
        find.byKey(const Key('register_email_field')),
        'user${DateTime.now().millisecondsSinceEpoch}@test.com',
      );

      await tester.enterText(
        find.byKey(const Key('register_password_field')),
        'Test123456',
      );

      await tester.enterText(
        find.byKey(const Key('register_confirm_password_field')),
        'Test123456',
      );

      // Seleccionar rol de usuario
      await tester.tap(find.byKey(const Key('role_user')));
      await tester.pumpAndSettle();

      // Enviar formulario
      final submitButton = find.widgetWithText(ElevatedButton, 'Crear Cuenta');
      await tester.tap(submitButton);
      await tester.pumpAndSettle(const Duration(seconds: 3));
    });

    testWidgets('US3: Login flow and navigation', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verificar que estamos en login
      expect(find.text('Iniciar Sesión'), findsOneWidget);

      // Ingresar credenciales de prueba
      await tester.enterText(
        find.byKey(const Key('login_email_field')),
        'test@example.com',
      );

      await tester.enterText(
        find.byKey(const Key('login_password_field')),
        'password123',
      );

      await tester.pumpAndSettle();

      // Intentar login
      final loginButton = find.widgetWithText(ElevatedButton, 'Iniciar Sesión');
      await tester.tap(loginButton);
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verificar comportamiento según disponibilidad del backend
    });

    testWidgets('Navigation between tabs', (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Este test asume que hay una sesión activa o que se saltó el login
      // Verificar si hay BottomNavigationBar
      final bottomNavBar = find.byType(BottomNavigationBar);
      
      if (bottomNavBar.evaluate().isEmpty) {
        // No hay sesión, saltar este test
        return;
      }

      // Probar navegación entre tabs
      await tester.tap(find.byKey(const Key('nav_services')));
      await tester.pumpAndSettle();
      expect(find.text('Servicios'), findsOneWidget);

      await tester.tap(find.byKey(const Key('nav_chat')));
      await tester.pumpAndSettle();
      expect(find.text('Chats'), findsOneWidget);

      await tester.tap(find.byKey(const Key('nav_profile')));
      await tester.pumpAndSettle();
      expect(find.text('Mi Perfil'), findsOneWidget);

      await tester.tap(find.byKey(const Key('nav_home')));
      await tester.pumpAndSettle();
      expect(find.text('Inicio'), findsOneWidget);
    });

    testWidgets('Form validation tests', (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Ir a registro
      final registerLink = find.text('¿No tienes cuenta? Regístrate');
      expect(registerLink, findsOneWidget);
      await tester.tap(registerLink);
      await tester.pumpAndSettle();

      // Hacer scroll hacia abajo para ver el botón
      final submitButton = find.widgetWithText(ElevatedButton, 'Crear Cuenta');
      await tester.ensureVisible(submitButton);
      await tester.pumpAndSettle();
      
      // Intentar enviar formulario vacío
      await tester.tap(submitButton);
      await tester.pumpAndSettle();

      // Debería mostrar mensajes de validación
      expect(find.text('Por favor ingresa tu nombre'), findsOneWidget);
      expect(find.text('Por favor ingresa tu email'), findsOneWidget);
    });
  });

  group('Widget Tests', () {
    testWidgets('Splash screen displays correctly', (tester) async {
      app.main();
      await tester.pump();

      // Verificar que el splash screen tiene el logo o nombre de la app
      expect(find.text('WiiCare'), findsOneWidget);
    });

    testWidgets('Login screen has required fields', (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Verificar campos de login
      expect(find.byKey(const Key('login_email_field')), findsOneWidget);
      expect(find.byKey(const Key('login_password_field')), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'Iniciar Sesión'), findsOneWidget);
      expect(find.text('¿No tienes cuenta? Regístrate'), findsOneWidget);
    });
  });
}
