import 'package:equatable/equatable.dart';

/// Data transfer object representing an agenda item displayed on the Home screen.
///
/// All fields are required and the class is immutable.
class AgendaData extends Equatable {
  final String id;
  final String title;
  final String description;
  final DateTime startTime;
  final DateTime endTime;

  const AgendaData({
    required this.id,
    required this.title,
    required this.description,
    required this.startTime,
    required this.endTime,
  });

  @override
  List<Object?> get props => [id, title, description, startTime, endTime];

  /// Creates a copy of this AgendaData with optional new values.
  AgendaData copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? startTime,
    DateTime? endTime,
  }) => AgendaData(
    id: id ?? this.id,
    title: title ?? this.title,
    description: description ?? this.description,
    startTime: startTime ?? this.startTime,
    endTime: endTime ?? this.endTime,
  );

  factory AgendaData.fromJson(Map<String, dynamic> json) => AgendaData(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        startTime: DateTime.parse(json['startTime'] as String),
        endTime: DateTime.parse(json['endTime'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'startTime': startTime.toIso8601String(),
        'endTime': endTime.toIso8601String(),
      };
}
