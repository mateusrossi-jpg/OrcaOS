// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sync_result.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$SyncResult {

 int get pushed; int get pulled; int get queuedDeadLetters; bool get haltedByAuth; bool get skippedNotConfigured; String? get lastError;
/// Create a copy of SyncResult
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SyncResultCopyWith<SyncResult> get copyWith => _$SyncResultCopyWithImpl<SyncResult>(this as SyncResult, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SyncResult&&(identical(other.pushed, pushed) || other.pushed == pushed)&&(identical(other.pulled, pulled) || other.pulled == pulled)&&(identical(other.queuedDeadLetters, queuedDeadLetters) || other.queuedDeadLetters == queuedDeadLetters)&&(identical(other.haltedByAuth, haltedByAuth) || other.haltedByAuth == haltedByAuth)&&(identical(other.skippedNotConfigured, skippedNotConfigured) || other.skippedNotConfigured == skippedNotConfigured)&&(identical(other.lastError, lastError) || other.lastError == lastError));
}


@override
int get hashCode => Object.hash(runtimeType,pushed,pulled,queuedDeadLetters,haltedByAuth,skippedNotConfigured,lastError);

@override
String toString() {
  return 'SyncResult(pushed: $pushed, pulled: $pulled, queuedDeadLetters: $queuedDeadLetters, haltedByAuth: $haltedByAuth, skippedNotConfigured: $skippedNotConfigured, lastError: $lastError)';
}


}

/// @nodoc
abstract mixin class $SyncResultCopyWith<$Res>  {
  factory $SyncResultCopyWith(SyncResult value, $Res Function(SyncResult) _then) = _$SyncResultCopyWithImpl;
@useResult
$Res call({
 int pushed, int pulled, int queuedDeadLetters, bool haltedByAuth, bool skippedNotConfigured, String? lastError
});




}
/// @nodoc
class _$SyncResultCopyWithImpl<$Res>
    implements $SyncResultCopyWith<$Res> {
  _$SyncResultCopyWithImpl(this._self, this._then);

  final SyncResult _self;
  final $Res Function(SyncResult) _then;

/// Create a copy of SyncResult
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? pushed = null,Object? pulled = null,Object? queuedDeadLetters = null,Object? haltedByAuth = null,Object? skippedNotConfigured = null,Object? lastError = freezed,}) {
  return _then(_self.copyWith(
pushed: null == pushed ? _self.pushed : pushed // ignore: cast_nullable_to_non_nullable
as int,pulled: null == pulled ? _self.pulled : pulled // ignore: cast_nullable_to_non_nullable
as int,queuedDeadLetters: null == queuedDeadLetters ? _self.queuedDeadLetters : queuedDeadLetters // ignore: cast_nullable_to_non_nullable
as int,haltedByAuth: null == haltedByAuth ? _self.haltedByAuth : haltedByAuth // ignore: cast_nullable_to_non_nullable
as bool,skippedNotConfigured: null == skippedNotConfigured ? _self.skippedNotConfigured : skippedNotConfigured // ignore: cast_nullable_to_non_nullable
as bool,lastError: freezed == lastError ? _self.lastError : lastError // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [SyncResult].
extension SyncResultPatterns on SyncResult {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SyncResult value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SyncResult() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SyncResult value)  $default,){
final _that = this;
switch (_that) {
case _SyncResult():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SyncResult value)?  $default,){
final _that = this;
switch (_that) {
case _SyncResult() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int pushed,  int pulled,  int queuedDeadLetters,  bool haltedByAuth,  bool skippedNotConfigured,  String? lastError)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SyncResult() when $default != null:
return $default(_that.pushed,_that.pulled,_that.queuedDeadLetters,_that.haltedByAuth,_that.skippedNotConfigured,_that.lastError);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int pushed,  int pulled,  int queuedDeadLetters,  bool haltedByAuth,  bool skippedNotConfigured,  String? lastError)  $default,) {final _that = this;
switch (_that) {
case _SyncResult():
return $default(_that.pushed,_that.pulled,_that.queuedDeadLetters,_that.haltedByAuth,_that.skippedNotConfigured,_that.lastError);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int pushed,  int pulled,  int queuedDeadLetters,  bool haltedByAuth,  bool skippedNotConfigured,  String? lastError)?  $default,) {final _that = this;
switch (_that) {
case _SyncResult() when $default != null:
return $default(_that.pushed,_that.pulled,_that.queuedDeadLetters,_that.haltedByAuth,_that.skippedNotConfigured,_that.lastError);case _:
  return null;

}
}

}

/// @nodoc


class _SyncResult extends SyncResult {
  const _SyncResult({this.pushed = 0, this.pulled = 0, this.queuedDeadLetters = 0, this.haltedByAuth = false, this.skippedNotConfigured = false, this.lastError = null}): super._();
  

@override@JsonKey() final  int pushed;
@override@JsonKey() final  int pulled;
@override@JsonKey() final  int queuedDeadLetters;
@override@JsonKey() final  bool haltedByAuth;
@override@JsonKey() final  bool skippedNotConfigured;
@override@JsonKey() final  String? lastError;

/// Create a copy of SyncResult
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SyncResultCopyWith<_SyncResult> get copyWith => __$SyncResultCopyWithImpl<_SyncResult>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SyncResult&&(identical(other.pushed, pushed) || other.pushed == pushed)&&(identical(other.pulled, pulled) || other.pulled == pulled)&&(identical(other.queuedDeadLetters, queuedDeadLetters) || other.queuedDeadLetters == queuedDeadLetters)&&(identical(other.haltedByAuth, haltedByAuth) || other.haltedByAuth == haltedByAuth)&&(identical(other.skippedNotConfigured, skippedNotConfigured) || other.skippedNotConfigured == skippedNotConfigured)&&(identical(other.lastError, lastError) || other.lastError == lastError));
}


@override
int get hashCode => Object.hash(runtimeType,pushed,pulled,queuedDeadLetters,haltedByAuth,skippedNotConfigured,lastError);

@override
String toString() {
  return 'SyncResult(pushed: $pushed, pulled: $pulled, queuedDeadLetters: $queuedDeadLetters, haltedByAuth: $haltedByAuth, skippedNotConfigured: $skippedNotConfigured, lastError: $lastError)';
}


}

/// @nodoc
abstract mixin class _$SyncResultCopyWith<$Res> implements $SyncResultCopyWith<$Res> {
  factory _$SyncResultCopyWith(_SyncResult value, $Res Function(_SyncResult) _then) = __$SyncResultCopyWithImpl;
@override @useResult
$Res call({
 int pushed, int pulled, int queuedDeadLetters, bool haltedByAuth, bool skippedNotConfigured, String? lastError
});




}
/// @nodoc
class __$SyncResultCopyWithImpl<$Res>
    implements _$SyncResultCopyWith<$Res> {
  __$SyncResultCopyWithImpl(this._self, this._then);

  final _SyncResult _self;
  final $Res Function(_SyncResult) _then;

/// Create a copy of SyncResult
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? pushed = null,Object? pulled = null,Object? queuedDeadLetters = null,Object? haltedByAuth = null,Object? skippedNotConfigured = null,Object? lastError = freezed,}) {
  return _then(_SyncResult(
pushed: null == pushed ? _self.pushed : pushed // ignore: cast_nullable_to_non_nullable
as int,pulled: null == pulled ? _self.pulled : pulled // ignore: cast_nullable_to_non_nullable
as int,queuedDeadLetters: null == queuedDeadLetters ? _self.queuedDeadLetters : queuedDeadLetters // ignore: cast_nullable_to_non_nullable
as int,haltedByAuth: null == haltedByAuth ? _self.haltedByAuth : haltedByAuth // ignore: cast_nullable_to_non_nullable
as bool,skippedNotConfigured: null == skippedNotConfigured ? _self.skippedNotConfigured : skippedNotConfigured // ignore: cast_nullable_to_non_nullable
as bool,lastError: freezed == lastError ? _self.lastError : lastError // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
