import 'package:freezed_annotation/freezed_annotation.dart';

part 'sync_result.freezed.dart';

/// Resultado de uma execução completa de sync (push + pull).
@freezed
abstract class SyncResult with _$SyncResult {
  const SyncResult._();

  const factory SyncResult({
    @Default(0) int pushed,
    @Default(0) int pulled,
    @Default(0) int queuedDeadLetters,
    @Default(false) bool haltedByAuth,
    @Default(false) bool skippedNotConfigured,
    @Default(null) String? lastError,
  }) = _SyncResult;

  /// `true` se o sync emitiu erro que exige login (401/403) — R13.
  bool get failed => lastError != null;
}