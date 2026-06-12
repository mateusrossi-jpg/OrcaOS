import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/quick_action_data.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/quick_action_section.dart';

void main() {
  testWidgets('QuickActionSection renders text with correct count', (WidgetTester tester) async {
    final list = [
      const QuickActionData(label: 'Action 1', iconCodePoint: 0xe000),
      const QuickActionData(label: 'Action 2', iconCodePoint: 0xe001),
    ];
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: QuickActionSection(quickActions: list))));

    expect(find.byType(Card), findsOneWidget);
    expect(find.text('Quick Action Section (2)'), findsOneWidget);
  });

  testWidgets('QuickActionSection renders zero actions text when empty', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: QuickActionSection(quickActions: []))));
    expect(find.text('Quick Action Section (0)'), findsOneWidget);
  });
}
