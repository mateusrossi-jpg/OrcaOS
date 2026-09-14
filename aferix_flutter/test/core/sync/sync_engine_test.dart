import 'package:aferix_flutter/core/database/aferix_database.dart';
import 'package:aferix_flutter/core/database/daos/outbox_dao.dart';
import 'package:aferix_flutter/core/database/daos/sync_cursor_dao.dart';
import 'package:aferix_flutter/core/models/sync/sync_enums.dart';
import 'package:aferix_flutter/core/sync/sync_engine.dart';
import 'package:aferix_flutter/data/datasources/sync_local_datasource.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/fake_remote_datasource.dart';
import '../../helpers/test_database.dart';

class _FakePullTarget implements SyncPullTarget {
  final Map<String, Map<String, dynamic>> existing = {};
  final List<String> inserts = [];
  final List<String> updates = [];
  final List<String> conflicts = [];

  @override
  Future<Map<String, dynamic>?> read(String id) async => existing[id];

  @override
  Future<void> insert(Map<String, dynamic> record) async {
    existing[record['id'] as String] = record;
    inserts.add(record['id'] as String);
  }

  @override
  Future<void> update(Map<String, dynamic> record) async {
    existing[record['id'] as String] = record;
    updates.add(record['id'] as String);
  }

  @override
  Future<void> markConflict(Map<String, dynamic> remoteSnapshot) async {
    conflicts.add(remoteSnapshot['id'] as String);
  }
}

void main() {
  late AferixDatabase db;
  late DriftSyncLocalDataSource local;
  late FakeRemoteDataSource remote;

  setUp(() async {
    db = await openInMemoryDb();
    local = DriftSyncLocalDataSource(
      outboxDao: OutboxDao(db),
      cursorDao: SyncCursorDao(db),
    );
    remote = FakeRemoteDataSource();
  });

  tearDown(() async {
    await db.close();
  });

  SyncEngine engine({Set<String> tables = const {}, Map<String, SyncPullTarget> targets = const {}}) {
    return SyncEngine(
      local: local,
      remote: remote,
      tenantId: 't1',
      userId: 'u1',
      tables: tables,
      targets: targets,
    );
  }

  group('processOutbox (PUSH)', () {
    test('sucesso: upsert remoto + remove da fila', () async {
      await local.enqueue(
        tenantId: 't1', userId: 'u1', tableName: 'customers',
        operation: SyncOperation.insert,
        payload: {'id': 'c1', 'name': 'Rossi', 'version': 1},
      );

      final result = await engine().triggerSync();

      expect(result.pushed, 1);
      expect(await local.getPendingOutboxItems(), isEmpty);
      expect(remote.records['customers:c1'], isNotNull);
    });

    test('conflito de versão em work_orders → dead_letter conflict_error', () async {
      remote.put('work_orders', {'id': 'w1', 'version': 3, 'updated_at': '2026-01-03'});
      await local.enqueue(
        tenantId: 't1', userId: 'u1', tableName: 'work_orders',
        operation: SyncOperation.update,
        payload: {'id': 'w1', 'version': 1},
      );

      final result = await engine().triggerSync();

      expect(result.queuedDeadLetters, 1);
      final dead = await local.outboxDao.itemsWithStatus(OutboxStatus.deadLetter);
      expect(dead.single.errorCategory, ErrorCategory.conflictError.name);
    });

    test('R13: 401/403 interrompe o sync e o item permanece pending', () async {
      remote.throwAuthOnUpsert = true;
      await local.enqueue(
        tenantId: 't1', userId: 'u1', tableName: 'customers',
        operation: SyncOperation.update, payload: {'id': 'c2', 'version': 1},
      );

      final result = await engine().triggerSync();

      expect(result.haltedByAuth, isTrue);
      expect(result.lastError, contains('401'));

      final pending = await local.getPendingOutboxItems();
      expect(pending, hasLength(1));
      expect(pending.single.status, OutboxStatus.pending);
      expect(remote.records['customers:c2'], isNull);
    });

    test('R14: security_error é irretentável', () async {
      remote.throwSecurityOnUpsert = true;
      await local.enqueue(
        tenantId: 't1', userId: 'u1', tableName: 'customers',
        operation: SyncOperation.update, payload: {'id': 'c3', 'version': 1},
      );

      await engine().triggerSync();

      final security = await local.outboxDao
          .itemsWithStatus(OutboxStatus.securityError);
      expect(security, hasLength(1));
      expect(security.single.errorCategory, ErrorCategory.securityError.name);

      // Nunca volta para pending.
      expect(await local.getPendingOutboxItems(), isEmpty);
    });

    test('R12: falha retryável vira dead_letter após 3 tentativas', () async {
      remote.throwNetworkOnUpsert = true;
      await local.enqueue(
        tenantId: 't1', userId: 'u1', tableName: 'customers',
        operation: SyncOperation.update, payload: {'id': 'c4', 'version': 1},
      );

      var result = await engine().triggerSync();
      expect(result.lastError, contains('rede'));

      var item = (await local.getPendingOutboxItems()).single;
      expect(item.retryCount, 1);
      expect(item.status, OutboxStatus.pending);

      await engine().triggerSync();
      item = (await local.getPendingOutboxItems()).single;
      expect(item.retryCount, 2);

      await engine().triggerSync();
      final dead = await local.outboxDao.itemsWithStatus(OutboxStatus.deadLetter);
      expect(dead, hasLength(1));
      expect(dead.single.errorCategory, ErrorCategory.retryableError.name);
      expect(await local.getPendingOutboxItems(), isEmpty);
    });
  });

  group('pullChanges (PULL)', () {
    test('R9: transações add-only — nunca sobrescreve, só insere no novo', () async {
      final target = _FakePullTarget();
      target.existing['tx1'] = {'id': 'tx1', 'value': 100};
      remote.put('transactions', {'id': 'tx1', 'updated_at': '2026-01-02T00:00:00.000Z'});

      var result = await engine(tables: {'transactions'}, targets: {'transactions': target})
          .pullChanges();

      expect(result.pulled, 1);
      expect(target.updates, isEmpty); // nunca sobrescreve (RC5)
      expect(target.inserts, isEmpty);

      // Registro novo → insert.
      remote.put('transactions', {'id': 'tx2', 'updated_at': '2026-01-03T00:00:00.000Z'});
      result = await engine(tables: {'transactions'}, targets: {'transactions': target})
          .pullChanges();
      expect(target.inserts, contains('tx2'));
    });

    test('R1: OS concluída imutável no pull', () async {
      final target = _FakePullTarget();
      target.existing['w1'] = {'id': 'w1', 'status': 'completed', 'version': 2};
      remote.put('work_orders', {'id': 'w1', 'status': 'completed', 'version': 3, 'updated_at': '2026-01-04T00:00:00.000Z'});

      await engine(tables: {'work_orders'}, targets: {'work_orders': target})
          .pullChanges();

      expect(target.updates, isEmpty);
      expect(target.existing['w1']!['version'], 2); // intocada
    });

    test('R6: conflito em work_orders com mutação pendente flagga snapshot', () async {
      final target = _FakePullTarget();
      target.existing['w2'] = {'id': 'w2', 'status': 'approved'};
      remote.put('work_orders', {'id': 'w2', 'status': 'paid', 'updated_at': '2026-01-05T00:00:00.000Z'});

      await local.enqueue(
        tenantId: 't1', userId: 'u1', tableName: 'work_orders',
        operation: SyncOperation.update,
        payload: {'id': 'w2', 'status': 'cancelled', 'version': 4},
      );

      await engine(tables: {'work_orders'}, targets: {'work_orders': target})
          .pullChanges();

      expect(target.conflicts, contains('w2'));
      expect(target.updates, isEmpty);
    });

    test('cursor avança em (updated_at, id) — sem re-pull (R15)', () async {
      final target = _FakePullTarget();
      remote.put('customers', {'id': 'c1', 'updated_at': '2026-01-06T00:00:00.000Z'});

      var e = engine(tables: {'customers'}, targets: {'customers': target});
      await e.pullChanges();

      final cursor = await local.getCursor('t1', 'customers');
      expect(cursor.lastUpdatedAt, '2026-01-06T00:00:00.000Z');

      // Segundo pull: nada novo, cursor não anda para trás e nada re-insere.
      e = engine(tables: {'customers'}, targets: {'customers': target});
      final second = await e.pullChanges();
      expect(second.pulled, 0);
      expect(target.inserts.where((id) => id == 'c1').length, 1);
    });
  });
}