import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/alert_data.dart';

/// Widget that renders a single alert.
class AlertCard extends StatelessWidget {
  final AlertData alert;

  const AlertCard({required this.alert, super.key});

  @override
  Widget build(BuildContext context) {
    // Choose a color based on severity.
    Color severityColor;
    switch (alert.severity) {
      case AlertSeverity.info:
        severityColor = Colors.blue;
        break;
      case AlertSeverity.warning:
        severityColor = Colors.orange;
        break;
      case AlertSeverity.error:
        severityColor = Colors.red;
        break;
    }

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4.0),
      child: ListTile(
        leading: Icon(Icons.notification_important, color: severityColor),
        title: Text(alert.title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(alert.description),
        trailing: Text(
          // Format timestamp as HH:mm
          '${alert.timestamp.hour.toString().padLeft(2, '0')}:${alert.timestamp.minute.toString().padLeft(2, '0')}',
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
      ),
    );
  }
}
