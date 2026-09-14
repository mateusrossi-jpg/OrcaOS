import 'dart:convert';

import '../../data/datasources/sync_local_datasource.dart';
import '../../data/datasources/sync_remote_datasource.dart';
import '../error/app_exception.dart';
import '../models/sync/sync_enums.dart';
import '../models/sync/sync_result.dart';

import 'sync_merge_resolver.dart';
import 'sync_rules.dart';

/// Alvo de pull para uma tabela de domínio — ponto de extensão para os
/// módulos migrados (clientes, OS, financeiro, estoque).
///
/// Fase 0: nenhuma tabela de domínio está no banco, então o app não
/// registra alvos; o motor permanece pronto para recebê-los via providers.
abstract class SyncPullTarget {
  Future<Map<String, dynamic>?> read(String id);

  Future<void> insert(Map<String, dynamic> record);

  Future<void> update(Map<String, dynamic> record);

  /// Marca `conflict_state = conflict` e persiste o `remote_snapshot`
  /// (seção 1.3).
  Future<void> markConflict(Map<String, dynamic> remoteSnapshot);
}

/// Motor de sync equivalente ao `syncEngine.ts` (seções 1.5–1.7, 3.3).
///
/// Regras críticas preservadas:
/// - R12: máximo de 3 tentativas → dead_letter (sem loop infinito);
/// - R13: 401/403 interrompe o sync inteiro até novo login;
/// - R14: `security_error` é irretentável (status próprio);
/// - R7/R9/RC5: transações financeiras nunca são sobrescritas no pull;
/// - R1: OS concluída é imutável (via [SyncMergeResolver] e guards).
class SyncEngine {
  SyncEngine({
    required this.local,
    required this.remote,
    this.tenantId,
    this.userId,
    Map<String, SyncPullTarget> targets = const {},
    Set<String> tables = SyncRules.pullTables,
    SyncMergeResolver resolver = syncMergeResolver,
    this.localeNow,
  })  : _targets = targets,
        _tables = tables,
        _resolver = resolver;

  final SyncLocalDataSource local;
  final SyncRemoteDataSource remote;

  String? tenantId;
  String? userId;

  final Map<String, SyncPullTarget> _targets;
  final Set<String> _tables;
  final SyncMergeResolver _resolver;

  /// Injetável para testes de tempo.
  final DateTime Function()? localeNow;

  bool _isPushing = false;
  bool _isPulling = false;

  Future<SyncResult> triggerSync({
    String? tenantId,
    String? userId,
  }) async {
    this.tenantId = tenantId ?? this.tenantId;
    this.userId = userId ?? this.userId;

    if (!remote.isConfigured) {
      return const SyncResult(skippedNotConfigured: true);
    }
    if (this.tenantId == null || this.userId == null) {
      throw const MissingTenantException();
    }

    var result = await processOutbox();
    if (result.haltedByAuth) return result;
    final pull = await pullChanges();
    return result.copyWith(pulled: pull.pulled, lastError: result.lastError ?? pull.lastError);
  }

  /// PUSH — envia a fila `sync_outbox` para o Supabase (seções 1.4–1.5).
  Future<SyncResult> processOutbox() async {
    if (_isPushing) return const SyncResult();
    _isPushing = true;

    final sessionTenant = tenantId;
    if (sessionTenant == null) throw const MissingTenantException();

    var pushed = 0;
    var deadLetters = 0;
    var halted = false;
    String? lastError;

    try {
      final pending = await local.getPendingOutboxItems();

      for (final item in pending) {
        switch (item.operation) {
          case SyncOperation.insert:
          case SyncOperation.update:
            final payload = _decodePayload(item.payload);

            // Detecção de conflito de versão por registro (seção 1.5).
            final remoteRecord = await remote.fetchRecord(
              item.table,
              item.recordId,
            );
            if (remoteRecord != null &&
                item.table == 'work_orders' &&
                _remoteIsNewer(remoteRecord, payload)) {
              await local.deadLetterOutboxItem(
                item.id,
                category: ErrorCategory.conflictError,
                lastError: 'Conflito de versão: remoto mais novo',
              );
              deadLetters++;
              continue;
            }

            try {
              await remote.upsert(item.table, payload);
            } on AppException catch (e) {
              // Conflito de validação remota durante o upsert.
              if (e is ValidationException) {
                await local.deadLetterOutboxItem(
                  item.id,
                  category: ErrorCategory.validationError,
                  lastError: e.message,
                );
                deadLetters++;
                continue;
              }
              rethrow;
            }

            await local.removeOutboxItem(item.id);
            pushed++;

          case SyncOperation.delete:
            await remote.delete(item.table, item.recordId);
            await local.removeOutboxItem(item.id);
            pushed++;
        }
      }
    } on AuthException catch (e) {
      // R13 — 401/403 para o sync inteiro; itens permanecem pending.
      halted = true;
      lastError = e.message;
    } on SecurityException catch (e) {
      // R14 — irretentável, marca item e para a fila (ordem preservada).
      final pending = await local.getPendingOutboxItems();
      if (pending.isNotEmpty) {
        await local.securityErrorOutboxItem(pending.first.id, e.message);
      }
      lastError = e.message;
    } on SyncNotConfiguredException catch (e) {
      lastError = e.message;
    } on SyncHaltedByAuthException catch (e) {
      halted = true;
      lastError = e.message;
    } catch (e) {
      // Erro retryável (5xx, rede): retry_count++ → dead_letter após 3 (R12).
      final pending = await local.getPendingOutboxItems();
      if (pending.isNotEmpty) {
        final ok = await local.incrementOutboxRetry(
          pending.first.id,
          ErrorCategory.retryableError,
          e.toString(),
        );
        if (!ok) deadLetters++;
      }
      lastError = e.toString();
    } finally {
      _isPushing = false;
    }

    return SyncResult(
      pushed: pushed,
      queuedDeadLetters: deadLetters,
      haltedByAuth: halted,
      lastError: lastError,
    );
  }

  /// PULL — busca remota por cursor e aplica a regra de merge (seção 1.6).
  Future<SyncResult> pullChanges() async {
    if (_isPulling) return const SyncResult();
    _isPulling = true;

    final sessionTenant = tenantId;
    if (sessionTenant == null) throw const MissingTenantException();

    var pulled = 0;
    String? lastError;

    try {
      for (final table in _tables) {
        final target = _targets[table];
        if (target == null) continue; // tabela de domínio ainda não migrada.

        final cursor = await local.getCursor(sessionTenant, table);
        final changes = await remote.fetchChanges(table, cursor);

        String newestUpdatedAt = cursor.lastUpdatedAt;
        String newestId = cursor.lastProcessedId;

        for (final remoteRecord in changes) {
          final id = remoteRecord['id'] as String;
          final existing = await target.read(id);

          final action = _resolver.resolve(
            table: table,
            remoteRecord: remoteRecord,
            existingRecord: existing,
            hasPendingMutation:
                await local.hasPendingMutationFor(table, id),
          );

          switch (action) {
            case InsertNew():
              await target.insert(remoteRecord);
            case UpsertExisting():
              await target.update(remoteRecord);
            case KeepLocalAddOnly():
              break; // R9 — transação financeira existente não é tocada.
            case FlagConflict():
              await target.markConflict(remoteRecord);
            case EnforceImmutable():
              break; // R1 — OS concluída intocável.
          }

          final updatedAt = (remoteRecord['updated_at'] as String?) ?? '';
          if (updatedAt.compareTo(newestUpdatedAt) > 0) {
            newestUpdatedAt = updatedAt;
            newestId = id;
          }
          pulled++;
        }

        if (changes.isNotEmpty) {
          await local.updateCursor(
            sessionTenant,
            table,
            lastUpdatedAt: newestUpdatedAt,
            lastProcessedId: newestId,
          );
        }
      }
    } on AuthException catch (e) {
      lastError = e.message;
    } on SyncNotConfiguredException catch (e) {
      lastError = e.message;
    } finally {
      _isPulling = false;
    }

    return SyncResult(pulled: pulled, lastError: lastError);
  }

  bool _remoteIsNewer(
    Map<String, dynamic> remoteRecord,
    Map<String, dynamic> localPayload,
  ) {
    final remoteV = _versionOf(remoteRecord);
    final localV = _versionOf(localPayload);
    return remoteV > localV;
  }

  int _versionOf(Map<String, dynamic> record) {
    final v = record['version'];
    return v is num ? v.toInt() : 0;
  }

  Map<String, dynamic> _decodePayload(String payload) {
    final decoded = jsonDecode(payload);
    return decoded is Map<String, dynamic>
        ? decoded
        : (decoded as Map).cast<String, dynamic>();
  }
}