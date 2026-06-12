import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/quick_action_data.dart';

class QuickActionSection extends StatelessWidget {
  final List<QuickActionData> quickActions;

  const QuickActionSection({required this.quickActions, super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Text('Quick Action Section (${quickActions.length})'),
      ),
    );
  }
}
