import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/agenda_data.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/agenda_section.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/agenda_card.dart';

void main() {
  testWidgets('AgendaSection canRender returns correct values', (WidgetTester tester) async {
    final emptyList = <AgendaData>[];
    final nonEmptyList = [
      AgendaData(
        id: 'ag1',
        title: 'Meeting',
        description: 'Sync',
        startTime: DateTime.utc(2026, 6, 11, 9, 0),
        endTime: DateTime.utc(2026, 6, 11, 10, 0),
      ),
    ];
    
    expect(AgendaSection.canRender(emptyList), isFalse);
    expect(AgendaSection.canRender(nonEmptyList), isTrue);
  });

  testWidgets('AgendaSection renders title and cards', (WidgetTester tester) async {
    final list = [
      AgendaData(
        id: 'ag1',
        title: 'Meeting 1',
        description: 'Sync 1',
        startTime: DateTime.utc(2026, 6, 11, 9, 0),
        endTime: DateTime.utc(2026, 6, 11, 10, 0),
      ),
      AgendaData(
        id: 'ag2',
        title: 'Meeting 2',
        description: 'Sync 2',
        startTime: DateTime.utc(2026, 6, 11, 11, 0),
        endTime: DateTime.utc(2026, 6, 11, 12, 0),
      ),
    ];

    await tester.pumpWidget(MaterialApp(home: Scaffold(body: AgendaSection(agenda: list))));

    expect(find.text('Agenda'), findsOneWidget);
    expect(find.byType(AgendaCard), findsNWidgets(2));
    expect(find.text('Meeting 1'), findsOneWidget);
    expect(find.text('Meeting 2'), findsOneWidget);
  });
}
