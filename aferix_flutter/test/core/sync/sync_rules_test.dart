import 'package:aferix_flutter/core/models/sync/sync_enums.dart';
import 'package:aferix_flutter/core/sync/sync_rules.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SyncRules', () {
    test('transactions é add-only financeiro (R7/R9/RC5)', () {
      expect(SyncRules.mergePolicyOf('transactions'), MergePolicy.addOnly);
      expect(SyncRules.isFinancial('transactions'), isTrue);
    });

    test('work_orders exige resolução de conflito (R6)', () {
      expect(SyncRules.mergePolicyOf('work_orders'), MergePolicy.conflictRequired);
      expect(SyncRules.isFinancial('work_orders'), isFalse);
    });

    test('customers/stock_reservations: LWW', () {
      expect(SyncRules.mergePolicyOf('customers'), MergePolicy.lww);
      expect(SyncRules.mergePolicyOf('stock_reservations'), MergePolicy.lww);
    });

    test('matriz de campo: financeiro nunca LWW', () {
      expect(
        SyncRules.classify('transactions', 'value'),
        ConflictClassification.conflictRequired,
      );
      expect(
        SyncRules.classify('work_orders', 'status'),
        ConflictClassification.conflictRequired,
      );
      expect(
        SyncRules.classify('work_orders', 'charged_value'),
        ConflictClassification.conflictRequired,
      );
      expect(
        SyncRules.classify('work_orders', 'id'),
        ConflictClassification.immutable,
      );
    });

    test('SAFE_MERGE não é usado no MVP — descrição vira conflictRequired (RC10)', () {
      expect(
        SyncRules.classify('work_orders', 'description'),
        ConflictClassification.conflictRequired,
      );
    });

    test('R1 — OS concluída é imutável', () {
      expect(SyncRules.isCompletedOs({'status': 'completed'}), isTrue);
      expect(SyncRules.isCompletedOs({'status': 'approved'}), isFalse);
      expect(SyncRules.isCompletedOs(const {}), isFalse);
    });
  });
}