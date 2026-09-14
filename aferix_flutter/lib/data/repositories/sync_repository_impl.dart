import '../../core/models/sync/sync_enums.dart';
import '../../core/models/sync/sync_result.dart';
import '../../core/sync/sync_engine.dart';
import '../../domain/repositories/sync_repository.dart';

import '../datasources/sync_local_datasource.dart';

/// Implementação do [SyncRepository] orquestrando o outbox local + motor.
class SyncRepositoryImpl implements SyncRepository {
  const SyncRepositoryImpl({
    required this.local,
    required this.engine,
    required String Function() tenantId,
    required String Function() userId,
  })  : _tenantId = tenantId,
        _userId = userId;

  final SyncLocalDataSource local;
  final SyncEngine engine;
  final String Function() _tenantId;
  final String Function() _userId;

  @override
  Future<SyncResult> triggerSync() {
    return engine.triggerSync(tenantId: _tenantId(), userId: _userId());
  }

  @override
  Future<SyncResult> pullChanges() {
    return engine.pullChanges();
  }

  @override
  Future<void> enqueue({
    required String tableName,
    required SyncOperation operation,
    required Map<String, dynamic> payload,
  }) async {
    final tenant = _tenantId();
    final user = _userId();
    await local.enqueue(
      tenantId: tenant.isEmpty ? 'guest' : tenant,
      userId: user.isEmpty ? 'guest' : user,
      tableName: tableName,
      operation: operation,
      payload: payload,
    );
  }
}