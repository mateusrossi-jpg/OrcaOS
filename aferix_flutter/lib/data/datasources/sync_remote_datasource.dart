import 'package:supabase_flutter/supabase_flutter.dart'
    hide AuthException;

import '../../core/error/app_exception.dart';
import '../../core/models/sync/sync_cursor.dart';

/// Contrato de acesso ao servidor (Supabase). Seção 3.3 da especificação.
abstract class SyncRemoteDataSource {
  bool get isConfigured;

  /// Registro isolado por PK — usado pelo `processOutbox` para detectar
  /// conflito de versão antes de upsert (seção 1.5).
  Future<Map<String, dynamic>?> fetchRecord(String table, String id);

  /// Mudanças após o cursor, `(updated_at, id)` composto (R15).
  Future<List<Map<String, dynamic>>> fetchChanges(
    String table,
    SyncCursor cursor,
  );

  Future<void> upsert(String table, Map<String, dynamic> payload);

  Future<void> delete(String table, String id);
}

/// Implementação sobre o SDK `supabase_flutter`.
///
/// [client] é normalmente `Supabase.instance.client`. Em Fase 0 o Supabase
/// pode estar não configurado — então `isConfigured` é `false` e o motor
/// pula o push/pull.
class SupabaseSyncRemoteDataSource implements SyncRemoteDataSource {
  const SupabaseSyncRemoteDataSource({
    required this.isConfigured,
    this.client,
  });

  @override
  final bool isConfigured;
  final SupabaseClient? client;

  static const _pageSize = 500;

  @override
  Future<Map<String, dynamic>?> fetchRecord(String table, String id) async {
    final c = _requireClient();
    return c.from(table).select().eq('id', id).maybeSingle();
  }

  @override
  Future<List<Map<String, dynamic>>> fetchChanges(
    String table,
    SyncCursor cursor,
  ) async {
    final c = _requireClient();
    var query = c
        .from(table)
        .select()
        .or(
          'updated_at.gt.${cursor.lastUpdatedAt},'
          'and(updated_at.eq.${cursor.lastUpdatedAt},'
          'id.gt.${cursor.lastProcessedId})',
        )
        .order('updated_at')
        .order('id')
        .limit(_pageSize);
    return query;
  }

  @override
  Future<void> upsert(String table, Map<String, dynamic> payload) async {
    await _requireClient().from(table).upsert(payload);
  }

  @override
  Future<void> delete(String table, String id) async {
    await _requireClient().from(table).delete().eq('id', id);
  }

  SupabaseClient _requireClient() {
    final c = client;
    if (!isConfigured || c == null) {
      throw const SyncNotConfiguredException();
    }
    return c;
  }
}

/// Traduz erros do PostgREST em [AppException] tipada.
AppException mapRemoteError(Object error) {
  if (error is AppException) return error;

  final message = error.toString();
  if (message.contains('JWT')) return const AuthException('401/403 — re-auth');
  return NetworkException('Falha remota: $message', cause: error);
}