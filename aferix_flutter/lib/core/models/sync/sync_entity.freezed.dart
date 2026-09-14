// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sync_entity.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$SyncEntity {

 String get id;@JsonKey(name: 'created_at') String get createdAt;@JsonKey(name: 'updated_at') String get updatedAt; int get version;@JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok) ConflictState get conflictState;
/// Create a copy of SyncEntity
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SyncEntityCopyWith<SyncEntity> get copyWith => _$SyncEntityCopyWithImpl<SyncEntity>(this as SyncEntity, _$identity);

  /// Serializes this SyncEntity to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SyncEntity&&(identical(other.id, id) || other.id == id)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.version, version) || other.version == version)&&(identical(other.conflictState, conflictState) || other.conflictState == conflictState));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,createdAt,updatedAt,version,conflictState);

@override
String toString() {
  return 'SyncEntity(id: $id, createdAt: $createdAt, updatedAt: $updatedAt, version: $version, conflictState: $conflictState)';
}


}

/// @nodoc
abstract mixin class $SyncEntityCopyWith<$Res>  {
  factory $SyncEntityCopyWith(SyncEntity value, $Res Function(SyncEntity) _then) = _$SyncEntityCopyWithImpl;
@useResult
$Res call({
 String id,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'updated_at') String updatedAt, int version,@JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok) ConflictState conflictState
});




}
/// @nodoc
class _$SyncEntityCopyWithImpl<$Res>
    implements $SyncEntityCopyWith<$Res> {
  _$SyncEntityCopyWithImpl(this._self, this._then);

  final SyncEntity _self;
  final $Res Function(SyncEntity) _then;

/// Create a copy of SyncEntity
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? createdAt = null,Object? updatedAt = null,Object? version = null,Object? conflictState = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as String,version: null == version ? _self.version : version // ignore: cast_nullable_to_non_nullable
as int,conflictState: null == conflictState ? _self.conflictState : conflictState // ignore: cast_nullable_to_non_nullable
as ConflictState,
  ));
}

}


/// Adds pattern-matching-related methods to [SyncEntity].
extension SyncEntityPatterns on SyncEntity {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SyncEntity value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SyncEntity() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SyncEntity value)  $default,){
final _that = this;
switch (_that) {
case _SyncEntity():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SyncEntity value)?  $default,){
final _that = this;
switch (_that) {
case _SyncEntity() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt,  int version, @JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok)  ConflictState conflictState)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SyncEntity() when $default != null:
return $default(_that.id,_that.createdAt,_that.updatedAt,_that.version,_that.conflictState);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt,  int version, @JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok)  ConflictState conflictState)  $default,) {final _that = this;
switch (_that) {
case _SyncEntity():
return $default(_that.id,_that.createdAt,_that.updatedAt,_that.version,_that.conflictState);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'updated_at')  String updatedAt,  int version, @JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok)  ConflictState conflictState)?  $default,) {final _that = this;
switch (_that) {
case _SyncEntity() when $default != null:
return $default(_that.id,_that.createdAt,_that.updatedAt,_that.version,_that.conflictState);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SyncEntity extends SyncEntity {
  const _SyncEntity({required this.id, @JsonKey(name: 'created_at') required this.createdAt, @JsonKey(name: 'updated_at') required this.updatedAt, this.version = 0, @JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok) this.conflictState = ConflictState.ok}): super._();
  factory _SyncEntity.fromJson(Map<String, dynamic> json) => _$SyncEntityFromJson(json);

@override final  String id;
@override@JsonKey(name: 'created_at') final  String createdAt;
@override@JsonKey(name: 'updated_at') final  String updatedAt;
@override@JsonKey() final  int version;
@override@JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok) final  ConflictState conflictState;

/// Create a copy of SyncEntity
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SyncEntityCopyWith<_SyncEntity> get copyWith => __$SyncEntityCopyWithImpl<_SyncEntity>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SyncEntityToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SyncEntity&&(identical(other.id, id) || other.id == id)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.version, version) || other.version == version)&&(identical(other.conflictState, conflictState) || other.conflictState == conflictState));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,createdAt,updatedAt,version,conflictState);

@override
String toString() {
  return 'SyncEntity(id: $id, createdAt: $createdAt, updatedAt: $updatedAt, version: $version, conflictState: $conflictState)';
}


}

/// @nodoc
abstract mixin class _$SyncEntityCopyWith<$Res> implements $SyncEntityCopyWith<$Res> {
  factory _$SyncEntityCopyWith(_SyncEntity value, $Res Function(_SyncEntity) _then) = __$SyncEntityCopyWithImpl;
@override @useResult
$Res call({
 String id,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'updated_at') String updatedAt, int version,@JsonKey(name: 'conflict_state', unknownEnumValue: ConflictState.ok) ConflictState conflictState
});




}
/// @nodoc
class __$SyncEntityCopyWithImpl<$Res>
    implements _$SyncEntityCopyWith<$Res> {
  __$SyncEntityCopyWithImpl(this._self, this._then);

  final _SyncEntity _self;
  final $Res Function(_SyncEntity) _then;

/// Create a copy of SyncEntity
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? createdAt = null,Object? updatedAt = null,Object? version = null,Object? conflictState = null,}) {
  return _then(_SyncEntity(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,updatedAt: null == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as String,version: null == version ? _self.version : version // ignore: cast_nullable_to_non_nullable
as int,conflictState: null == conflictState ? _self.conflictState : conflictState // ignore: cast_nullable_to_non_nullable
as ConflictState,
  ));
}


}

// dart format on
