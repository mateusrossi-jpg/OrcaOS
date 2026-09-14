import '../models/sync/sync_enums.dart';

import 'sync_rules.dart';

/// Ação de merge decidida para um registro remoto no pull.
sealed class SyncMergeAction {
  const SyncMergeAction();
}

/// Registro não existe localmente → inserir.
class InsertNew extends SyncMergeAction {
  const InsertNew();
  static const instance = InsertNew();
}

/// Política LWW → sobrescrever com o registro remoto.
class UpsertExisting extends SyncMergeAction {
  const UpsertExisting();
  static const instance = UpsertExisting();
}

/// `add_only` → mantém o registro local, descarta o remoto (R9/RC5).
class KeepLocalAddOnly extends SyncMergeAction {
  const KeepLocalAddOnly();
  static const instance = KeepLocalAddOnly();
}

/// `conflict_required` e há mutação local pendente → sinaliza conflito e
/// guarda o snapshot remoto (seção 1.6 / R6).
class FlagConflict extends SyncMergeAction {
  const FlagConflict(this.remoteSnapshot);
  final Map<String, dynamic> remoteSnapshot;
}

/// R1 — OS concluída é imutável: nenhuma escrita pode tocá-la.
class EnforceImmutable extends SyncMergeAction {
  const EnforceImmutable(this.reason);
  final String reason;
}

/// Resolve, de forma pura e testável, a ação de merge de um registro
/// remoto contra o estado local — base do `pullChanges` do [SyncEngine].
class SyncMergeResolver {
  const SyncMergeResolver();

  SyncMergeAction resolve({
    required String table,
    required Map<String, dynamic> remoteRecord,
    Map<String, dynamic>? existingRecord,
    required bool hasPendingMutation,
  }) {
    // R1: OS concluída é imutável — nunca é sobrescrita, nem no pull.
    if (SyncRules.isCompletedOs(remoteRecord) ||
        (existingRecord != null && SyncRules.isCompletedOs(existingRecord))) {
      return const EnforceImmutable('OS concluída não pode ser alterada (R1)');
    }

    switch (SyncRules.mergePolicyOf(table)) {
      case MergePolicy.addOnly:
        // Transações financeiras: `add()` apenas se não existe (R7/R9/RC5).
        return existingRecord == null
            ? InsertNew.instance
            : KeepLocalAddOnly.instance;

      case MergePolicy.lww:
        return existingRecord == null
            ? InsertNew.instance
            : UpsertExisting.instance;

      case MergePolicy.conflictRequired:
        if (existingRecord == null) return InsertNew.instance;
        if (hasPendingMutation) return FlagConflict(remoteRecord);
        return UpsertExisting.instance;
    }
  }
}

/// Instância canônica.
const syncMergeResolver = SyncMergeResolver();