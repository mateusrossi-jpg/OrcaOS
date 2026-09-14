import 'package:aferix_flutter/core/sync/sync_merge_resolver.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> rec(String id, String table, {String? status, String updatedAt = '2026-01-02'}) =>
    {'id': id, 'table': table, 'status': status, 'updated_at': updatedAt};

void main() {
  const resolver = SyncMergeResolver();

  group('MergeResolver — regras críticas', () {
    test('transações: add-only — nunca sobrescreve (R9/RC5)', () {
      expect(
        resolver.resolve(
          table: 'transactions',
          remoteRecord: rec('t1', 'transactions'),
          existingRecord: rec('t1', 'transactions'),
          hasPendingMutation: false,
        ),
        isA<KeepLocalAddOnly>(),
      );
      expect(
        resolver.resolve(
          table: 'transactions',
          remoteRecord: rec('t2', 'transactions'),
          existingRecord: null,
          hasPendingMutation: false,
        ),
        isA<InsertNew>(),
      );
    });

    test('LWW: sobrescreve com remoto', () {
      final action = resolver.resolve(
        table: 'customers',
        remoteRecord: rec('c1', 'customers'),
        existingRecord: rec('c1', 'customers'),
        hasPendingMutation: false,
      );
      expect(action, isA<UpsertExisting>());
    });

    test('R1: OS concluída é imutável — nem LWW sobrescreve', () {
      final action = resolver.resolve(
        table: 'work_orders',
        remoteRecord: rec('w1', 'work_orders'),
        existingRecord: rec('w1', 'work_orders', status: 'completed'),
        hasPendingMutation: false,
      );
      expect(action, isA<EnforceImmutable>());

      final action2 = resolver.resolve(
        table: 'work_orders',
        remoteRecord: rec('w2', 'work_orders', status: 'completed'),
        existingRecord: null,
        hasPendingMutation: false,
      );
      expect(action2, isA<EnforceImmutable>());
    });

    test('conflictRequired com mutação pendente → FlagConflict (R6)', () {
      final action = resolver.resolve(
        table: 'work_orders',
        remoteRecord: rec('w3', 'work_orders'),
        existingRecord: rec('w3', 'work_orders'),
        hasPendingMutation: true,
      );
      expect(action, isA<FlagConflict>());
      expect((action as FlagConflict).remoteSnapshot['id'], 'w3');
    });

    test('conflictRequired sem mutação pendente → upsert', () {
      final action = resolver.resolve(
        table: 'work_orders',
        remoteRecord: rec('w4', 'work_orders'),
        existingRecord: rec('w4', 'work_orders'),
        hasPendingMutation: false,
      );
      expect(action, isA<UpsertExisting>());
    });
  });
}