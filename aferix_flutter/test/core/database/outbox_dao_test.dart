import 'package:aferix_flutter/core/database/aferix_database.dart';
import 'package:aferix_flutter/core/database/daos/outbox_dao.dart';
import 'package:aferix_flutter/core/error/app_exception.dart';
import 'package:aferix_flutter/core/models/sync/sync_enums.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_database.dart';

void main() {
  late AferixDatabase db;
  late OutboxDao dao;

  setUp(() async {
    db = await openInMemoryDb();
    dao = OutboxDao(db);
  });

  tearDown(() async {
    await db.close();
  });

  group('OutboxDao.enqueue', () {
    test('gera uuid + correlationId no cliente (R2) e persiste pending', () async {
      final item = await dao.enqueue(
        tenantId: 't1',
        userId: 'u1',
        tableName: 'customers',
        operation: SyncOperation.insert,
        payload: {'id': 'c1', 'name': 'Rossi'},
      );
      expect(item.id, isNotEmpty);
      expect(item.correlationId, startsWith('mut_'));
      expect(item.status, OutboxStatus.pending);
      expect(item.retryCount, 0);

      final stored = await dao.findById(item.id);
      expect(stored, isNotNull);
      expect(stored!.table, 'customers');
      expect(stored.tenantId, 't1');
      expect((stored.payload), contains('Rossi'));
    });

    test('lança MissingTenantException sem tenant (equivalente React)', () async {
      expect(
        () => dao.enqueue(
          tenantId: '',
          userId: 'u1',
          tableName: 'customers',
          operation: SyncOperation.insert,
          payload: {'id': 'c1'},
        ),
        throwsA(isA<MissingTenantException>()),
      );
    });

    test('lança ValidationException sem id no payload', () async {
      expect(
        () => dao.enqueue(
          tenantId: 't1',
          userId: 'u1',
          tableName: 'customers',
          operation: SyncOperation.insert,
          payload: {'name': 'sem-id'},
        ),
        throwsA(isA<ValidationException>()),
      );
    });
  });

  group('OutboxDao ciclo de vida', () {
    test('markSuccess remove da fila', () async {
      final item = await dao.enqueue(
        tenantId: 't1',
        userId: 'u1',
        tableName: 'customers',
        operation: SyncOperation.update,
        payload: {'id': 'c2'},
      );
      await dao.markSuccess(item.id);

      expect(await dao.findById(item.id), isNull);
      expect(await dao.getPending(), isEmpty);
    });

    test('incrementRetry → dead_letter após máx. 3 falhas (R12)', () async {
      final item = await dao.enqueue(
        tenantId: 't1',
        userId: 'u1',
        tableName: 'customers',
        operation: SyncOperation.update,
        payload: {'id': 'c3'},
      );

      expect(await dao.incrementRetry(item.id, ErrorCategory.retryableError, 'e1'), isTrue);
      expect(await dao.incrementRetry(item.id, ErrorCategory.retryableError, 'e2'), isTrue);
      // 2 retries → retryCount 2; a 3ª tenta → chega a 3 (máx) → dead_letter
      expect(await dao.incrementRetry(item.id, ErrorCategory.retryableError, 'e3'), isFalse);

      final stored = await dao.findById(item.id);
      expect(stored!.status, OutboxStatus.deadLetter);
      expect(stored.errorCategory, ErrorCategory.retryableError.name);
    });

    test('markSecurityError é irretentável (R14)', () async {
      final item = await dao.enqueue(
        tenantId: 't1',
        userId: 'u1',
        tableName: 'customers',
        operation: SyncOperation.update,
        payload: {'id': 'c4'},
      );
      await dao.markSecurityError(item.id, 'TenantIntegrityGuard');

      final stored = await dao.findById(item.id);
      expect(stored!.status, OutboxStatus.securityError);
      expect(stored.errorCategory, ErrorCategory.securityError.name);

      // getPending não o devolve → nunca mais será requeue.
      expect(await dao.getPending(), isEmpty);
    });

    test('orders por criação (FIFO)', () async {
      await dao.enqueue(tenantId: 't', userId: 'u', tableName: 'a',
          operation: SyncOperation.insert, payload: {'id': '1'});
      await Future<void>.delayed(const Duration(milliseconds: 5));
      await dao.enqueue(tenantId: 't', userId: 'u', tableName: 'a',
          operation: SyncOperation.insert, payload: {'id': '2'});

      final pending = await dao.getPending();
      expect(pending.map((i) => i.recordId).toList(), ['1', '2']);
    });
  });
}