import 'package:flutter/material.dart';
import '../domain/models/quick_action_data.dart';

import '../design_system/tokens/spacing.dart';
import '../design_system/tokens/radius.dart';
import '../design_system/tokens/elevation.dart';
import '../design_system/tokens/typography.dart';

/// Button widget representing a quick action.
class QuickActionButton extends StatelessWidget {
  final QuickActionData data;
  const QuickActionButton({Key? key, required this.data}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.transparent,
        padding: const EdgeInsets.symmetric(
          horizontal: AferixSpacing.m,
          vertical: AferixSpacing.s,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AferixRadius.s),
        ),
        elevation: AferixElevation.dp1,
        textStyle: AferixTypography.button,
      ),
      onPressed: () {},
      child: Text(data.label),
    );
  }
}
