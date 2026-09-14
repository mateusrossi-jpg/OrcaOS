import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'features/app/providers/app_providers.dart';
import 'core/router/app_router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: AferixApp()));
}

class AferixApp extends ConsumerWidget {
  const AferixApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Observa o provider de triggers para manter o sync vivo em toda a
    // vida do app (lifecycle + conectividade + timers).
    ref.watch(syncTriggersProvider);
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Aferix Flutter',
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.indigo,
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}