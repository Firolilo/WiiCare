import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

/// Modelo de Usuario (caregiver o user)
@JsonSerializable()
class User {
  final String id;
  final String name;
  final String email;
  final String role; // 'caregiver' o 'user'
  final String? bio;
  final String? location;
  final double? rating;
  final int? reviewsCount;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.bio,
    this.location,
    this.rating,
    this.reviewsCount,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  bool get isCaregiver => role == 'caregiver';
}
