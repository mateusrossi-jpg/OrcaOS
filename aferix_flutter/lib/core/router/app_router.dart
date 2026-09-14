import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/home/presentation/views/home_page.dart';
import '../../data/repositories/local_home_repository.dart';
import '../../domain/repositories/home_repository.dart';

/// Repositório da Home (preservado intacto) injetado via Riverpod/DI.
final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return LocalHomeRepository();
});

/// Router da aplicação (go_router).
///
/// Fase 0: rota única `/` → Home existente. Novas rotas/módulos entrarão
/// nas fases seguintes. `AferixApp` não é alterado sem necessidade.
final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) {
          return HomePage(repository: ref.read(homeRepositoryProvider));
        },
      ),
    ],
    errorBuilder: (context, state) {
      return Scaffold(
        body: Center(
          child: Text('Rota não encontrada: ${state.uri}'),
        ),
      );
    },
  );
});