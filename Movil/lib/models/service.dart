import 'package:json_annotation/json_annotation.dart';

part 'service.g.dart';

/// Modelo de Servicio ofrecido por cuidadores
@JsonSerializable()
class Service {
  final String id;
  final String caregiver; // ID del cuidador o objeto completo
  final String title;
  final String description;
  final double rate;
  final List<String> tags;
  final String location;
  final String? availability;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Service({
    required this.id,
    required this.caregiver,
    required this.title,
    required this.description,
    required this.rate,
    this.tags = const [],
    this.location = '',
    this.availability,
    this.createdAt,
    this.updatedAt,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    // Manejar el caso donde caregiver es un objeto
    final caregiverData = json['caregiver'];
    final caregiverId = caregiverData is String 
        ? caregiverData 
        : caregiverData['_id'] ?? caregiverData['id'] ?? '';
    
    return Service(
      id: json['_id'] ?? json['id'] ?? '',
      caregiver: caregiverId,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      rate: (json['rate'] ?? 0).toDouble(),
      tags: List<String>.from(json['tags'] ?? []),
      location: json['location'] ?? '',
      availability: json['availability'],
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : null,
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() => _$ServiceToJson(this);
}
