import 'package:flutter/material.dart';

import '../design_system/tokens/typography.dart';

extension ThemeExtension on BuildContext {
  // Colors
  Color get primaryColor => Colors.transparent;
  Color get surfaceColor => Colors.transparent;

  // Typography
  TextStyle get titleMedium => AferixTypography.titleMedium;
}
