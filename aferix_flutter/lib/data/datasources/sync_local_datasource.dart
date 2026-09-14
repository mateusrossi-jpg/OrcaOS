import '../../core/database/aferix_database.dart';
import '../../core/database/daos/outbox_dao.dart';
import '../../core/database/daos/sync_cursor_dao.dart';
import '../../core/models/sync/sync_cursor.dart';
import '../../core/models/sync/sync_enums.dart';

/// Data Class `SyncOutboxItem` do Drift exposto para o motor de sync.
export '../../core/database/aferix_database.dart' show SyncOutboxItem;

/// Contrato de acesso local (Drift) usado pelo [SyncEngine].
abstract class SyncLocalDataSource {
  Future<SyncOutboxItem> enqueue({
    required String tenantId,
    required String userId,
    required String tableName,
    required SyncOperation operation,
    required Map<String, dynamic> payload,
  });

  Future<List<SyncOutboxItem>> getPendingOutboxItems();

  Future<void> removeOutboxItem(String id);

  Future<void> deadLetterOutboxItem(
    String id, {
    required ErrorCategory category,
    required String lastError,
  });

  Future<void> securityErrorOutboxItem(String id, String lastError);

  /// `true` se o item esgotou tentativas (movido para dead_letter).
  Future<bool> incrementOutboxRetry(
    String id,
    ErrorCategory category,
    String error,
  );

  Future<SyncCursor> getCursor(String tenantId, String tableName);

  Future<void> updateCursor(
    String tenantId,
    String tableName, {
    required String lastUpdatedAt,
    String lastProcessedId = '',
  });

  Future<bool> hasPendingMutationFor(String tableName, String recordId);
}

/// Implementação local sobre os DAOs do Drift.
class DriftSyncLocalDataSource implements SyncLocalDataSource {
  const DriftSyncLocalDataSource({
    required this.outboxDao,
    required this.cursorDao,
  });

  final OutboxDao outboxDao;
  final SyncCursorDao cursorDao;

  @override
  Future<SyncOutboxItem> enqueue({
    required String tenantId,
    required String userId,
    required String tableName,
    required SyncOperation operation,
    required Map<String, dynamic> payload,
  }) {
    return outboxDao.enqueue(
      tenantId: tenantId,
      userId: userId,
      tableName: tableName,
      operation: operation,
      payload: payload,
    );
  }

  @override
  Future<List<SyncOutboxItem>> getPendingOutboxItems() => outboxDao.getPending();

  @override
  Future<void> removeOutboxItem(String id) => outboxDao.markSuccess(id);

  @override
  Future<void> deadLetterOutboxItem(
    String id, {
    required ErrorCategory category,
    required String lastError,
  }) =>
      outboxDao.markDeadLetter(id, category: category, lastError: lastError);

  @override
  Future<void> securityErrorOutboxItem(String id, String lastError) =>
      outboxDao.markSecurityError(id, lastError);

  @override
  Future<bool> incrementOutboxRetry(
    String id,
    ErrorCategory category,
    String error,
  ) =>
      outboxDao.incrementRetry(id, category, error);

  @override
  Future<SyncCursor> getCursor(String tenantId, String tableName) =>
      cursorDao.getCursor(tenantId, tableName);

  @override
  Future<void> updateCursor(
    String tenantId,
    String tableName, {
    required String lastUpdatedAt,
    String lastProcessedId = '',
  }) =>
      cursorDao.updateCursor(
        tenantId,
        tableName,
        lastUpdatedAt: lastUpdatedAt,
        lastProcessedId: lastProcessedId,
      );

  @override
  Future<bool> hasPendingMutationFor(String tableName, String recordId) async {
    final pending = await outboxDao.getPending();
    return pending.any(
      (item) => item.table == tableName && item.recordId == recordId,
    );
  }
}