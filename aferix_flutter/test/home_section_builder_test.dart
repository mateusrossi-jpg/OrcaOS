import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/home_section_builder.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/alert_section.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/activity_section.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/agenda_section.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/kpi_section.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/quick_action_section.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/empty_home_section.dart';
import 'package:aferix_flutter/features/home/presentation/states/home_state.dart';

import 'package:aferix_flutter/test/fakes/fake_home_data_factory.dart';

void main() {
  group('HomeSectionBuilder', () {
    testWidgets('renders EmptyHomeSection when data is empty', (WidgetTester tester) async {
      final state = HomeState(status: HomeStatus.success, data: FakeHomeDataFactory.empty());
      await tester.pumpWidget(MaterialApp(home: HomeSectionBuilder(state: state)));
      expect(find.byType(EmptyHomeSection), findsOneWidget);
      expect(find.byType(AlertSection), findsNothing);
    });

    testWidgets('renders only AlertSection when only alerts are present', (WidgetTester tester) async {
      final state = HomeState(status: HomeStatus.success, data: FakeHomeDataFactory.alertsOnly());
      await tester.pumpWidget(MaterialApp(home: HomeSectionBuilder(state: state)));
      expect(find.byType(AlertSection), findsOneWidget);
      expect(find.byType(ActivitySection), findsNothing);
      expect(find.byType(KpiSection), findsNothing);
    });

    testWidgets('renders only KpiSection when only kpis are present', (WidgetTester tester) async {
      final state = HomeState(status: HomeStatus.success, data: FakeHomeDataFactory.kpisOnly());
      await tester.pumpWidget(MaterialApp(home: HomeSectionBuilder(state: state)));
      expect(find.byType(KpiSection), findsOneWidget);
      expect(find.byType(AlertSection), findsNothing);
    });

    testWidgets('renders all sections when data is complete', (WidgetTester tester) async {
      final state = HomeState(status: HomeStatus.success, data: FakeHomeDataFactory.complete());
      await tester.pumpWidget(MaterialApp(home: HomeSectionBuilder(state: state)));
      expect(find.byType(AlertSection), findsOneWidget);
      expect(find.byType(ActivitySection), findsOneWidget);
      expect(find.byType(AgendaSection), findsOneWidget);
      expect(find.byType(KpiSection), findsOneWidget);
      expect(find.byType(QuickActionSection), findsOneWidget);
    });
  });
}
