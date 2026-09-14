import 'package:aferix_flutter/core/database/database_manager.dart';
import 'package:aferix_flutter/features/app/providers/app_providers.dart';
import 'package:aferix_flutter/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'helpers/fake_connectivity_monitor.dart';

void main() {
  Future<ProviderScope> buildApp(WidgetTester tester) async {
    final manager = DatabaseManager();
    final db = await manager.openInMemory();
    addTearDown(manager.close);

    final monitor = FakeConnectivityMonitor();
    addTearDown(monitor.dispose);

    return ProviderScope(
      overrides: [
        aferixDatabaseProvider.overrideWith((ref) async => db),
        connectivityMonitorProvider.overrideWithValue(monitor),
      ],
      child: const AferixApp(),
    );
  }

  testWidgets('AferixApp inicia o router na Home', (tester) async {
    final scope = await buildApp(tester);
    await tester.pumpWidget(scope);
    await tester.pumpAndSettle();

    expect(find.text('Home'), findsOneWidget);
  });

  testWidgets('rota desconhecida cai no errorBuilder', (tester) async {
    final scope = await buildApp(tester);
    await tester.pumpWidget(scope);
    await tester.pumpAndSettle();

    GoRouter.of(tester.element(find.byType(Scaffold).first)).go('/nao-existe');
    await tester.pumpAndSettle();

    expect(find.textContaining('Rota não encontrada'), findsOneWidget);
  });
}