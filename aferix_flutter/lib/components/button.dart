import 'package:flutter/material.dart';
// import '../design_system/tokens/spacing.dart'; // unused
// import '../design_system/tokens/radius.dart'; // unused

import '../design_system/tokens/typography.dart';
import '../design_system/tokens/shadows.dart';
import '../design_system/tokens/insets.dart';
import '../design_system/tokens/shapes.dart';

/// Reusable button component without any logic.
class AferixButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed; // Caller provides meaningful callback.

  const AferixButton({Key? key, required this.label, required this.onPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: AferixInsets.m,
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: AferixShapes.m,
          boxShadow: [AferixShadows.low],
        ),
        child: Text(label, style: AferixTypography.button),
      ),
    );
  }
}
