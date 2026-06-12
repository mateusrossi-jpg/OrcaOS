import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/kpi_data.dart';
import 'kpi_card.dart';

class KpiSection extends StatelessWidget {
  final List<KpiData> kpis;

  const KpiSection({required this.kpis, super.key});

  /// Determines if the section should be rendered.
  static bool canRender(List<KpiData> kpis) => kpis.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'KPIs',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: kpis.map((k) => KpiCard(kpi: k)).toList(),
        ),
      ],
    );
  }
}
