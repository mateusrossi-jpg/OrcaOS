// Test for ActivitySection widget
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/activity_section.dart';
import 'package:aferix_flutter/domain/models/activity_data.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/activity_card.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/empty_activity_section.dart';

void main() {
  testWidgets('ActivitySection renders EmptyActivitySection when list is empty', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: ActivitySection(activities: [])));
    expect(find.byType(EmptyActivitySection), findsOneWidget);
    expect(find.byType(ActivityCard), findsNothing);
  });

  testWidgets('ActivitySection renders one ActivityCard for single item', (WidgetTester tester) async {
    final activity = ActivityData(id: '1', title: 'Title', description: 'Desc', timestamp: DateTime.utc(2022, 1, 1, 10, 30));
    await tester.pumpWidget(MaterialApp(home: ActivitySection(activities: [activity])));
    expect(find.byType(ActivityCard), findsOneWidget);
    expect(find.text('Title'), findsOneWidget);
  });

  testWidgets('ActivitySection renders multiple ActivityCards', (WidgetTester tester) async {
    final activities = [
      ActivityData(id: '1', title: 'One', description: 'Desc1', timestamp: DateTime.utc(2022, 1, 1, 9, 0)),
      ActivityData(id: '2', title: 'Two', description: 'Desc2', timestamp: DateTime.utc(2022, 1, 1, 10, 0)),
    ];
    await tester.pumpWidget(MaterialApp(home: ActivitySection(activities: activities)));
    expect(find.byType(ActivityCard), findsNWidgets(2));
    expect(find.text('One'), findsOneWidget);
    expect(find.text('Two'), findsOneWidget);
  });
}
