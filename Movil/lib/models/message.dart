import 'package:json_annotation/json_annotation.dart';
import 'user.dart';

part 'message.g.dart';

/// Modelo de Mensaje dentro de conversaciones
@JsonSerializable(explicitToJson: true)
class Message {
  @JsonKey(name: '_id')
  final String id;
  
  @JsonKey(name: 'conversation')
  final String conversationId;
  final User sender;
  final String content;
  final DateTime? readAt;
  final DateTime createdAt;

  Message({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.content,
    this.readAt,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
  Map<String, dynamic> toJson() => _$MessageToJson(this);
  
  /// Verificar si el mensaje fue leído
  bool get isRead => readAt != null;
}
