import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/alert_data.dart';
import 'alert_card.dart';

class AlertSection extends StatelessWidget {
  final List<AlertData> alerts;

  const AlertSection({required this.alerts, super.key});

  // Retain canRender for external usage; consider true when list non-empty.
  static bool canRender(List<AlertData> alerts) => alerts.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    // Always render the section, showing count even if zero.
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Alert Section (${alerts.length})',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        if (alerts.isNotEmpty) ...alerts.map((a) => AlertCard(alert: a)).toList(),
      ],
    );
  }
}
