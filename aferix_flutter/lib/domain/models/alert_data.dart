import 'package:equatable/equatable.dart';

/// Data transfer object representing an alert displayed on the Home screen.
/// All fields are required and the class is immutable.
class AlertData extends Equatable {
  final String id;
  final String title;
  final String description;
  final DateTime timestamp;
  final AlertSeverity severity;

  const AlertData({
    required this.id,
    required this.title,
    required this.description,
    required this.timestamp,
    required this.severity,
  });

  @override
  List<Object?> get props => [id, title, description, timestamp, severity];

  /// Creates a copy of this AlertData with optional new values.
  AlertData copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? timestamp,
    AlertSeverity? severity,
  }) =>
      AlertData(
        id: id ?? this.id,
        title: title ?? this.title,
        description: description ?? this.description,
        timestamp: timestamp ?? this.timestamp,
        severity: severity ?? this.severity,
      );

  factory AlertData.fromJson(Map<String, dynamic> json) => AlertData(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        timestamp: DateTime.parse(json['timestamp'] as String),
        severity: AlertSeverityExtension.fromString(json['severity'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'timestamp': timestamp.toIso8601String(),
        'severity': severity.name,
      };
}

/// Enum representing the severity level of an alert.
enum AlertSeverity { info, warning, error }

extension AlertSeverityExtension on AlertSeverity {
  static AlertSeverity fromString(String value) {
    switch (value) {
      case 'info':
        return AlertSeverity.info;
      case 'warning':
        return AlertSeverity.warning;
      case 'error':
        return AlertSeverity.error;
      default:
        return AlertSeverity.info;
    }
  }
}
