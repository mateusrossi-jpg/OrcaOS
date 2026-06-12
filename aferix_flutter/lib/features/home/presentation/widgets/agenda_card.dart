import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/agenda_data.dart';

/// Card widget displaying an agenda item.
class AgendaCard extends StatelessWidget {
  final AgendaData agenda;

  const AgendaCard({required this.agenda, super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              agenda.title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 4),
            Text(
              agenda.description,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text(
              '${agenda.startTime.hour.toString().padLeft(2, '0')}:${agenda.startTime.minute.toString().padLeft(2, '0')} - ${agenda.endTime.hour.toString().padLeft(2, '0')}:${agenda.endTime.minute.toString().padLeft(2, '0')}',
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
