import 'api_service.dart';
import '../models/service.dart';

/// Servicio para gestionar operaciones de servicios (CRUD)
class ServiceApiService {
  final ApiService _apiService = ApiService();

  /// Listar todos los servicios (usuarios ven todos, caregivers ven solo los suyos)
  Future<List<Service>> listServices({
    String? query,
    String? tag,
    String? location,
    String? caregiverId,
  }) async {
    final params = <String, String>{};
    if (query != null) params['query'] = query;
    if (tag != null) params['tag'] = tag;
    if (location != null) params['location'] = location;
    if (caregiverId != null) params['caregiver'] = caregiverId;

    final response = await _apiService.get('/services', queryParams: params);
    final servicesData = response['services'] as List;
    return servicesData.map((s) => Service.fromJson(s as Map<String, dynamic>)).toList();
  }

  /// Obtener un servicio por ID
  Future<Service> getService(String id) async {
    final response = await _apiService.get('/services/$id');
    return Service.fromJson(response['service'] as Map<String, dynamic>);
  }

  /// Crear un nuevo servicio (solo caregivers)
  Future<Service> createService({
    required String title,
    required String description,
    required double rate,
    List<String> tags = const [],
    String location = '',
    String? availability,
  }) async {
    final response = await _apiService.post('/services', {
      'title': title,
      'description': description,
      'rate': rate,
      'tags': tags,
      'location': location,
      if (availability != null) 'availability': availability,
    });
    return Service.fromJson(response['service'] as Map<String, dynamic>);
  }

  /// Actualizar un servicio (solo caregivers propietarios)
  Future<Service> updateService(
    String id, {
    String? title,
    String? description,
    double? rate,
    List<String>? tags,
    String? location,
    String? availability,
  }) async {
    final body = <String, dynamic>{};
    if (title != null) body['title'] = title;
    if (description != null) body['description'] = description;
    if (rate != null) body['rate'] = rate;
    if (tags != null) body['tags'] = tags;
    if (location != null) body['location'] = location;
    if (availability != null) body['availability'] = availability;

    final response = await _apiService.put('/services/$id', body);
    return Service.fromJson(response['service'] as Map<String, dynamic>);
  }

  /// Eliminar un servicio (solo caregivers propietarios)
  Future<void> deleteService(String id) async {
    await _apiService.delete('/services/$id');
  }
}
