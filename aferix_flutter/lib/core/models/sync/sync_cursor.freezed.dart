// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sync_cursor.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$SyncCursor {

@JsonKey(name: 'tenant_id') String get tenantId;@JsonKey(name: 'table_name') String get tableName;@JsonKey(name: 'last_updated_at') String get lastUpdatedAt;@JsonKey(name: 'last_processed_id') String get lastProcessedId;
/// Create a copy of SyncCursor
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SyncCursorCopyWith<SyncCursor> get copyWith => _$SyncCursorCopyWithImpl<SyncCursor>(this as SyncCursor, _$identity);

  /// Serializes this SyncCursor to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SyncCursor&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.tableName, tableName) || other.tableName == tableName)&&(identical(other.lastUpdatedAt, lastUpdatedAt) || other.lastUpdatedAt == lastUpdatedAt)&&(identical(other.lastProcessedId, lastProcessedId) || other.lastProcessedId == lastProcessedId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,tenantId,tableName,lastUpdatedAt,lastProcessedId);

@override
String toString() {
  return 'SyncCursor(tenantId: $tenantId, tableName: $tableName, lastUpdatedAt: $lastUpdatedAt, lastProcessedId: $lastProcessedId)';
}


}

/// @nodoc
abstract mixin class $SyncCursorCopyWith<$Res>  {
  factory $SyncCursorCopyWith(SyncCursor value, $Res Function(SyncCursor) _then) = _$SyncCursorCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'tenant_id') String tenantId,@JsonKey(name: 'table_name') String tableName,@JsonKey(name: 'last_updated_at') String lastUpdatedAt,@JsonKey(name: 'last_processed_id') String lastProcessedId
});




}
/// @nodoc
class _$SyncCursorCopyWithImpl<$Res>
    implements $SyncCursorCopyWith<$Res> {
  _$SyncCursorCopyWithImpl(this._self, this._then);

  final SyncCursor _self;
  final $Res Function(SyncCursor) _then;

/// Create a copy of SyncCursor
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? tenantId = null,Object? tableName = null,Object? lastUpdatedAt = null,Object? lastProcessedId = null,}) {
  return _then(_self.copyWith(
tenantId: null == tenantId ? _self.tenantId : tenantId // ignore: cast_nullable_to_non_nullable
as String,tableName: null == tableName ? _self.tableName : tableName // ignore: cast_nullable_to_non_nullable
as String,lastUpdatedAt: null == lastUpdatedAt ? _self.lastUpdatedAt : lastUpdatedAt // ignore: cast_nullable_to_non_nullable
as String,lastProcessedId: null == lastProcessedId ? _self.lastProcessedId : lastProcessedId // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [SyncCursor].
extension SyncCursorPatterns on SyncCursor {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SyncCursor value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SyncCursor() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SyncCursor value)  $default,){
final _that = this;
switch (_that) {
case _SyncCursor():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SyncCursor value)?  $default,){
final _that = this;
switch (_that) {
case _SyncCursor() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'tenant_id')  String tenantId, @JsonKey(name: 'table_name')  String tableName, @JsonKey(name: 'last_updated_at')  String lastUpdatedAt, @JsonKey(name: 'last_processed_id')  String lastProcessedId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SyncCursor() when $default != null:
return $default(_that.tenantId,_that.tableName,_that.lastUpdatedAt,_that.lastProcessedId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'tenant_id')  String tenantId, @JsonKey(name: 'table_name')  String tableName, @JsonKey(name: 'last_updated_at')  String lastUpdatedAt, @JsonKey(name: 'last_processed_id')  String lastProcessedId)  $default,) {final _that = this;
switch (_that) {
case _SyncCursor():
return $default(_that.tenantId,_that.tableName,_that.lastUpdatedAt,_that.lastProcessedId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'tenant_id')  String tenantId, @JsonKey(name: 'table_name')  String tableName, @JsonKey(name: 'last_updated_at')  String lastUpdatedAt, @JsonKey(name: 'last_processed_id')  String lastProcessedId)?  $default,) {final _that = this;
switch (_that) {
case _SyncCursor() when $default != null:
return $default(_that.tenantId,_that.tableName,_that.lastUpdatedAt,_that.lastProcessedId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SyncCursor extends SyncCursor {
  const _SyncCursor({@JsonKey(name: 'tenant_id') required this.tenantId, @JsonKey(name: 'table_name') required this.tableName, @JsonKey(name: 'last_updated_at') this.lastUpdatedAt = '1970-01-01T00:00:00.000Z', @JsonKey(name: 'last_processed_id') this.lastProcessedId = ''}): super._();
  factory _SyncCursor.fromJson(Map<String, dynamic> json) => _$SyncCursorFromJson(json);

@override@JsonKey(name: 'tenant_id') final  String tenantId;
@override@JsonKey(name: 'table_name') final  String tableName;
@override@JsonKey(name: 'last_updated_at') final  String lastUpdatedAt;
@override@JsonKey(name: 'last_processed_id') final  String lastProcessedId;

/// Create a copy of SyncCursor
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SyncCursorCopyWith<_SyncCursor> get copyWith => __$SyncCursorCopyWithImpl<_SyncCursor>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SyncCursorToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SyncCursor&&(identical(other.tenantId, tenantId) || other.tenantId == tenantId)&&(identical(other.tableName, tableName) || other.tableName == tableName)&&(identical(other.lastUpdatedAt, lastUpdatedAt) || other.lastUpdatedAt == lastUpdatedAt)&&(identical(other.lastProcessedId, lastProcessedId) || other.lastProcessedId == lastProcessedId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,tenantId,tableName,lastUpdatedAt,lastProcessedId);

@override
String toString() {
  return 'SyncCursor(tenantId: $tenantId, tableName: $tableName, lastUpdatedAt: $lastUpdatedAt, lastProcessedId: $lastProcessedId)';
}


}

/// @nodoc
abstract mixin class _$SyncCursorCopyWith<$Res> implements $SyncCursorCopyWith<$Res> {
  factory _$SyncCursorCopyWith(_SyncCursor value, $Res Function(_SyncCursor) _then) = __$SyncCursorCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'tenant_id') String tenantId,@JsonKey(name: 'table_name') String tableName,@JsonKey(name: 'last_updated_at') String lastUpdatedAt,@JsonKey(name: 'last_processed_id') String lastProcessedId
});




}
/// @nodoc
class __$SyncCursorCopyWithImpl<$Res>
    implements _$SyncCursorCopyWith<$Res> {
  __$SyncCursorCopyWithImpl(this._self, this._then);

  final _SyncCursor _self;
  final $Res Function(_SyncCursor) _then;

/// Create a copy of SyncCursor
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? tenantId = null,Object? tableName = null,Object? lastUpdatedAt = null,Object? lastProcessedId = null,}) {
  return _then(_SyncCursor(
tenantId: null == tenantId ? _self.tenantId : tenantId // ignore: cast_nullable_to_non_nullable
as String,tableName: null == tableName ? _self.tableName : tableName // ignore: cast_nullable_to_non_nullable
as String,lastUpdatedAt: null == lastUpdatedAt ? _self.lastUpdatedAt : lastUpdatedAt // ignore: cast_nullable_to_non_nullable
as String,lastProcessedId: null == lastProcessedId ? _self.lastProcessedId : lastProcessedId // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
