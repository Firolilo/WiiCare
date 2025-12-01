import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

/// Modelo de Usuario (caregiver o user)
@JsonSerializable()
class User {
  @JsonKey(name: '_id')
  final String id;
  
  final String name;
  final String email;
  final String role; // 'caregiver' o 'user'
  final String? bio;
  final String? location;
  final String? phone;
  final double? rating;
  final int? reviewsCount;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.bio,
    this.location,
    this.phone,
    this.rating,
    this.reviewsCount,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  bool get isCaregiver => role == 'caregiver';
  
  /// Obtener iniciales para avatar
  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, 1).toUpperCase();
  }
}
