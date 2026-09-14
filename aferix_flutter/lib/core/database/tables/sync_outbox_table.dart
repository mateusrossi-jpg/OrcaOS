import 'package:drift/drift.dart';

import '../../../core/models/sync/sync_enums.dart';

/// Fila de operações offline (Supabase.sync_outbox).
///
/// Espelho fiel do schema v4→v13 do Dexie (seção 1.4 da especificação).
/// Campo `errorCategory` fica como texto para conversão manual via
/// [ErrorCategory.fromWire].
@DataClassName('SyncOutboxItem')
class SyncOutboxTable extends Table {
  TextColumn get id => text()();
  TextColumn get tenantId => text()();
  TextColumn get userId => text()();
  TextColumn get table => text().named('table_name')();
  TextColumn get recordId => text()();
  TextColumn get operation => textEnum<SyncOperation>()();
  TextColumn get payload => text()();
  TextColumn get correlationId => text()();
  TextColumn get createdAt => text()();
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  TextColumn get status => textEnum<OutboxStatus>()
      .withDefault(const Constant('pending'))();
  TextColumn get errorCategory => text().nullable()();
  TextColumn get lastError => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};

  @override
  List<Set<Column>> get uniqueKeys => [
        {correlationId},
      ];
}