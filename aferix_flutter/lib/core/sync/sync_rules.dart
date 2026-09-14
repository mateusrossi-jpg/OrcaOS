import '../models/sync/sync_enums.dart';

/// Regras críticas de sync centralizadas (seções 1.6, 1.8, 2 da
/// especificação).
///
/// Fase 0: registra as políticas por tabela — as tabelas de domínio serão
/// adicionadas ao banco quando os módulos forem migrados. SAFE_MERGE não é
/// implementado no MVP (RC10): campos candidatos ficam como
/// `conflictRequired`.
class SyncRules {
  const SyncRules._();

  /// Política de merge no pull por tabela (seção 1.6).
  static const Map<String, MergePolicy> mergePolicies = {
    'transactions': MergePolicy.addOnly,
    'customers': MergePolicy.lww,
    'stock_reservations': MergePolicy.lww,
    'work_orders': MergePolicy.conflictRequired,
  };

  /// Tabelas puxadas no pull (seção 1.6).
  static const Set<String> pullTables = {
    'work_orders',
    'customers',
    'transactions',
    'stock_reservations',
  };

  static const _immutableCompletedStatus = 'completed';

  static MergePolicy mergePolicyOf(String table) =>
      mergePolicies[table] ?? MergePolicy.lww;

  static bool isPullTable(String table) => pullTables.contains(table);

  /// R1 — OS concluída é imutável. Daos de `work_orders` devem chamar este
  /// guard antes de qualquer update persistir.
  static bool isCompletedOs(Map<String, dynamic> record) {
    return record.isNotEmpty && record['status'] == _immutableCompletedStatus;
  }

  /// Matriz de classificação de conflito por campo (seção 1.8 / 3.4).
  ///
  /// SAFE_MERGE (notas, descrição) tratado como CONFLICT_REQUIRED no MVP
  /// para jamais sobrescrever por engano.
  static const Map<String, Map<String, ConflictClassification>>
      fieldConflictMatrix = {
    'work_orders': {
      'id': ConflictClassification.immutable,
      'status': ConflictClassification.conflictRequired,
      'charged_value': ConflictClassification.conflictRequired,
      'items': ConflictClassification.conflictRequired,
      'title': ConflictClassification.lwwAllowed,
      'description': ConflictClassification.conflictRequired,
    },
    'transactions': {
      'id': ConflictClassification.immutable,
      'value': ConflictClassification.conflictRequired,
      'type': ConflictClassification.conflictRequired,
    },
    'customers': {
      'id': ConflictClassification.immutable,
      'name': ConflictClassification.lwwAllowed,
    },
  };

  static ConflictClassification classify(String table, String field) =>
      fieldConflictMatrix[table]?[field] ?? ConflictClassification.lwwAllowed;

  /// Guard para upsert de campos financeiros (R7, R9) — nunca LWW.
  static bool isFinancial(String table) => mergePolicyOf(table) == MergePolicy.addOnly;
}