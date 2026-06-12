import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/agenda_data.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/agenda_card.dart';

void main() {
  testWidgets('AgendaCard renders title, description, and formatted time range', (WidgetTester tester) async {
    final agenda = AgendaData(
      id: 'ag1',
      title: 'Sprint Planning',
      description: 'Discuss sprint goals.',
      startTime: DateTime.utc(2026, 6, 11, 9, 5),
      endTime: DateTime.utc(2026, 6, 11, 10, 0),
    );
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: AgendaCard(agenda: agenda))));

    expect(find.text('Sprint Planning'), findsOneWidget);
    expect(find.text('Discuss sprint goals.'), findsOneWidget);
    expect(find.text('09:05 - 10:00'), findsOneWidget);
    expect(find.byType(Card), findsOneWidget);
  });
}
