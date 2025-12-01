import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

/// Servicio base para comunicación con la API
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final http.Client _client = http.Client();
  String? _token;

  /// Configurar token JWT
  Future<void> setToken(String? token) async {
    _token = token;
    if (token != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, token);
    }
  }

  /// Cargar token guardado
  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(AppConstants.tokenKey);
  }

  /// Limpiar token (logout)
  Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
  }

  /// Headers comunes con autenticación
  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (_token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  /// GET request
  Future<Map<String, dynamic>> get(
    String endpoint, {
    Map<String, String>? queryParams,
  }) async {
    var uri = Uri.parse('${AppConstants.apiBaseUrl}$endpoint');
    
    // Agregar query parameters si existen
    if (queryParams != null && queryParams.isNotEmpty) {
      uri = uri.replace(queryParameters: queryParams);
    }
    
    final response = await _client.get(uri, headers: _headers);
    return _handleResponse(response);
  }

  /// POST request
  Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final url = Uri.parse('${AppConstants.apiBaseUrl}$endpoint');
    print('🌐 POST $url');
    print('📤 Body: ${jsonEncode(body)}');
    
    final response = await _client.post(
      url,
      headers: _headers,
      body: jsonEncode(body),
    );
    
    print('📥 Status: ${response.statusCode}');
    print('📥 Response: ${response.body}');
    
    return _handleResponse(response);
  }

  /// PUT request
  Future<Map<String, dynamic>> put(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final url = Uri.parse('${AppConstants.apiBaseUrl}$endpoint');
    final response = await _client.put(
      url,
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  /// DELETE request
  Future<Map<String, dynamic>> delete(String endpoint) async {
    final url = Uri.parse('${AppConstants.apiBaseUrl}$endpoint');
    final response = await _client.delete(url, headers: _headers);
    return _handleResponse(response);
  }

  /// Manejo centralizado de respuestas
  Map<String, dynamic> _handleResponse(http.Response response) {
    // Intentar decodificar el JSON
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (e) {
      throw ApiException(
        message: 'Respuesta inválida del servidor: ${response.body}',
        statusCode: response.statusCode,
      );
    }

    // Verificar que sea un Map
    if (body is! Map<String, dynamic>) {
      throw ApiException(
        message: 'Formato de respuesta inesperado del servidor',
        statusCode: response.statusCode,
      );
    }
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      throw ApiException(
        message: body['message'] as String? ?? 'Error desconocido',
        statusCode: response.statusCode,
      );
    }
  }
}

/// Excepción personalizada para errores de API
class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => 'ApiException: $message (código: $statusCode)';
}
