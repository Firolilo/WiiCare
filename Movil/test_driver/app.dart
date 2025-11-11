import 'package:flutter_driver/driver_extension.dart';
import 'package:wiicare_movil/main.dart' as app;

/// Aplicación instrumentada para Flutter Driver
/// Este archivo permite que Flutter Driver controle la app durante las pruebas
void main() {
  // Habilita la extensión de Flutter Driver
  enableFlutterDriverExtension();

  // Inicia la aplicación normalmente
  app.main();
}
