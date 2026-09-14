// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sync_entity.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SyncEntity _$SyncEntityFromJson(Map<String, dynamic> json) => _SyncEntity(
  id: json['id'] as String,
  createdAt: json['created_at'] as String,
  updatedAt: json['updated_at'] as String,
  version: (json['version'] as num?)?.toInt() ?? 0,
  conflictState:
      $enumDecodeNullable(
        _$ConflictStateEnumMap,
        json['conflict_state'],
        unknownValue: ConflictState.ok,
      ) ??
      ConflictState.ok,
);

Map<String, dynamic> _$SyncEntityToJson(_SyncEntity instance) =>
    <String, dynamic>{
      'id': instance.id,
      'created_at': instance.createdAt,
      'updated_at': instance.updatedAt,
      'version': instance.version,
      'conflict_state': _$ConflictStateEnumMap[instance.conflictState]!,
    };

const _$ConflictStateEnumMap = {
  ConflictState.ok: 'ok',
  ConflictState.conflict: 'conflict',
  ConflictState.resolved: 'resolved',
  ConflictState.pendingResolution: 'pendingResolution',
};
