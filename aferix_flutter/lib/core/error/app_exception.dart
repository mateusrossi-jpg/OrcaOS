/// Hierarquia tipada de erros do Aferix.
///
/// Cada exceção mapeia para uma categoria de erro do outbox/sync
/// (ver `arquitetura_persistencia_sync.md`, seção 1.4) para que o
/// [SyncEngine] decida retry, dead-letter, parada total ou erro permanente.
sealed class AppException implements Exception {
  const AppException(this.message, {this.cause});

  final String message;
  final Object? cause;

  @override
  String toString() => '$runtimeType: $message';
}

/// Falha de rede/connectividade. Retentável.
class NetworkException extends AppException {
  const NetworkException(super.message, {super.cause});
}

/// 401/403 do Supabase. Para o sync inteiro até novo login.
class AuthException extends AppException {
  const AuthException(super.message, {super.cause, this.statusCode});
  final int? statusCode;
}

/// Violação de integridade de tenant. Irretentável (`security_error`).
class SecurityException extends AppException {
  const SecurityException(super.message, {super.cause});
}

/// Erro de validação (4xx diferente de 429). Vai para dead_letter
/// (`validation_error`).
class ValidationException extends AppException {
  const ValidationException(super.message, {super.cause});
}

/// Registro editado por outra fonte de escrita. Vai para dead_letter
/// (`conflict_error`) e marca `conflict_state` no registro local.
class ConflictException extends AppException {
  const ConflictException(
    super.message, {
    super.cause,
    required this.remoteVersion,
    required this.localVersion,
  });

  final int remoteVersion;
  final int localVersion;
}

/// OS concluída é imutável — qualquer update lança erro (R1).
class ImmutableEntityException extends AppException {
  const ImmutableEntityException(
    super.message, {
    super.cause,
    this.tableName,
    this.recordId,
  });

  final String? tableName;
  final String? recordId;
}

/// Operação de sync sem tenant/sessão ativa.
class MissingTenantException extends AppException {
  const MissingTenantException([super.message = 'Sem tenant ativo para operar.']);
}

/// Base de dados local indisponível ou com falha.
class DatabaseException extends AppException {
  const DatabaseException(super.message, {super.cause});
}

/// Supabase não configurado (url/anonKey ausentes no build).
class SyncNotConfiguredException extends AppException {
  const SyncNotConfiguredException([
    super.message = 'Supabase não configurado. Sync desabilitado.',
  ]);
}

/// Sync interrompido por autorização (estado compartilhado do motor).
class SyncHaltedByAuthException extends AppException {
  const SyncHaltedByAuthException([super.message = 'Sync parado por 401/403.']);
}