import 'package:flutter/material.dart';

/// Widget displayed when there are no recent activities.
/// Pure UI component, no business logic.
class EmptyActivitySection extends StatelessWidget {
  const EmptyActivitySection({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'Nenhuma atividade recente',
        style: TextStyle(fontSize: 16),
      ),
    );
  }
}
