import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/models/kpi_data.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/kpi_section.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/kpi_card.dart';

void main() {
  testWidgets('KpiSection canRender returns correct values', (WidgetTester tester) async {
    final emptyList = <KpiData>[];
    final nonEmptyList = [const KpiData(title: 'T', value: 'V', unit: 'U')];
    
    expect(KpiSection.canRender(emptyList), isFalse);
    expect(KpiSection.canRender(nonEmptyList), isTrue);
  });

  testWidgets('KpiSection renders title and KpiCards inside Wrap', (WidgetTester tester) async {
    final list = [
      const KpiData(title: 'KPI 1', value: '10', unit: 'x'),
      const KpiData(title: 'KPI 2', value: '20', unit: 'y'),
    ];

    await tester.pumpWidget(MaterialApp(home: Scaffold(body: KpiSection(kpis: list))));

    expect(find.text('KPIs'), findsOneWidget);
    expect(find.byType(Wrap), findsOneWidget);
    expect(find.byType(KpiCard), findsNWidgets(2));
    expect(find.text('10x'), findsOneWidget);
    expect(find.text('20y'), findsOneWidget);
  });
}
