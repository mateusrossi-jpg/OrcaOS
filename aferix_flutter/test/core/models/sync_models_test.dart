import 'package:aferix_flutter/core/models/sync/sync_cursor.dart';
import 'package:aferix_flutter/core/models/sync/sync_enums.dart';
import 'package:aferix_flutter/core/models/sync/sync_entity.dart';
import 'package:aferix_flutter/core/models/sync/sync_result.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SyncEntity (Freezed)', () {
    test('parse de JSON da especificação (seção 1.3)', () {
      final entity = SyncEntity.fromJson({
        'id': 'uuid-v4',
        'created_at': '2026-01-01T00:00:00.000Z',
        'updated_at': '2026-01-02T00:00:00.000Z',
        'version': 3,
      });
      expect(entity.id, 'uuid-v4');
      expect(entity.version, 3);
      expect(entity.conflictState, ConflictState.ok);
    });

    test('conflito explícito é preservado', () {
      final entity = SyncEntity.fromJson({
        'id': 'x',
        'created_at': '2026-01-01T00:00:00.000Z',
        'updated_at': '2026-01-01T00:00:00.000Z',
        'conflict_state': 'conflict',
      });
      expect(entity.conflictState, ConflictState.conflict);
    });

    test('igualdade por valor', () {
      final a = SyncEntity.fromJson({'id': 'a', 'created_at': 't', 'updated_at': 't'});
      final b = SyncEntity.fromJson({'id': 'a', 'created_at': 't', 'updated_at': 't'});
      expect(a, b);
    });
  });

  group('SyncCursor (Freezed)', () {
    test('cursor novo parte da época (R15)', () {
      const cursor = SyncCursor(tenantId: 't', tableName: 'customers');
      expect(cursor.lastUpdatedAt, '1970-01-01T00:00:00.000Z');
      expect(cursor.isFresh, isTrue);
    });

    test('fromJson mapeia campos', () {
      final cursor = SyncCursor.fromJson({
        'tenant_id': 't1',
        'table_name': 'transactions',
        'last_updated_at': '2026-02-01T00:00:00.000Z',
        'last_processed_id': 'rec-9',
      });
      expect(cursor.tenantId, 't1');
      expect(cursor.lastProcessedId, 'rec-9');
    });
  });

  group('SyncResult (Freezed)', () {
    test('copyWith para composição push+pull', () {
      const base = SyncResult(pushed: 2, pulled: 0);
      final merged = base.copyWith(pulled: 5);
      expect(merged.pushed, 2);
      expect(merged.pulled, 5);
    });

    test('failed reflete lastError', () {
      expect(const SyncResult(lastError: 'x').failed, isTrue);
      expect(const SyncResult().failed, isFalse);
    });
  });

  group('Enums de domínio', () {
    test('SyncOperation wire protocol uppercase', () {
      expect(SyncOperation.insert.wire, 'INSERT');
      expect(SyncOperation.fromWire('DELETE'), SyncOperation.delete);
      expect(SyncOperation.fromWire('desconhecido'), SyncOperation.update);
    });

    test('ErrorCategory.fromWire tolera nulo/vazio', () {
      expect(ErrorCategory.fromWire(null), isNull);
      expect(ErrorCategory.fromWire(''), isNull);
      expect(ErrorCategory.fromWire('securityError'), ErrorCategory.securityError);
    });
  });
}