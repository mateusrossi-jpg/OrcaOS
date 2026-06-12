import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/alert_data.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/alert_card.dart';

void main() {
  testWidgets('AlertCard renders info alert with blue icon and formatted time', (WidgetTester tester) async {
    final alert = AlertData(
      id: 'a1',
      title: 'Info Alert',
      description: 'This is an info alert.',
      timestamp: DateTime.utc(2026, 6, 11, 8, 5),
      severity: AlertSeverity.info,
    );
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: AlertCard(alert: alert))));

    expect(find.text('Info Alert'), findsOneWidget);
    expect(find.text('This is an info alert.'), findsOneWidget);
    expect(find.text('08:05'), findsOneWidget);

    final icon = tester.widget<Icon>(find.byIcon(Icons.notification_important));
    expect(icon.color, Colors.blue);
  });

  testWidgets('AlertCard renders warning alert with orange icon', (WidgetTester tester) async {
    final alert = AlertData(
      id: 'a2',
      title: 'Warning Alert',
      description: 'This is a warning alert.',
      timestamp: DateTime.utc(2026, 6, 11, 14, 30),
      severity: AlertSeverity.warning,
    );
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: AlertCard(alert: alert))));

    expect(find.text('Warning Alert'), findsOneWidget);
    expect(find.text('14:30'), findsOneWidget);

    final icon = tester.widget<Icon>(find.byIcon(Icons.notification_important));
    expect(icon.color, Colors.orange);
  });

  testWidgets('AlertCard renders error alert with red icon', (WidgetTester tester) async {
    final alert = AlertData(
      id: 'a3',
      title: 'Error Alert',
      description: 'This is an error alert.',
      timestamp: DateTime.utc(2026, 6, 11, 0, 0),
      severity: AlertSeverity.error,
    );
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: AlertCard(alert: alert))));

    expect(find.text('Error Alert'), findsOneWidget);
    expect(find.text('00:00'), findsOneWidget);

    final icon = tester.widget<Icon>(find.byIcon(Icons.notification_important));
    expect(icon.color, Colors.red);
  });
}
