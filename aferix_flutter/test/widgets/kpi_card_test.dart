import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/kpi_data.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/kpi_card.dart';

void main() {
  testWidgets('KpiCard renders title, value and unit correctly', (WidgetTester tester) async {
    final kpi = const KpiData(
      title: 'Conversion Rate',
      value: '2.5',
      unit: '%',
    );
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: KpiCard(kpi: kpi))));

    expect(find.text('Conversion Rate'), findsOneWidget);
    expect(find.text('2.5%'), findsOneWidget);
    expect(find.byType(Card), findsOneWidget);
  });
}
