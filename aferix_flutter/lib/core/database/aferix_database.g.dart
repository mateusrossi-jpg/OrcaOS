// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'aferix_database.dart';

// ignore_for_file: type=lint
class $SyncOutboxTableTable extends SyncOutboxTable
    with TableInfo<$SyncOutboxTableTable, SyncOutboxItem> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncOutboxTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _tenantIdMeta = const VerificationMeta(
    'tenantId',
  );
  @override
  late final GeneratedColumn<String> tenantId = GeneratedColumn<String>(
    'tenant_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _userIdMeta = const VerificationMeta('userId');
  @override
  late final GeneratedColumn<String> userId = GeneratedColumn<String>(
    'user_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _tableMeta = const VerificationMeta('table');
  @override
  late final GeneratedColumn<String> table = GeneratedColumn<String>(
    'table_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _recordIdMeta = const VerificationMeta(
    'recordId',
  );
  @override
  late final GeneratedColumn<String> recordId = GeneratedColumn<String>(
    'record_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  late final GeneratedColumnWithTypeConverter<SyncOperation, String> operation =
      GeneratedColumn<String>(
        'operation',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: true,
      ).withConverter<SyncOperation>($SyncOutboxTableTable.$converteroperation);
  static const VerificationMeta _payloadMeta = const VerificationMeta(
    'payload',
  );
  @override
  late final GeneratedColumn<String> payload = GeneratedColumn<String>(
    'payload',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _correlationIdMeta = const VerificationMeta(
    'correlationId',
  );
  @override
  late final GeneratedColumn<String> correlationId = GeneratedColumn<String>(
    'correlation_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _retryCountMeta = const VerificationMeta(
    'retryCount',
  );
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
    'retry_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  @override
  late final GeneratedColumnWithTypeConverter<OutboxStatus, String> status =
      GeneratedColumn<String>(
        'status',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
        defaultValue: const Constant('pending'),
      ).withConverter<OutboxStatus>($SyncOutboxTableTable.$converterstatus);
  static const VerificationMeta _errorCategoryMeta = const VerificationMeta(
    'errorCategory',
  );
  @override
  late final GeneratedColumn<String> errorCategory = GeneratedColumn<String>(
    'error_category',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _lastErrorMeta = const VerificationMeta(
    'lastError',
  );
  @override
  late final GeneratedColumn<String> lastError = GeneratedColumn<String>(
    'last_error',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    tenantId,
    userId,
    table,
    recordId,
    operation,
    payload,
    correlationId,
    createdAt,
    retryCount,
    status,
    errorCategory,
    lastError,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_outbox_table';
  @override
  VerificationContext validateIntegrity(
    Insertable<SyncOutboxItem> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('tenant_id')) {
      context.handle(
        _tenantIdMeta,
        tenantId.isAcceptableOrUnknown(data['tenant_id']!, _tenantIdMeta),
      );
    } else if (isInserting) {
      context.missing(_tenantIdMeta);
    }
    if (data.containsKey('user_id')) {
      context.handle(
        _userIdMeta,
        userId.isAcceptableOrUnknown(data['user_id']!, _userIdMeta),
      );
    } else if (isInserting) {
      context.missing(_userIdMeta);
    }
    if (data.containsKey('table_name')) {
      context.handle(
        _tableMeta,
        table.isAcceptableOrUnknown(data['table_name']!, _tableMeta),
      );
    } else if (isInserting) {
      context.missing(_tableMeta);
    }
    if (data.containsKey('record_id')) {
      context.handle(
        _recordIdMeta,
        recordId.isAcceptableOrUnknown(data['record_id']!, _recordIdMeta),
      );
    } else if (isInserting) {
      context.missing(_recordIdMeta);
    }
    if (data.containsKey('payload')) {
      context.handle(
        _payloadMeta,
        payload.isAcceptableOrUnknown(data['payload']!, _payloadMeta),
      );
    } else if (isInserting) {
      context.missing(_payloadMeta);
    }
    if (data.containsKey('correlation_id')) {
      context.handle(
        _correlationIdMeta,
        correlationId.isAcceptableOrUnknown(
          data['correlation_id']!,
          _correlationIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_correlationIdMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('retry_count')) {
      context.handle(
        _retryCountMeta,
        retryCount.isAcceptableOrUnknown(data['retry_count']!, _retryCountMeta),
      );
    }
    if (data.containsKey('error_category')) {
      context.handle(
        _errorCategoryMeta,
        errorCategory.isAcceptableOrUnknown(
          data['error_category']!,
          _errorCategoryMeta,
        ),
      );
    }
    if (data.containsKey('last_error')) {
      context.handle(
        _lastErrorMeta,
        lastError.isAcceptableOrUnknown(data['last_error']!, _lastErrorMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  List<Set<GeneratedColumn>> get uniqueKeys => [
    {correlationId},
  ];
  @override
  SyncOutboxItem map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncOutboxItem(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      tenantId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}tenant_id'],
      )!,
      userId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}user_id'],
      )!,
      table: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}table_name'],
      )!,
      recordId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}record_id'],
      )!,
      operation: $SyncOutboxTableTable.$converteroperation.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}operation'],
        )!,
      ),
      payload: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payload'],
      )!,
      correlationId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}correlation_id'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      retryCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}retry_count'],
      )!,
      status: $SyncOutboxTableTable.$converterstatus.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}status'],
        )!,
      ),
      errorCategory: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}error_category'],
      ),
      lastError: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}last_error'],
      ),
    );
  }

  @override
  $SyncOutboxTableTable createAlias(String alias) {
    return $SyncOutboxTableTable(attachedDatabase, alias);
  }

  static JsonTypeConverter2<SyncOperation, String, String> $converteroperation =
      const EnumNameConverter<SyncOperation>(SyncOperation.values);
  static JsonTypeConverter2<OutboxStatus, String, String> $converterstatus =
      const EnumNameConverter<OutboxStatus>(OutboxStatus.values);
}

class SyncOutboxItem extends DataClass implements Insertable<SyncOutboxItem> {
  final String id;
  final String tenantId;
  final String userId;
  final String table;
  final String recordId;
  final SyncOperation operation;
  final String payload;
  final String correlationId;
  final String createdAt;
  final int retryCount;
  final OutboxStatus status;
  final String? errorCategory;
  final String? lastError;
  const SyncOutboxItem({
    required this.id,
    required this.tenantId,
    required this.userId,
    required this.table,
    required this.recordId,
    required this.operation,
    required this.payload,
    required this.correlationId,
    required this.createdAt,
    required this.retryCount,
    required this.status,
    this.errorCategory,
    this.lastError,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['tenant_id'] = Variable<String>(tenantId);
    map['user_id'] = Variable<String>(userId);
    map['table_name'] = Variable<String>(table);
    map['record_id'] = Variable<String>(recordId);
    {
      map['operation'] = Variable<String>(
        $SyncOutboxTableTable.$converteroperation.toSql(operation),
      );
    }
    map['payload'] = Variable<String>(payload);
    map['correlation_id'] = Variable<String>(correlationId);
    map['created_at'] = Variable<String>(createdAt);
    map['retry_count'] = Variable<int>(retryCount);
    {
      map['status'] = Variable<String>(
        $SyncOutboxTableTable.$converterstatus.toSql(status),
      );
    }
    if (!nullToAbsent || errorCategory != null) {
      map['error_category'] = Variable<String>(errorCategory);
    }
    if (!nullToAbsent || lastError != null) {
      map['last_error'] = Variable<String>(lastError);
    }
    return map;
  }

  SyncOutboxTableCompanion toCompanion(bool nullToAbsent) {
    return SyncOutboxTableCompanion(
      id: Value(id),
      tenantId: Value(tenantId),
      userId: Value(userId),
      table: Value(table),
      recordId: Value(recordId),
      operation: Value(operation),
      payload: Value(payload),
      correlationId: Value(correlationId),
      createdAt: Value(createdAt),
      retryCount: Value(retryCount),
      status: Value(status),
      errorCategory: errorCategory == null && nullToAbsent
          ? const Value.absent()
          : Value(errorCategory),
      lastError: lastError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastError),
    );
  }

  factory SyncOutboxItem.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncOutboxItem(
      id: serializer.fromJson<String>(json['id']),
      tenantId: serializer.fromJson<String>(json['tenantId']),
      userId: serializer.fromJson<String>(json['userId']),
      table: serializer.fromJson<String>(json['table']),
      recordId: serializer.fromJson<String>(json['recordId']),
      operation: $SyncOutboxTableTable.$converteroperation.fromJson(
        serializer.fromJson<String>(json['operation']),
      ),
      payload: serializer.fromJson<String>(json['payload']),
      correlationId: serializer.fromJson<String>(json['correlationId']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
      status: $SyncOutboxTableTable.$converterstatus.fromJson(
        serializer.fromJson<String>(json['status']),
      ),
      errorCategory: serializer.fromJson<String?>(json['errorCategory']),
      lastError: serializer.fromJson<String?>(json['lastError']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'tenantId': serializer.toJson<String>(tenantId),
      'userId': serializer.toJson<String>(userId),
      'table': serializer.toJson<String>(table),
      'recordId': serializer.toJson<String>(recordId),
      'operation': serializer.toJson<String>(
        $SyncOutboxTableTable.$converteroperation.toJson(operation),
      ),
      'payload': serializer.toJson<String>(payload),
      'correlationId': serializer.toJson<String>(correlationId),
      'createdAt': serializer.toJson<String>(createdAt),
      'retryCount': serializer.toJson<int>(retryCount),
      'status': serializer.toJson<String>(
        $SyncOutboxTableTable.$converterstatus.toJson(status),
      ),
      'errorCategory': serializer.toJson<String?>(errorCategory),
      'lastError': serializer.toJson<String?>(lastError),
    };
  }

  SyncOutboxItem copyWith({
    String? id,
    String? tenantId,
    String? userId,
    String? table,
    String? recordId,
    SyncOperation? operation,
    String? payload,
    String? correlationId,
    String? createdAt,
    int? retryCount,
    OutboxStatus? status,
    Value<String?> errorCategory = const Value.absent(),
    Value<String?> lastError = const Value.absent(),
  }) => SyncOutboxItem(
    id: id ?? this.id,
    tenantId: tenantId ?? this.tenantId,
    userId: userId ?? this.userId,
    table: table ?? this.table,
    recordId: recordId ?? this.recordId,
    operation: operation ?? this.operation,
    payload: payload ?? this.payload,
    correlationId: correlationId ?? this.correlationId,
    createdAt: createdAt ?? this.createdAt,
    retryCount: retryCount ?? this.retryCount,
    status: status ?? this.status,
    errorCategory: errorCategory.present
        ? errorCategory.value
        : this.errorCategory,
    lastError: lastError.present ? lastError.value : this.lastError,
  );
  SyncOutboxItem copyWithCompanion(SyncOutboxTableCompanion data) {
    return SyncOutboxItem(
      id: data.id.present ? data.id.value : this.id,
      tenantId: data.tenantId.present ? data.tenantId.value : this.tenantId,
      userId: data.userId.present ? data.userId.value : this.userId,
      table: data.table.present ? data.table.value : this.table,
      recordId: data.recordId.present ? data.recordId.value : this.recordId,
      operation: data.operation.present ? data.operation.value : this.operation,
      payload: data.payload.present ? data.payload.value : this.payload,
      correlationId: data.correlationId.present
          ? data.correlationId.value
          : this.correlationId,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      retryCount: data.retryCount.present
          ? data.retryCount.value
          : this.retryCount,
      status: data.status.present ? data.status.value : this.status,
      errorCategory: data.errorCategory.present
          ? data.errorCategory.value
          : this.errorCategory,
      lastError: data.lastError.present ? data.lastError.value : this.lastError,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncOutboxItem(')
          ..write('id: $id, ')
          ..write('tenantId: $tenantId, ')
          ..write('userId: $userId, ')
          ..write('table: $table, ')
          ..write('recordId: $recordId, ')
          ..write('operation: $operation, ')
          ..write('payload: $payload, ')
          ..write('correlationId: $correlationId, ')
          ..write('createdAt: $createdAt, ')
          ..write('retryCount: $retryCount, ')
          ..write('status: $status, ')
          ..write('errorCategory: $errorCategory, ')
          ..write('lastError: $lastError')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    tenantId,
    userId,
    table,
    recordId,
    operation,
    payload,
    correlationId,
    createdAt,
    retryCount,
    status,
    errorCategory,
    lastError,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncOutboxItem &&
          other.id == this.id &&
          other.tenantId == this.tenantId &&
          other.userId == this.userId &&
          other.table == this.table &&
          other.recordId == this.recordId &&
          other.operation == this.operation &&
          other.payload == this.payload &&
          other.correlationId == this.correlationId &&
          other.createdAt == this.createdAt &&
          other.retryCount == this.retryCount &&
          other.status == this.status &&
          other.errorCategory == this.errorCategory &&
          other.lastError == this.lastError);
}

class SyncOutboxTableCompanion extends UpdateCompanion<SyncOutboxItem> {
  final Value<String> id;
  final Value<String> tenantId;
  final Value<String> userId;
  final Value<String> table;
  final Value<String> recordId;
  final Value<SyncOperation> operation;
  final Value<String> payload;
  final Value<String> correlationId;
  final Value<String> createdAt;
  final Value<int> retryCount;
  final Value<OutboxStatus> status;
  final Value<String?> errorCategory;
  final Value<String?> lastError;
  final Value<int> rowid;
  const SyncOutboxTableCompanion({
    this.id = const Value.absent(),
    this.tenantId = const Value.absent(),
    this.userId = const Value.absent(),
    this.table = const Value.absent(),
    this.recordId = const Value.absent(),
    this.operation = const Value.absent(),
    this.payload = const Value.absent(),
    this.correlationId = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.status = const Value.absent(),
    this.errorCategory = const Value.absent(),
    this.lastError = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncOutboxTableCompanion.insert({
    required String id,
    required String tenantId,
    required String userId,
    required String table,
    required String recordId,
    required SyncOperation operation,
    required String payload,
    required String correlationId,
    required String createdAt,
    this.retryCount = const Value.absent(),
    this.status = const Value.absent(),
    this.errorCategory = const Value.absent(),
    this.lastError = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       tenantId = Value(tenantId),
       userId = Value(userId),
       table = Value(table),
       recordId = Value(recordId),
       operation = Value(operation),
       payload = Value(payload),
       correlationId = Value(correlationId),
       createdAt = Value(createdAt);
  static Insertable<SyncOutboxItem> custom({
    Expression<String>? id,
    Expression<String>? tenantId,
    Expression<String>? userId,
    Expression<String>? table,
    Expression<String>? recordId,
    Expression<String>? operation,
    Expression<String>? payload,
    Expression<String>? correlationId,
    Expression<String>? createdAt,
    Expression<int>? retryCount,
    Expression<String>? status,
    Expression<String>? errorCategory,
    Expression<String>? lastError,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (tenantId != null) 'tenant_id': tenantId,
      if (userId != null) 'user_id': userId,
      if (table != null) 'table_name': table,
      if (recordId != null) 'record_id': recordId,
      if (operation != null) 'operation': operation,
      if (payload != null) 'payload': payload,
      if (correlationId != null) 'correlation_id': correlationId,
      if (createdAt != null) 'created_at': createdAt,
      if (retryCount != null) 'retry_count': retryCount,
      if (status != null) 'status': status,
      if (errorCategory != null) 'error_category': errorCategory,
      if (lastError != null) 'last_error': lastError,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncOutboxTableCompanion copyWith({
    Value<String>? id,
    Value<String>? tenantId,
    Value<String>? userId,
    Value<String>? table,
    Value<String>? recordId,
    Value<SyncOperation>? operation,
    Value<String>? payload,
    Value<String>? correlationId,
    Value<String>? createdAt,
    Value<int>? retryCount,
    Value<OutboxStatus>? status,
    Value<String?>? errorCategory,
    Value<String?>? lastError,
    Value<int>? rowid,
  }) {
    return SyncOutboxTableCompanion(
      id: id ?? this.id,
      tenantId: tenantId ?? this.tenantId,
      userId: userId ?? this.userId,
      table: table ?? this.table,
      recordId: recordId ?? this.recordId,
      operation: operation ?? this.operation,
      payload: payload ?? this.payload,
      correlationId: correlationId ?? this.correlationId,
      createdAt: createdAt ?? this.createdAt,
      retryCount: retryCount ?? this.retryCount,
      status: status ?? this.status,
      errorCategory: errorCategory ?? this.errorCategory,
      lastError: lastError ?? this.lastError,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (tenantId.present) {
      map['tenant_id'] = Variable<String>(tenantId.value);
    }
    if (userId.present) {
      map['user_id'] = Variable<String>(userId.value);
    }
    if (table.present) {
      map['table_name'] = Variable<String>(table.value);
    }
    if (recordId.present) {
      map['record_id'] = Variable<String>(recordId.value);
    }
    if (operation.present) {
      map['operation'] = Variable<String>(
        $SyncOutboxTableTable.$converteroperation.toSql(operation.value),
      );
    }
    if (payload.present) {
      map['payload'] = Variable<String>(payload.value);
    }
    if (correlationId.present) {
      map['correlation_id'] = Variable<String>(correlationId.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(
        $SyncOutboxTableTable.$converterstatus.toSql(status.value),
      );
    }
    if (errorCategory.present) {
      map['error_category'] = Variable<String>(errorCategory.value);
    }
    if (lastError.present) {
      map['last_error'] = Variable<String>(lastError.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncOutboxTableCompanion(')
          ..write('id: $id, ')
          ..write('tenantId: $tenantId, ')
          ..write('userId: $userId, ')
          ..write('table: $table, ')
          ..write('recordId: $recordId, ')
          ..write('operation: $operation, ')
          ..write('payload: $payload, ')
          ..write('correlationId: $correlationId, ')
          ..write('createdAt: $createdAt, ')
          ..write('retryCount: $retryCount, ')
          ..write('status: $status, ')
          ..write('errorCategory: $errorCategory, ')
          ..write('lastError: $lastError, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SyncCursorsTableTable extends SyncCursorsTable
    with TableInfo<$SyncCursorsTableTable, SyncCursorTableRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncCursorsTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _tenantIdMeta = const VerificationMeta(
    'tenantId',
  );
  @override
  late final GeneratedColumn<String> tenantId = GeneratedColumn<String>(
    'tenant_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _tableMeta = const VerificationMeta('table');
  @override
  late final GeneratedColumn<String> table = GeneratedColumn<String>(
    'table_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lastUpdatedAtMeta = const VerificationMeta(
    'lastUpdatedAt',
  );
  @override
  late final GeneratedColumn<String> lastUpdatedAt = GeneratedColumn<String>(
    'last_updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lastProcessedIdMeta = const VerificationMeta(
    'lastProcessedId',
  );
  @override
  late final GeneratedColumn<String> lastProcessedId = GeneratedColumn<String>(
    'last_processed_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant(''),
  );
  @override
  List<GeneratedColumn> get $columns => [
    tenantId,
    table,
    lastUpdatedAt,
    lastProcessedId,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_cursors_table';
  @override
  VerificationContext validateIntegrity(
    Insertable<SyncCursorTableRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('tenant_id')) {
      context.handle(
        _tenantIdMeta,
        tenantId.isAcceptableOrUnknown(data['tenant_id']!, _tenantIdMeta),
      );
    } else if (isInserting) {
      context.missing(_tenantIdMeta);
    }
    if (data.containsKey('table_name')) {
      context.handle(
        _tableMeta,
        table.isAcceptableOrUnknown(data['table_name']!, _tableMeta),
      );
    } else if (isInserting) {
      context.missing(_tableMeta);
    }
    if (data.containsKey('last_updated_at')) {
      context.handle(
        _lastUpdatedAtMeta,
        lastUpdatedAt.isAcceptableOrUnknown(
          data['last_updated_at']!,
          _lastUpdatedAtMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_lastUpdatedAtMeta);
    }
    if (data.containsKey('last_processed_id')) {
      context.handle(
        _lastProcessedIdMeta,
        lastProcessedId.isAcceptableOrUnknown(
          data['last_processed_id']!,
          _lastProcessedIdMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {tenantId, table};
  @override
  SyncCursorTableRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncCursorTableRow(
      tenantId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}tenant_id'],
      )!,
      table: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}table_name'],
      )!,
      lastUpdatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}last_updated_at'],
      )!,
      lastProcessedId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}last_processed_id'],
      )!,
    );
  }

  @override
  $SyncCursorsTableTable createAlias(String alias) {
    return $SyncCursorsTableTable(attachedDatabase, alias);
  }
}

class SyncCursorTableRow extends DataClass
    implements Insertable<SyncCursorTableRow> {
  final String tenantId;
  final String table;
  final String lastUpdatedAt;
  final String lastProcessedId;
  const SyncCursorTableRow({
    required this.tenantId,
    required this.table,
    required this.lastUpdatedAt,
    required this.lastProcessedId,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['tenant_id'] = Variable<String>(tenantId);
    map['table_name'] = Variable<String>(table);
    map['last_updated_at'] = Variable<String>(lastUpdatedAt);
    map['last_processed_id'] = Variable<String>(lastProcessedId);
    return map;
  }

  SyncCursorsTableCompanion toCompanion(bool nullToAbsent) {
    return SyncCursorsTableCompanion(
      tenantId: Value(tenantId),
      table: Value(table),
      lastUpdatedAt: Value(lastUpdatedAt),
      lastProcessedId: Value(lastProcessedId),
    );
  }

  factory SyncCursorTableRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncCursorTableRow(
      tenantId: serializer.fromJson<String>(json['tenantId']),
      table: serializer.fromJson<String>(json['table']),
      lastUpdatedAt: serializer.fromJson<String>(json['lastUpdatedAt']),
      lastProcessedId: serializer.fromJson<String>(json['lastProcessedId']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'tenantId': serializer.toJson<String>(tenantId),
      'table': serializer.toJson<String>(table),
      'lastUpdatedAt': serializer.toJson<String>(lastUpdatedAt),
      'lastProcessedId': serializer.toJson<String>(lastProcessedId),
    };
  }

  SyncCursorTableRow copyWith({
    String? tenantId,
    String? table,
    String? lastUpdatedAt,
    String? lastProcessedId,
  }) => SyncCursorTableRow(
    tenantId: tenantId ?? this.tenantId,
    table: table ?? this.table,
    lastUpdatedAt: lastUpdatedAt ?? this.lastUpdatedAt,
    lastProcessedId: lastProcessedId ?? this.lastProcessedId,
  );
  SyncCursorTableRow copyWithCompanion(SyncCursorsTableCompanion data) {
    return SyncCursorTableRow(
      tenantId: data.tenantId.present ? data.tenantId.value : this.tenantId,
      table: data.table.present ? data.table.value : this.table,
      lastUpdatedAt: data.lastUpdatedAt.present
          ? data.lastUpdatedAt.value
          : this.lastUpdatedAt,
      lastProcessedId: data.lastProcessedId.present
          ? data.lastProcessedId.value
          : this.lastProcessedId,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncCursorTableRow(')
          ..write('tenantId: $tenantId, ')
          ..write('table: $table, ')
          ..write('lastUpdatedAt: $lastUpdatedAt, ')
          ..write('lastProcessedId: $lastProcessedId')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(tenantId, table, lastUpdatedAt, lastProcessedId);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncCursorTableRow &&
          other.tenantId == this.tenantId &&
          other.table == this.table &&
          other.lastUpdatedAt == this.lastUpdatedAt &&
          other.lastProcessedId == this.lastProcessedId);
}

class SyncCursorsTableCompanion extends UpdateCompanion<SyncCursorTableRow> {
  final Value<String> tenantId;
  final Value<String> table;
  final Value<String> lastUpdatedAt;
  final Value<String> lastProcessedId;
  final Value<int> rowid;
  const SyncCursorsTableCompanion({
    this.tenantId = const Value.absent(),
    this.table = const Value.absent(),
    this.lastUpdatedAt = const Value.absent(),
    this.lastProcessedId = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncCursorsTableCompanion.insert({
    required String tenantId,
    required String table,
    required String lastUpdatedAt,
    this.lastProcessedId = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : tenantId = Value(tenantId),
       table = Value(table),
       lastUpdatedAt = Value(lastUpdatedAt);
  static Insertable<SyncCursorTableRow> custom({
    Expression<String>? tenantId,
    Expression<String>? table,
    Expression<String>? lastUpdatedAt,
    Expression<String>? lastProcessedId,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (tenantId != null) 'tenant_id': tenantId,
      if (table != null) 'table_name': table,
      if (lastUpdatedAt != null) 'last_updated_at': lastUpdatedAt,
      if (lastProcessedId != null) 'last_processed_id': lastProcessedId,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncCursorsTableCompanion copyWith({
    Value<String>? tenantId,
    Value<String>? table,
    Value<String>? lastUpdatedAt,
    Value<String>? lastProcessedId,
    Value<int>? rowid,
  }) {
    return SyncCursorsTableCompanion(
      tenantId: tenantId ?? this.tenantId,
      table: table ?? this.table,
      lastUpdatedAt: lastUpdatedAt ?? this.lastUpdatedAt,
      lastProcessedId: lastProcessedId ?? this.lastProcessedId,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (tenantId.present) {
      map['tenant_id'] = Variable<String>(tenantId.value);
    }
    if (table.present) {
      map['table_name'] = Variable<String>(table.value);
    }
    if (lastUpdatedAt.present) {
      map['last_updated_at'] = Variable<String>(lastUpdatedAt.value);
    }
    if (lastProcessedId.present) {
      map['last_processed_id'] = Variable<String>(lastProcessedId.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncCursorsTableCompanion(')
          ..write('tenantId: $tenantId, ')
          ..write('table: $table, ')
          ..write('lastUpdatedAt: $lastUpdatedAt, ')
          ..write('lastProcessedId: $lastProcessedId, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AferixDatabase extends GeneratedDatabase {
  _$AferixDatabase(QueryExecutor e) : super(e);
  $AferixDatabaseManager get managers => $AferixDatabaseManager(this);
  late final $SyncOutboxTableTable syncOutboxTable = $SyncOutboxTableTable(
    this,
  );
  late final $SyncCursorsTableTable syncCursorsTable = $SyncCursorsTableTable(
    this,
  );
  late final OutboxDao outboxDao = OutboxDao(this as AferixDatabase);
  late final SyncCursorDao syncCursorDao = SyncCursorDao(
    this as AferixDatabase,
  );
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    syncOutboxTable,
    syncCursorsTable,
  ];
}

typedef $$SyncOutboxTableTableCreateCompanionBuilder =
    SyncOutboxTableCompanion Function({
      required String id,
      required String tenantId,
      required String userId,
      required String table,
      required String recordId,
      required SyncOperation operation,
      required String payload,
      required String correlationId,
      required String createdAt,
      Value<int> retryCount,
      Value<OutboxStatus> status,
      Value<String?> errorCategory,
      Value<String?> lastError,
      Value<int> rowid,
    });
typedef $$SyncOutboxTableTableUpdateCompanionBuilder =
    SyncOutboxTableCompanion Function({
      Value<String> id,
      Value<String> tenantId,
      Value<String> userId,
      Value<String> table,
      Value<String> recordId,
      Value<SyncOperation> operation,
      Value<String> payload,
      Value<String> correlationId,
      Value<String> createdAt,
      Value<int> retryCount,
      Value<OutboxStatus> status,
      Value<String?> errorCategory,
      Value<String?> lastError,
      Value<int> rowid,
    });

class $$SyncOutboxTableTableFilterComposer
    extends Composer<_$AferixDatabase, $SyncOutboxTableTable> {
  $$SyncOutboxTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get tenantId => $composableBuilder(
    column: $table.tenantId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get userId => $composableBuilder(
    column: $table.userId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get table => $composableBuilder(
    column: $table.table,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get recordId => $composableBuilder(
    column: $table.recordId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnWithTypeConverterFilters<SyncOperation, SyncOperation, String>
  get operation => $composableBuilder(
    column: $table.operation,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnFilters<String> get payload => $composableBuilder(
    column: $table.payload,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get correlationId => $composableBuilder(
    column: $table.correlationId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnWithTypeConverterFilters<OutboxStatus, OutboxStatus, String>
  get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnFilters<String> get errorCategory => $composableBuilder(
    column: $table.errorCategory,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get lastError => $composableBuilder(
    column: $table.lastError,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SyncOutboxTableTableOrderingComposer
    extends Composer<_$AferixDatabase, $SyncOutboxTableTable> {
  $$SyncOutboxTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get tenantId => $composableBuilder(
    column: $table.tenantId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get userId => $composableBuilder(
    column: $table.userId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get table => $composableBuilder(
    column: $table.table,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get recordId => $composableBuilder(
    column: $table.recordId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get operation => $composableBuilder(
    column: $table.operation,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get payload => $composableBuilder(
    column: $table.payload,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get correlationId => $composableBuilder(
    column: $table.correlationId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get errorCategory => $composableBuilder(
    column: $table.errorCategory,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get lastError => $composableBuilder(
    column: $table.lastError,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SyncOutboxTableTableAnnotationComposer
    extends Composer<_$AferixDatabase, $SyncOutboxTableTable> {
  $$SyncOutboxTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get tenantId =>
      $composableBuilder(column: $table.tenantId, builder: (column) => column);

  GeneratedColumn<String> get userId =>
      $composableBuilder(column: $table.userId, builder: (column) => column);

  GeneratedColumn<String> get table =>
      $composableBuilder(column: $table.table, builder: (column) => column);

  GeneratedColumn<String> get recordId =>
      $composableBuilder(column: $table.recordId, builder: (column) => column);

  GeneratedColumnWithTypeConverter<SyncOperation, String> get operation =>
      $composableBuilder(column: $table.operation, builder: (column) => column);

  GeneratedColumn<String> get payload =>
      $composableBuilder(column: $table.payload, builder: (column) => column);

  GeneratedColumn<String> get correlationId => $composableBuilder(
    column: $table.correlationId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => column,
  );

  GeneratedColumnWithTypeConverter<OutboxStatus, String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get errorCategory => $composableBuilder(
    column: $table.errorCategory,
    builder: (column) => column,
  );

  GeneratedColumn<String> get lastError =>
      $composableBuilder(column: $table.lastError, builder: (column) => column);
}

class $$SyncOutboxTableTableTableManager
    extends
        RootTableManager<
          _$AferixDatabase,
          $SyncOutboxTableTable,
          SyncOutboxItem,
          $$SyncOutboxTableTableFilterComposer,
          $$SyncOutboxTableTableOrderingComposer,
          $$SyncOutboxTableTableAnnotationComposer,
          $$SyncOutboxTableTableCreateCompanionBuilder,
          $$SyncOutboxTableTableUpdateCompanionBuilder,
          (
            SyncOutboxItem,
            BaseReferences<
              _$AferixDatabase,
              $SyncOutboxTableTable,
              SyncOutboxItem
            >,
          ),
          SyncOutboxItem,
          PrefetchHooks Function()
        > {
  $$SyncOutboxTableTableTableManager(
    _$AferixDatabase db,
    $SyncOutboxTableTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncOutboxTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncOutboxTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncOutboxTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> tenantId = const Value.absent(),
                Value<String> userId = const Value.absent(),
                Value<String> table = const Value.absent(),
                Value<String> recordId = const Value.absent(),
                Value<SyncOperation> operation = const Value.absent(),
                Value<String> payload = const Value.absent(),
                Value<String> correlationId = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<int> retryCount = const Value.absent(),
                Value<OutboxStatus> status = const Value.absent(),
                Value<String?> errorCategory = const Value.absent(),
                Value<String?> lastError = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncOutboxTableCompanion(
                id: id,
                tenantId: tenantId,
                userId: userId,
                table: table,
                recordId: recordId,
                operation: operation,
                payload: payload,
                correlationId: correlationId,
                createdAt: createdAt,
                retryCount: retryCount,
                status: status,
                errorCategory: errorCategory,
                lastError: lastError,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String tenantId,
                required String userId,
                required String table,
                required String recordId,
                required SyncOperation operation,
                required String payload,
                required String correlationId,
                required String createdAt,
                Value<int> retryCount = const Value.absent(),
                Value<OutboxStatus> status = const Value.absent(),
                Value<String?> errorCategory = const Value.absent(),
                Value<String?> lastError = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncOutboxTableCompanion.insert(
                id: id,
                tenantId: tenantId,
                userId: userId,
                table: table,
                recordId: recordId,
                operation: operation,
                payload: payload,
                correlationId: correlationId,
                createdAt: createdAt,
                retryCount: retryCount,
                status: status,
                errorCategory: errorCategory,
                lastError: lastError,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SyncOutboxTableTableProcessedTableManager =
    ProcessedTableManager<
      _$AferixDatabase,
      $SyncOutboxTableTable,
      SyncOutboxItem,
      $$SyncOutboxTableTableFilterComposer,
      $$SyncOutboxTableTableOrderingComposer,
      $$SyncOutboxTableTableAnnotationComposer,
      $$SyncOutboxTableTableCreateCompanionBuilder,
      $$SyncOutboxTableTableUpdateCompanionBuilder,
      (
        SyncOutboxItem,
        BaseReferences<_$AferixDatabase, $SyncOutboxTableTable, SyncOutboxItem>,
      ),
      SyncOutboxItem,
      PrefetchHooks Function()
    >;
typedef $$SyncCursorsTableTableCreateCompanionBuilder =
    SyncCursorsTableCompanion Function({
      required String tenantId,
      required String table,
      required String lastUpdatedAt,
      Value<String> lastProcessedId,
      Value<int> rowid,
    });
typedef $$SyncCursorsTableTableUpdateCompanionBuilder =
    SyncCursorsTableCompanion Function({
      Value<String> tenantId,
      Value<String> table,
      Value<String> lastUpdatedAt,
      Value<String> lastProcessedId,
      Value<int> rowid,
    });

class $$SyncCursorsTableTableFilterComposer
    extends Composer<_$AferixDatabase, $SyncCursorsTableTable> {
  $$SyncCursorsTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get tenantId => $composableBuilder(
    column: $table.tenantId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get table => $composableBuilder(
    column: $table.table,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get lastUpdatedAt => $composableBuilder(
    column: $table.lastUpdatedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get lastProcessedId => $composableBuilder(
    column: $table.lastProcessedId,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SyncCursorsTableTableOrderingComposer
    extends Composer<_$AferixDatabase, $SyncCursorsTableTable> {
  $$SyncCursorsTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get tenantId => $composableBuilder(
    column: $table.tenantId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get table => $composableBuilder(
    column: $table.table,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get lastUpdatedAt => $composableBuilder(
    column: $table.lastUpdatedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get lastProcessedId => $composableBuilder(
    column: $table.lastProcessedId,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SyncCursorsTableTableAnnotationComposer
    extends Composer<_$AferixDatabase, $SyncCursorsTableTable> {
  $$SyncCursorsTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get tenantId =>
      $composableBuilder(column: $table.tenantId, builder: (column) => column);

  GeneratedColumn<String> get table =>
      $composableBuilder(column: $table.table, builder: (column) => column);

  GeneratedColumn<String> get lastUpdatedAt => $composableBuilder(
    column: $table.lastUpdatedAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get lastProcessedId => $composableBuilder(
    column: $table.lastProcessedId,
    builder: (column) => column,
  );
}

class $$SyncCursorsTableTableTableManager
    extends
        RootTableManager<
          _$AferixDatabase,
          $SyncCursorsTableTable,
          SyncCursorTableRow,
          $$SyncCursorsTableTableFilterComposer,
          $$SyncCursorsTableTableOrderingComposer,
          $$SyncCursorsTableTableAnnotationComposer,
          $$SyncCursorsTableTableCreateCompanionBuilder,
          $$SyncCursorsTableTableUpdateCompanionBuilder,
          (
            SyncCursorTableRow,
            BaseReferences<
              _$AferixDatabase,
              $SyncCursorsTableTable,
              SyncCursorTableRow
            >,
          ),
          SyncCursorTableRow,
          PrefetchHooks Function()
        > {
  $$SyncCursorsTableTableTableManager(
    _$AferixDatabase db,
    $SyncCursorsTableTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncCursorsTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncCursorsTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncCursorsTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> tenantId = const Value.absent(),
                Value<String> table = const Value.absent(),
                Value<String> lastUpdatedAt = const Value.absent(),
                Value<String> lastProcessedId = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncCursorsTableCompanion(
                tenantId: tenantId,
                table: table,
                lastUpdatedAt: lastUpdatedAt,
                lastProcessedId: lastProcessedId,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String tenantId,
                required String table,
                required String lastUpdatedAt,
                Value<String> lastProcessedId = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncCursorsTableCompanion.insert(
                tenantId: tenantId,
                table: table,
                lastUpdatedAt: lastUpdatedAt,
                lastProcessedId: lastProcessedId,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SyncCursorsTableTableProcessedTableManager =
    ProcessedTableManager<
      _$AferixDatabase,
      $SyncCursorsTableTable,
      SyncCursorTableRow,
      $$SyncCursorsTableTableFilterComposer,
      $$SyncCursorsTableTableOrderingComposer,
      $$SyncCursorsTableTableAnnotationComposer,
      $$SyncCursorsTableTableCreateCompanionBuilder,
      $$SyncCursorsTableTableUpdateCompanionBuilder,
      (
        SyncCursorTableRow,
        BaseReferences<
          _$AferixDatabase,
          $SyncCursorsTableTable,
          SyncCursorTableRow
        >,
      ),
      SyncCursorTableRow,
      PrefetchHooks Function()
    >;

class $AferixDatabaseManager {
  final _$AferixDatabase _db;
  $AferixDatabaseManager(this._db);
  $$SyncOutboxTableTableTableManager get syncOutboxTable =>
      $$SyncOutboxTableTableTableManager(_db, _db.syncOutboxTable);
  $$SyncCursorsTableTableTableManager get syncCursorsTable =>
      $$SyncCursorsTableTableTableManager(_db, _db.syncCursorsTable);
}
