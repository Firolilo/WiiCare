import 'package:flutter/material.dart';
import '../models/service.dart';
import '../services/service_api_service.dart';

/// Provider para gestionar el estado de servicios
class ServiceProvider with ChangeNotifier {
  final ServiceApiService _serviceApiService = ServiceApiService();

  List<Service> _services = [];
  List<Service> _myServices = []; // Servicios del caregiver actual
  bool _isLoading = false;
  String? _error;

  List<Service> get services => _services;
  List<Service> get myServices => _myServices;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Cargar todos los servicios (para usuarios)
  Future<void> loadAllServices({
    String? query,
    String? tag,
    String? location,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _services = await _serviceApiService.listServices(
        query: query,
        tag: tag,
        location: location,
      );

      print('✅ ${_services.length} servicios cargados');
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      print('❌ Error al cargar servicios: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Cargar servicios del caregiver actual (para caregivers)
  Future<void> loadMyServices(String caregiverId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _myServices = await _serviceApiService.listServices(
        caregiverId: caregiverId,
      );

      print('✅ ${_myServices.length} servicios propios cargados');
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      print('❌ Error al cargar mis servicios: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Crear un nuevo servicio
  Future<Service?> createService({
    required String title,
    required String description,
    required double rate,
    List<String> tags = const [],
    String location = '',
    String? availability,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final service = await _serviceApiService.createService(
        title: title,
        description: description,
        rate: rate,
        tags: tags,
        location: location,
        availability: availability,
      );

      _myServices.insert(0, service);
      print('✅ Servicio creado: ${service.title}');
      
      _isLoading = false;
      notifyListeners();
      return service;
    } catch (e) {
      print('❌ Error al crear servicio: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  /// Actualizar un servicio existente
  Future<Service?> updateService(
    String id, {
    String? title,
    String? description,
    double? rate,
    List<String>? tags,
    String? location,
    String? availability,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final service = await _serviceApiService.updateService(
        id,
        title: title,
        description: description,
        rate: rate,
        tags: tags,
        location: location,
        availability: availability,
      );

      // Actualizar en la lista local
      final index = _myServices.indexWhere((s) => s.id == id);
      if (index != -1) {
        _myServices[index] = service;
      }

      print('✅ Servicio actualizado: ${service.title}');
      _isLoading = false;
      notifyListeners();
      return service;
    } catch (e) {
      print('❌ Error al actualizar servicio: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  /// Eliminar un servicio
  Future<bool> deleteService(String id) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _serviceApiService.deleteService(id);

      _myServices.removeWhere((s) => s.id == id);
      print('✅ Servicio eliminado');
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      print('❌ Error al eliminar servicio: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Limpiar error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
