import 'package:equatable/equatable.dart';

class KpiData extends Equatable {
  final String title;
  final String value;
  final String unit;

  const KpiData({required this.title, required this.value, required this.unit});

  /// Creates a [KpiData] instance from a JSON map.
  @override
  List<Object?> get props => [title, value, unit];

  /// Creates a copy of this KpiData with optional new values.
  KpiData copyWith({
    String? title,
    String? value,
    String? unit,
  }) => KpiData(
    title: title ?? this.title,
    value: value ?? this.value,
    unit: unit ?? this.unit,
  );
  factory KpiData.fromJson(Map<String, dynamic> json) => KpiData(
        title: json['title'] as String,
        value: json['value'] as String,
        unit: json['unit'] as String,
      );

  /// Converts this [KpiData] to a JSON map.
  Map<String, dynamic> toJson() => {
        'title': title,
        'value': value,
        'unit': unit,
      };
}

