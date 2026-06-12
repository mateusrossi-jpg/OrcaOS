import 'package:equatable/equatable.dart';

class QuickActionData extends Equatable {
  final String label;
  final int iconCodePoint;
  final String? fontFamily;


  @override
  List<Object?> get props => [label, iconCodePoint, fontFamily];

  const QuickActionData({
    required this.label,
    required this.iconCodePoint,
    this.fontFamily,
  });



  /// Creates a [QuickActionData] instance from a JSON map.
  factory QuickActionData.fromJson(Map<String, dynamic> json) => QuickActionData(
        label: json['label'] as String,
        iconCodePoint: json['icon'] as int,
        fontFamily: json['fontFamily'] as String?,
      );

  /// Converts this [QuickActionData] to a JSON map.
  Map<String, dynamic> toJson() => {
        'label': label,
        'icon': iconCodePoint,
        if (fontFamily != null) 'fontFamily': fontFamily,
      };

  /// Creates a copy of this QuickActionData with optional new values.
  QuickActionData copyWith({
    String? label,
    int? iconCodePoint,
    String? fontFamily,
  }) => QuickActionData(
    label: label ?? this.label,
    iconCodePoint: iconCodePoint ?? this.iconCodePoint,
    fontFamily: fontFamily ?? this.fontFamily,
  );
}
