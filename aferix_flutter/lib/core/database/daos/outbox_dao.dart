import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';

import '../../error/app_exception.dart';
import '../../models/sync/sync_enums.dart';

import '../aferix_database.dart';
import '../tables/sync_outbox_table.dart';

part 'outbox_dao.g.dart';

/// Operações sobre `sync_outbox` (seção 3.2 da especificação).
///
/// Gera `id` (UUIDv4) e `correlationId` no cliente antes de persistir (R2).
@DriftAccessor(tables: [SyncOutboxTable])
class OutboxDao extends DatabaseAccessor<AferixDatabase>
    with _$OutboxDaoMixin {
  OutboxDao(super.db);

  static const maxRetries = 3;

  /// Enfileira uma operação offline. Lança [MissingTenantException] quando
  /// não há tenant/sessão ativa (equivalente ao guard do React).
  Future<SyncOutboxItem> enqueue({
    required String tenantId,
    required String userId,
    required String tableName,
    required SyncOperation operation,
    required Map<String, dynamic> payload,
  }) async {
    if (tenantId.isEmpty || userId.isEmpty) {
      throw const MissingTenantException();
    }
    final recordId = payload['id'] as String?;
    if (recordId == null || recordId.isEmpty) {
      throw const ValidationException('Payload sem campo id para enfileirar.');
    }

    final now = DateTime.now().toUtc().toIso8601String();
    final item = SyncOutboxItem(
      id: const Uuid().v4(),
      tenantId: tenantId,
      userId: userId,
      table: tableName,
      recordId: recordId,
      operation: operation,
      payload: jsonEncode(payload),
      correlationId: 'mut_${const Uuid().v4()}',
      createdAt: now,
      retryCount: 0,
      status: OutboxStatus.pending,
      errorCategory: null,
      lastError: null,
    );
    await into(syncOutboxTable).insert(item);
    return item;
  }

  /// Itens `pending` em ordem de criação (FIFO).
  Future<List<SyncOutboxItem>> getPending() async {
    final rows = await (select(syncOutboxTable)
          ..where((t) => t.status.equals('pending'))
          ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
        .get();
    return rows;
  }

  Future<SyncOutboxItem?> findById(String id) async {
    return (select(syncOutboxTable)..where((t) => t.id.equals(id)))
        .getSingleOrNull();
  }

  /// Itens com um [status] específico (consultas de estado/dashboard).
  Future<List<SyncOutboxItem>> itemsWithStatus(OutboxStatus status) =>
      (select(syncOutboxTable)..where((t) => t.status.equals(status.name))).get();

  /// Sucesso → remove da fila (o payload já está no servidor).
  Future<void> markSuccess(String id) async {
    await (delete(syncOutboxTable)..where((t) => t.id.equals(id))).go();
  }

  /// Marca como `dead_letter` com categoria e mensagem de erro.
  Future<void> markDeadLetter(
    String id, {
    required ErrorCategory category,
    required String lastError,
  }) async {
    await _update(id, (c) => c.copyWith(
          status: const Value(OutboxStatus.deadLetter),
          errorCategory: Value(category.name),
          lastError: Value(lastError),
        ));
  }

  /// `security_error` é irretentável (R14) — status próprio, nunca requeue.
  Future<void> markSecurityError(String id, String lastError) async {
    await _update(id, (c) => c.copyWith(
          status: const Value(OutboxStatus.securityError),
          errorCategory: Value(ErrorCategory.securityError.name),
          lastError: Value(lastError),
        ));
  }

  /// Incrementa retry. Retorna `false` quando o item esgotou tentativas
  /// e foi movido para `dead_letter` (R12).
  Future<bool> incrementRetry(
    String id,
    ErrorCategory category,
    String error,
  ) async {
    final item = await findById(id);
    if (item == null) return false;

    final next = item.retryCount + 1;
    if (next >= maxRetries) {
      await markDeadLetter(id, category: category, lastError: error);
      return false;
    }

    return (await _update(id, (c) => c.copyWith(
          retryCount: Value(next),
          status: const Value(OutboxStatus.pending),
          errorCategory: Value(category.name),
          lastError: Value(error),
        ))) == 1;
  }

  Future<int> _update(
    String id,
    SyncOutboxTableCompanion Function(
      SyncOutboxTableCompanion companion,
    ) transform,
  ) async {
    final item = await findById(id);
    if (item == null) return 0;
    return (update(syncOutboxTable)..where((t) => t.id.equals(id))).write(
      transform(item.toCompanion(true)),
    );
  }
}