import 'package:json_annotation/json_annotation.dart';
import 'user.dart';

part 'conversation.g.dart';

/// Convertir participants de objetos User a lista de IDs
List<String> _participantsFromJson(dynamic json) {
  if (json is List) {
    return json.map((p) {
      if (p is String) return p;
      if (p is Map && p.containsKey('_id')) return p['_id'].toString();
      return p.toString();
    }).toList();
  }
  return [];
}

/// Modelo de Conversación entre usuarios
@JsonSerializable(explicitToJson: true)
class Conversation {
  @JsonKey(name: '_id')
  final String id;
  
  @JsonKey(fromJson: _participantsFromJson)
  final List<String> participants;
  final User? otherParticipant; // Usuario con quien se está conversando
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final int unreadCount;
  final DateTime? createdAt;

  Conversation({
    required this.id,
    required this.participants,
    this.otherParticipant,
    this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
    this.createdAt,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) =>
      _$ConversationFromJson(json);
  Map<String, dynamic> toJson() => _$ConversationToJson(this);
}
