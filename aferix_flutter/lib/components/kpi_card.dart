import 'package:flutter/material.dart';
import '../domain/models/kpi_data.dart';
import '../design_system/tokens/shapes.dart';
import '../design_system/tokens/elevation.dart';
import '../design_system/tokens/spacing.dart';
import '../design_system/tokens/typography.dart';

/// Card widget that displays a KPI.
class KpiCard extends StatelessWidget {
  final KpiData data;
  const KpiCard({Key? key, required this.data}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.zero,
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: AferixShapes.m,
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
          Text(data.title, style: AferixTypography.caption),
          const SizedBox(height: AferixSpacing.xs),
          Text('${data.value} ${data.unit}', style: AferixTypography.h1),
        ],
      ),
    );
  }
}
