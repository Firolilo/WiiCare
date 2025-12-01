/// Constantes de la aplicación WiiCare
class AppConstants {
  // API Configuration
  // Para Android Emulator usar 10.0.2.2, para dispositivo físico usar IP de tu máquina
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://192.168.0.4:4000/api',
  );

  // Endpoints
  static const String authEndpoint = '/auth';
  static const String servicesEndpoint = '/services';
  static const String usersEndpoint = '/users';
  static const String chatsEndpoint = '/chats';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';

  // App Info
  static const String appName = 'WiiCare';
  static const String appVersion = '1.0.0';

  // UI Constants
  static const double defaultPadding = 16.0;
  static const double defaultRadius = 12.0;
}
