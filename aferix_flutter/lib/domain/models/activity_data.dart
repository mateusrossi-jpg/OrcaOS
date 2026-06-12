import 'package:equatable/equatable.dart';

/// Data transfer object representing an activity displayed on the Home screen.
/// All fields are required and the class is immutable.
class ActivityData extends Equatable {
  final String id;
  final String title;
  final String description;
  final DateTime timestamp;

  const ActivityData({
    required this.id,
    required this.title,
    required this.description,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [id, title, description, timestamp];



  /// Creates a copy of this ActivityData with optional new values.
  ActivityData copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? timestamp,
  }) => ActivityData(
    id: id ?? this.id,
    title: title ?? this.title,
    description: description ?? this.description,
    timestamp: timestamp ?? this.timestamp,
  );

  factory ActivityData.fromJson(Map<String, dynamic> json) => ActivityData(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        timestamp: DateTime.parse(json['timestamp'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'timestamp': timestamp.toIso8601String(),
      };
}
