import 'package:json_annotation/json_annotation.dart';

part 'message.g.dart';

/// Modelo de Mensaje dentro de conversaciones
@JsonSerializable()
class Message {
  final String id;
  final String conversation;
  final String sender;
  final String content;
  final DateTime? readAt;
  final DateTime createdAt;

  Message({
    required this.id,
    required this.conversation,
    required this.sender,
    required this.content,
    this.readAt,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
  Map<String, dynamic> toJson() => _$MessageToJson(this);
}
