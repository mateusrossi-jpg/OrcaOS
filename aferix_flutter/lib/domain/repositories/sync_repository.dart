import '../../core/models/sync/sync_enums.dart';
import '../../core/models/sync/sync_result.dart';

/// Contrato de domínio do sync — independe de Drift/Supabase/Flutter.
///
/// Assume o papel de porta (Clean Architecture): a camada de dados
/// implementa, o motor core supre a lógica.
abstract class SyncRepository {
  /// Estado de conectividade/fila exposto para a UI (dashboard de sync).
  Future<SyncResult> triggerSync();

  /// Enfileira uma mutação offline via outbox (seção 1.4).
  Future<void> enqueue({
    required String tableName,
    required SyncOperation operation,
    required Map<String, dynamic> payload,
  });

  /// Executa somente o pull (usado em retorno de conectividade).
  Future<SyncResult> pullChanges();
}