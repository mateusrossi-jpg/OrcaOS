// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sync_cursor.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SyncCursor _$SyncCursorFromJson(Map<String, dynamic> json) => _SyncCursor(
  tenantId: json['tenant_id'] as String,
  tableName: json['table_name'] as String,
  lastUpdatedAt:
      json['last_updated_at'] as String? ?? '1970-01-01T00:00:00.000Z',
  lastProcessedId: json['last_processed_id'] as String? ?? '',
);

Map<String, dynamic> _$SyncCursorToJson(_SyncCursor instance) =>
    <String, dynamic>{
      'tenant_id': instance.tenantId,
      'table_name': instance.tableName,
      'last_updated_at': instance.lastUpdatedAt,
      'last_processed_id': instance.lastProcessedId,
    };
