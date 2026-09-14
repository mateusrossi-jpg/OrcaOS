import 'package:freezed_annotation/freezed_annotation.dart';

import 'sync_enums.dart';

part 'sync_entity.freezed.dart';
part 'sync_entity.g.dart';

/// Campos de consistência compartilhados por toda entidade sincronizável
/// (seção 1.3 da especificação).
///
/// Modelo base, imutável, para os registros que trafegam no outbox e no
/// pull. Entidades de domínio (clientes, OS, financeiro) são construídas
/// sobre estes campos.
@freezed
abstract class SyncEntity with _$SyncEntity {
  const SyncEntity._();

  const factory SyncEntity({
    required String id,
    @JsonKey(name: 'created_at') required String createdAt,
    @JsonKey(name: 'updated_at') required String updatedAt,
    @Default(0) int version,
    @JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok)
    @Default(ConflictState.ok)
    ConflictState conflictState,
  }) = _SyncEntity;

  factory SyncEntity.fromJson(Map<String, dynamic> json) =>
      _$SyncEntityFromJson(json);
}