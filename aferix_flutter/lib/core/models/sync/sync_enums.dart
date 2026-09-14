/// Enums de domínio de sync usadas por outbox, cursor e regras de merge.
///
/// Valores armazenados no banco via Drift `textEnum` (`.`name`), sempre
/// maiúsculos no wire protocol (compatibilidade com o backend/Supabase).

/// Operação de escrita de um item do outbox (SyncOutboxItem.operation).
enum SyncOperation {
  insert('INSERT'),
  update('UPDATE'),
  delete('DELETE');

  const SyncOperation(this.wire);

  final String wire;

  static SyncOperation fromWire(String value) => values.firstWhere(
        (v) => v.wire == value,
        orElse: () => SyncOperation.update,
      );
}

/// Status de um item do outbox.
///
/// O schema React também admite `''` (vazio) para itens pendentes;
/// aqui normalizamos tudo para `pending`.
enum OutboxStatus {
  pending,
  deadLetter,
  securityError,
}

/// Categoria de erro de um item do outbox (SyncOutboxItem.error_category).
enum ErrorCategory {
  retryableError,
  validationError,
  conflictError,
  authError,
  securityError;

  static ErrorCategory? fromWire(String? value) {
    if (value == null || value.isEmpty) return null;
    return values.firstWhere(
      (v) => v.name == value,
      orElse: () => ErrorCategory.retryableError,
    );
  }
}

/// Estado de conflito de um registro (`conflict_state`).
enum ConflictState {
  ok,
  conflict,
  resolved,
  pendingResolution,
}

/// Classificação de conflito por campo (seção 1.8 da especificação).
///
/// SAFE_MERGE não é implementado no MVP — campos que seriam mergeáveis
/// são marcados como `conflictRequired` até existir UI de resolução (RC10).
enum ConflictClassification {
  immutable,
  lwwAllowed,
  safeMerge,
  conflictRequired,
}

/// Política de merge por tabela no pull (seção 1.6 da especificação).
enum MergePolicy {
  /// `add()` apenas se não existe — nunca sobrescreve
  /// (transações financeiras — R7/R9, RC5).
  addOnly,

  /// Last-write-wins (customers, stock_reservations).
  lww,

  /// Exige resolução manual (financeiro, status de OS).
  conflictRequired,
}