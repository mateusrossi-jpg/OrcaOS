import 'package:flutter/material.dart';
import '../domain/models/activity_data.dart';

// // // import '../design_system/tokens/radius.dart'; // removed unused import // removed unused import // removed unused import
import '../design_system/tokens/insets.dart'; // duplicate removed
import '../design_system/tokens/elevation.dart';
import '../design_system/tokens/typography.dart'; // kept
import '../design_system/tokens/shapes.dart';
import '../design_system/tokens/spacing.dart';

/// Card widget that displays an activity.
class ActivityCard extends StatelessWidget {
  final ActivityData data;
  final VoidCallback onPressed;
  const ActivityCard({Key? key, required this.data, required this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: AferixInsets.m,
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: AferixShapes.s,
          boxShadow: [
            BoxShadow(
              color: Colors.transparent.withValues(alpha: 0.45),
              blurRadius: AferixElevation.dp2,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(data.title, style: AferixTypography.subtitle1),
            const SizedBox(height: AferixSpacing.xs),
            Text(data.description, style: AferixTypography.body1),
            const SizedBox(height: AferixSpacing.xs),
            Text('${data.timestamp.toLocal().toIso8601String()}', style: AferixTypography.caption),
          ],
        ),
      ),
    );
  }
}
