import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/activity_data.dart';
import 'activity_card.dart';
import 'empty_activity_section.dart';

class ActivitySection extends StatelessWidget {
  final List<ActivityData> activities;

  const ActivitySection({required this.activities, super.key});

  /// Determines if the section should be rendered.
  static bool canRender(List<ActivityData> activities) => activities.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    if (activities.isEmpty) {
      return const EmptyActivitySection();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Atividades',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        ...activities.map((a) => ActivityCard(activity: a)).toList(),
      ],
    );
  }
}
