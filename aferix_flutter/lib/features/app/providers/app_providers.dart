import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/database/aferix_database.dart';
import '../../../core/database/database_manager.dart';
import '../../../core/database/daos/outbox_dao.dart';
import '../../../core/database/daos/sync_cursor_dao.dart';
import '../../../core/network/connectivity_monitor.dart';
import '../../../core/network/connectivity_service.dart';
import '../../../core/network/supabase_config.dart';
import '../../../core/sync/sync_engine.dart';
import '../../../core/sync/sync_triggers.dart';
import '../../../data/datasources/sync_local_datasource.dart';
import '../../../data/datasources/sync_remote_datasource.dart';
import '../../../data/repositories/sync_repository_impl.dart';
import '../../../domain/repositories/sync_repository.dart';
import '../../../core/models/sync/sync_result.dart';

import 'session_provider.dart';

/// Composição root de DI (Riverpod como container — sem get_it).

final supabaseConfigProvider = Provider<SupabaseConfig>((ref) {
  return SupabaseConfig.fromEnv();
});

final supabaseClientProvider = Provider<SupabaseClient?>((ref) {
  final config = ref.watch(supabaseConfigProvider);
  if (!config.isConfigured) return null;
  try {
    return Supabase.instance.client;
  } catch (_) {
    return null;
  }
});

final databaseManagerProvider = Provider<DatabaseManager>((ref) {
  final manager = DatabaseManager();
  ref.onDispose(manager.close);
  return manager;
});

/// Banco aberto para a sessão atual. Trocar de tenant recalcula este
/// provider e todos os derivados (RC2).
final aferixDatabaseProvider = FutureProvider<AferixDatabase>((ref) async {
  final session = ref.watch(sessionProvider);
  final manager = ref.watch(databaseManagerProvider);
  if (session.isGuest) {
    return manager.openForSession(companyId: '', userId: '', guest: true);
  }
  return manager.openForSession(
    companyId: session.companyId,
    userId: session.userId,
  );
});

final outboxDaoProvider = FutureProvider<OutboxDao>((ref) async {
  final db = await ref.watch(aferixDatabaseProvider.future);
  return OutboxDao(db);
});

final syncCursorDaoProvider = FutureProvider<SyncCursorDao>((ref) async {
  final db = await ref.watch(aferixDatabaseProvider.future);
  return SyncCursorDao(db);
});

final syncLocalDataSourceProvider =
    FutureProvider<SyncLocalDataSource>((ref) async {
  return DriftSyncLocalDataSource(
    outboxDao: await ref.watch(outboxDaoProvider.future),
    cursorDao: await ref.watch(syncCursorDaoProvider.future),
  );
});

final syncRemoteDataSourceProvider = Provider<SyncRemoteDataSource>((ref) {
  final config = ref.watch(supabaseConfigProvider);
  return SupabaseSyncRemoteDataSource(
    isConfigured: config.isConfigured,
    client: ref.watch(supabaseClientProvider),
  );
});

final connectivityMonitorProvider =
    Provider<ConnectivityMonitor>((ref) => ConnectivityPlusMonitor());

final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  final service = ConnectivityService(ref.watch(connectivityMonitorProvider));
  ref.onDispose(service.dispose);
  return service;
});

/// Motor de sync materializado para o tenant da sessão.
final syncEngineProvider = FutureProvider<SyncEngine>((ref) async {
  final session = ref.watch(sessionProvider);
  return SyncEngine(
    local: await ref.watch(syncLocalDataSourceProvider.future),
    remote: ref.watch(syncRemoteDataSourceProvider),
    tenantId: session.companyId,
    userId: session.userId,
  );
});

final syncRepositoryProvider = FutureProvider<SyncRepository>((ref) async {
  final local = await ref.watch(syncLocalDataSourceProvider.future);
  final engine = await ref.watch(syncEngineProvider.future);
  final session = ref.watch(sessionProvider);
  return SyncRepositoryImpl(
    local: local,
    engine: engine,
    tenantId: () => session.companyId,
    userId: () => session.userId,
  );
});

/// Inicia os gatilhos globais de sync (lifecycle + conectividade + timers).
/// Manter este provider observado mantém o sync vivo durante o app.
final syncTriggersProvider = FutureProvider<SyncTriggers>((ref) async {
  final engine = await ref.watch(syncEngineProvider.future);
  final triggers = SyncTriggers(
    engine: engine,
    connectivity: ref.watch(connectivityServiceProvider),
    onError: (_) {},
  );
  await triggers.start();
  ref.onDispose(triggers.dispose);
  return triggers;
});

/// Executa um ciclo completo de sync com o repositório da sessão atual.
Future<SyncResult> runSync(Ref ref) async {
  final repo = await ref.read(syncRepositoryProvider.future);
  return repo.triggerSync();
}