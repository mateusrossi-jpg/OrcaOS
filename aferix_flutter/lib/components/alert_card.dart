import 'package:flutter/material.dart';
import '../domain/models/alert_data.dart';

import '../design_system/tokens/spacing.dart';
import '../design_system/tokens/radius.dart';
import '../design_system/tokens/elevation.dart';
import '../design_system/tokens/typography.dart';

/// Card widget that displays an alert.
class AlertCard extends StatelessWidget {
  final AlertData data;
  const AlertCard({Key? key, required this.data}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.zero,
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(AferixRadius.s),
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
    );
  }
}
