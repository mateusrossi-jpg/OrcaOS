import 'package:drift/drift.dart';

/// Cursor de pull por tenant + tabela (supabase.sync_cursors).
///
/// PK composta `(tenantId, tableName)` — mais forte que o `&id` + índices
/// do Dexie, e bloqueará duplicatas de cursor por construção.
@DataClassName('SyncCursorTableRow')
class SyncCursorsTable extends Table {
  TextColumn get tenantId => text()();
  TextColumn get table => text().named('table_name')();
  TextColumn get lastUpdatedAt => text()();
  TextColumn get lastProcessedId => text().withDefault(const Constant(''))();

  @override
  Set<Column> get primaryKey => {tenantId, table};
}