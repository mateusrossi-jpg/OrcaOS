import 'package:drift/drift.dart';

import '../../models/sync/sync_cursor.dart';

import '../aferix_database.dart';
import '../tables/sync_cursor_table.dart';

part 'sync_cursor_dao.g.dart';

/// Operações sobre `sync_cursors` (R15 — cursor composto `(updated_at, id)`).
@DriftAccessor(tables: [SyncCursorsTable])
class SyncCursorDao extends DatabaseAccessor<AferixDatabase>
    with _$SyncCursorDaoMixin {
  SyncCursorDao(super.db);

  static const _epoch = '1970-01-01T00:00:00.000Z';

  /// Cursor atual de uma tabela; retorna cursor vazio (época) se ausente.
  Future<SyncCursor> getCursor(String tenantId, String tableName) async {
    final row = await (select(syncCursorsTable)
          ..where((t) =>
              t.tenantId.equals(tenantId) & t.table.equals(tableName)))
        .getSingleOrNull();
    if (row == null) {
      return SyncCursor(tenantId: tenantId, tableName: tableName);
    }
    return SyncCursor(
      tenantId: row.tenantId,
      tableName: row.table,
      lastUpdatedAt: row.lastUpdatedAt,
      lastProcessedId: row.lastProcessedId,
    );
  }

  /// Avança o cursor (upsert por PK composta).
  Future<void> updateCursor(
    String tenantId,
    String tableName, {
    required String lastUpdatedAt,
    String lastProcessedId = '',
  }) async {
    await into(syncCursorsTable).insertOnConflictUpdate(SyncCursorTableRow(
      tenantId: tenantId,
      table: tableName,
      lastUpdatedAt: lastUpdatedAt,
      lastProcessedId: lastProcessedId,
    ));
  }

  /// Cursor de referência utilizado nos testes.
  static SyncCursor epochCursor(String tenantId, String tableName) =>
      SyncCursor(
        tenantId: tenantId,
        tableName: tableName,
        lastUpdatedAt: _epoch,
      );
}