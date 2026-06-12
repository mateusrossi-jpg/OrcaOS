import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/empty_home_section.dart';

void main() {
  testWidgets('EmptyHomeSection renders correct text and center alignment', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: EmptyHomeSection()));
    
    expect(find.byType(EmptyHomeSection), findsOneWidget);
    expect(find.byType(Center), findsOneWidget);
    expect(find.text('No data available'), findsOneWidget);
    
    final textWidget = tester.widget<Text>(find.text('No data available'));
    expect(textWidget.style?.fontSize, 18);
  });
}
