import 'package:drift/drift.dart';

import '../models/sync/sync_enums.dart';

import 'daos/outbox_dao.dart';
import 'daos/sync_cursor_dao.dart';
import 'tables/sync_cursor_table.dart';
import 'tables/sync_outbox_table.dart';

part 'aferix_database.g.dart';

/// Banco local do Aferix (Drift/SQLite).
///
/// Fase 0 contém apenas a infraestrutura de persistência de sync
/// (`sync_outbox`, `sync_cursors`). As tabelas de domínio (customers,
/// work_orders, transactions, stock_reservations, ...) entram quando os
/// módulos forem migrados — mapeando 1:1 do schema Dexie.
@DriftDatabase(
  tables: [SyncOutboxTable, SyncCursorsTable],
  daos: [OutboxDao, SyncCursorDao],
)
class AferixDatabase extends _$AferixDatabase {
  AferixDatabase(super.e);

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        beforeOpen: (details) async {
          await customStatement('PRAGMA foreign_keys = ON');
        },
      );
}