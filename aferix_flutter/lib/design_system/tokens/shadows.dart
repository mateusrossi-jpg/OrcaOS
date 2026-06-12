import 'package:flutter/material.dart';

import 'package:aferix_flutter/design_system/tokens/elevation.dart';


/// Centralised shadow definitions used throughout the app.
class AferixShadows {
  static const BoxShadow low = BoxShadow(
    color: Colors.transparent,
    blurRadius: AferixElevation.dp2,
    offset: Offset(0, 2),
  );

  static const BoxShadow medium = BoxShadow(
    color: Colors.transparent,
    blurRadius: AferixElevation.dp4,
    offset: Offset(0, 4),
  );

  static const BoxShadow high = BoxShadow(
    color: Colors.transparent,
    blurRadius: AferixElevation.dp8,
    offset: const Offset(0, 8),
  );
}
