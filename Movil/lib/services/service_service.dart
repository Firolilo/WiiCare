import '../models/service.dart';
import '../utils/constants.dart';
import 'api_service.dart';

/// Servicio para gestión de servicios de cuidado
class ServiceService {
  final ApiService _api = ApiService();

  /// Listar servicios con filtros opcionales
  Future<List<Service>> getServices({
    String? query,
    String? tag,
    String? location,
  }) async {
    final params = <String>[];
    if (query != null && query.isNotEmpty) params.add('query=$query');
    if (tag != null && tag.isNotEmpty) params.add('tag=$tag');
    if (location != null && location.isNotEmpty) params.add('location=$location');

    final queryString = params.isNotEmpty ? '?${params.join('&')}' : '';
    final response = await _api.get('${AppConstants.servicesEndpoint}$queryString');

    final servicesData = response['services'] as List;
    return servicesData.map((json) => Service.fromJson(json as Map<String, dynamic>)).toList();
  }

  /// Obtener detalle de un servicio
  Future<Service> getService(String id) async {
    final response = await _api.get('${AppConstants.servicesEndpoint}/$id');
    return Service.fromJson(response['service'] as Map<String, dynamic>);
  }

  /// Crear nuevo servicio (solo cuidadores)
  Future<Service> createService({
    required String title,
    required String description,
    required double rate,
    List<String>? tags,
    String? location,
    String? availability,
  }) async {
    final response = await _api.post(
      AppConstants.servicesEndpoint,
      {
        'title': title,
        'description': description,
        'rate': rate,
        'tags': tags ?? [],
        'location': location ?? '',
        'availability': availability,
      },
    );
    return Service.fromJson(response['service'] as Map<String, dynamic>);
  }

  /// Actualizar servicio
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

    final response = await _api.put('${AppConstants.servicesEndpoint}/$id', body);
    return Service.fromJson(response['service'] as Map<String, dynamic>);
  }

  /// Eliminar servicio
  Future<void> deleteService(String id) async {
    await _api.delete('${AppConstants.servicesEndpoint}/$id');
  }
}
