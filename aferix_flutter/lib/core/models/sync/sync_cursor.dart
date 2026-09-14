import 'package:freezed_annotation/freezed_annotation.dart';

part 'sync_cursor.freezed.dart';
part 'sync_cursor.g.dart';

/// Cursor de pull (supabase.sync_cursors).
///
/// Paginação por `(updated_at, id)` composto sem duplicatas (R15).
/// `lastProcessedId` resolve empates de `updated_at` idêntico.
@freezed
abstract class SyncCursor with _$SyncCursor {
  const SyncCursor._();

  const factory SyncCursor({
    @JsonKey(name: 'tenant_id') required String tenantId,
    @JsonKey(name: 'table_name') required String tableName,
    @JsonKey(name: 'last_updated_at')
    @Default('1970-01-01T00:00:00.000Z')
    String lastUpdatedAt,
    @JsonKey(name: 'last_processed_id') @Default('') String lastProcessedId,
  }) = _SyncCursor;

  factory SyncCursor.fromJson(Map<String, dynamic> json) =>
      _$SyncCursorFromJson(json);

  bool get isFresh => lastProcessedId.isEmpty;
}