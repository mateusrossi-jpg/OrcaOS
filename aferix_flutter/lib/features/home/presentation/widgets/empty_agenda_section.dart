import 'package:flutter/material.dart';

/// Widget displayed when there are no agenda items.
class EmptyAgendaSection extends StatelessWidget {
  const EmptyAgendaSection({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('No agenda events', style: TextStyle(fontSize: 16)),
    );
  }
}
