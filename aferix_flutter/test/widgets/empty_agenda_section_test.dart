import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/empty_agenda_section.dart';

void main() {
  testWidgets('EmptyAgendaSection renders correct text and center alignment', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: EmptyAgendaSection()));
    
    expect(find.byType(EmptyAgendaSection), findsOneWidget);
    expect(find.byType(Center), findsOneWidget);
    expect(find.text('No agenda events'), findsOneWidget);
    
    final textWidget = tester.widget<Text>(find.text('No agenda events'));
    expect(textWidget.style?.fontSize, 16);
  });
}
