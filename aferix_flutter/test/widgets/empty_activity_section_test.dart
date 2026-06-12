import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/empty_activity_section.dart';

void main() {
  testWidgets('EmptyActivitySection renders correct text and center alignment', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: EmptyActivitySection()));
    
    expect(find.byType(EmptyActivitySection), findsOneWidget);
    expect(find.byType(Center), findsOneWidget);
    expect(find.text('Nenhuma atividade recente'), findsOneWidget);
    
    // Check style details if any
    final textWidget = tester.widget<Text>(find.text('Nenhuma atividade recente'));
    expect(textWidget.style?.fontSize, 16);
  });
}
