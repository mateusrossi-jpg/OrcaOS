import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/kpi_data.dart';

/// Reusable KPI card displaying title, value and unit.
class KpiCard extends StatelessWidget {
  final KpiData kpi;

  const KpiCard({required this.kpi, super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(4.0),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 8.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              kpi.title,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              '${kpi.value}${kpi.unit}',
              style: const TextStyle(fontSize: 20, color: Colors.blueAccent),
            ),
          ],
        ),
      ),
    );
  }
}
