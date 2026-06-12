import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/alert_section.dart';
import 'package:aferix_flutter/domain/models/alert_data.dart';

void main() {
  testWidgets('AlertSection canRender false for empty list', (WidgetTester tester) async {
    // No direct canRender method, but we test that widget renders empty state
    final emptyAlerts = <AlertData>[];
    await tester.pumpWidget(MaterialApp(home: AlertSection(alerts: emptyAlerts)));
    // Should still render a Card with count 0
    expect(find.text('Alert Section (0)'), findsOneWidget);
  });

  testWidgets('AlertSection renders one alert', (WidgetTester tester) async {
    final alerts = [
      AlertData(
        id: 'a1',
        title: 'Title',
        description: 'Desc',
        timestamp: DateTime.utc(2022, 1, 1),
        severity: AlertSeverity.info,
      ),
    ];
    await tester.pumpWidget(MaterialApp(home: AlertSection(alerts: alerts)));
    expect(find.text('Alert Section (1)'), findsOneWidget);
  });

  testWidgets('AlertSection renders multiple alerts', (WidgetTester tester) async {
    final alerts = List.generate(3, (i) => AlertData(
      id: 'a$i',
      title: 'Title $i',
      description: 'Desc $i',
      timestamp: DateTime.utc(2022, 1, i + 1),
      severity: AlertSeverity.info,
    ));
    await tester.pumpWidget(MaterialApp(home: AlertSection(alerts: alerts)));
    expect(find.text('Alert Section (3)'), findsOneWidget);
  });
}
