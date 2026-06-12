import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/agenda_data.dart';
import 'agenda_card.dart';

class AgendaSection extends StatelessWidget {
  final List<AgendaData> agenda;

  const AgendaSection({required this.agenda, super.key});

  /// Determines if the section should be rendered.
  static bool canRender(List<AgendaData> agenda) => agenda.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Agenda',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        ...agenda.map((a) => AgendaCard(agenda: a)).toList(),
      ],
    );
  }
}
