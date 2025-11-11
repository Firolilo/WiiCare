import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../utils/constants.dart';
import 'api_service.dart';

/// Servicio de autenticación (login, registro, logout)
class AuthService {
  final ApiService _api = ApiService();

  User? _currentUser;
  User? get currentUser => _currentUser;

  /// Registro de nuevo usuario
  Future<User> register({
    required String name,
    required String email,
    required String password,
    required String role, // 'caregiver' o 'user'
  }) async {
    final response = await _api.post(
      '${AppConstants.authEndpoint}/register',
      {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      },
    );

    // Guardar token
    final token = response['token'] as String?;
    if (token == null) {
      throw Exception('Token no recibido del servidor');
    }
    await _api.setToken(token);

    // Parsear y guardar usuario
    final userData = response['user'] as Map<String, dynamic>?;
    if (userData == null) {
      throw Exception('Datos de usuario no recibidos del servidor');
    }
    _currentUser = User.fromJson(userData);
    await _saveUser(_currentUser!);

    return _currentUser!;
  }

  /// Login de usuario existente
  Future<User> login({
    required String email,
    required String password,
  }) async {
    final response = await _api.post(
      '${AppConstants.authEndpoint}/login',
      {
        'email': email,
        'password': password,
      },
    );

    // Guardar token
    final token = response['token'] as String?;
    if (token == null) {
      throw Exception('Token no recibido del servidor');
    }
    await _api.setToken(token);

    // Parsear y guardar usuario
    final userData = response['user'] as Map<String, dynamic>?;
    if (userData == null) {
      throw Exception('Datos de usuario no recibidos del servidor');
    }
    _currentUser = User.fromJson(userData);
    await _saveUser(_currentUser!);

    return _currentUser!;
  }

  /// Obtener perfil actual (con token)
  Future<User> getMe() async {
    final response = await _api.get('${AppConstants.authEndpoint}/me');
    final userData = response['user'] as Map<String, dynamic>?;
    if (userData == null) {
      throw Exception('Datos de usuario no recibidos del servidor');
    }
    _currentUser = User.fromJson(userData);
    await _saveUser(_currentUser!);
    return _currentUser!;
  }

  /// Logout
  Future<void> logout() async {
    await _api.clearToken();
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.userKey);
  }

  /// Cargar sesión guardada
  Future<bool> loadSession() async {
    await _api.loadToken();
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(AppConstants.userKey);

    if (userJson != null) {
      try {
        final userData = jsonDecode(userJson) as Map<String, dynamic>;
        _currentUser = User.fromJson(userData);
        // Verificar que el token sea válido
        await getMe();
        return true;
      } catch (e) {
        // Token inválido o expirado
        await logout();
        return false;
      }
    }
    return false;
  }

  /// Guardar usuario en storage
  Future<void> _saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
  }

  /// Check si hay sesión activa
  bool get isLoggedIn => _currentUser != null;
}
