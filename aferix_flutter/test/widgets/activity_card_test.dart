import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/activity_card.dart';
import 'package:aferix_flutter/domain/models/activity_data.dart';

void main() {
  testWidgets('ActivityCard renders all fields correctly', (WidgetTester tester) async {
    final activity = ActivityData(
      id: 'act1',
      title: 'Sample Title',
      description: 'Sample Description',
      timestamp: DateTime.utc(2022, 5, 10, 9, 7),
    );
    await tester.pumpWidget(MaterialApp(home: ActivityCard(activity: activity)));
    expect(find.text('Sample Title'), findsOneWidget);
    expect(find.text('Sample Description'), findsOneWidget);
    expect(find.text('09:07'), findsOneWidget);
  });

  testWidgets('ActivityCard layout contains Card and Padding', (WidgetTester tester) async {
    final activity = ActivityData(
      id: 'act2',
      title: 'Another',
      description: 'Desc',
      timestamp: DateTime.utc(2022, 5, 10, 15, 30),
    );
    await tester.pumpWidget(MaterialApp(home: ActivityCard(activity: activity)));
    expect(find.byType(Card), findsOneWidget);
    expect(find.byType(Padding), findsWidgets);
  });
}
