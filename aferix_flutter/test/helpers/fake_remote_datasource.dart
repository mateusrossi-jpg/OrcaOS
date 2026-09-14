import 'package:aferix_flutter/core/error/app_exception.dart';
import 'package:aferix_flutter/core/models/sync/sync_cursor.dart';
import 'package:aferix_flutter/data/datasources/sync_remote_datasource.dart';

/// Remote fake: registra operações e permite injeção de erros/estado.
class FakeRemoteDataSource implements SyncRemoteDataSource {
  FakeRemoteDataSource({
    this.configured = true,
    Map<String, Map<String, dynamic>>? records,
  }) : records = records ?? {};

  final bool configured;
  final Map<String, Map<String, dynamic>> records;

  final List<String> upserted = [];
  final List<String> deleted = [];
  final List<String> fetchedChangesFor = [];

  Map<String, dynamic>? errorForUpsert;
  Map<String, dynamic>? errorForFetchRecord;
  bool throwAuthOnUpsert = false;
  bool throwSecurityOnUpsert = false;
  bool throwNetworkOnUpsert = false;

  int retryCountOf(String table, String id) =>
      (records['$table:$id']?['version'] as int?) ?? 0;

  @override
  bool get isConfigured => configured;

  void put(String table, Map<String, dynamic> record) {
    records['$table:${record['id']}'] = record;
  }

  @override
  Future<Map<String, dynamic>?> fetchRecord(String table, String id) async {
    if (errorForFetchRecord != null) {
      throw errorForFetchRecord!;
    }
    return records['$table:$id'];
  }

  @override
  Future<List<Map<String, dynamic>>> fetchChanges(
    String table,
    SyncCursor cursor,
  ) async {
    fetchedChangesFor.add(table);
    final all = records.entries
        .where((e) => e.key.startsWith('$table:'))
        .map((e) => e.value)
        .toList();
    all.sort((a, b) {
      final c = (a['updated_at'] as String).compareTo(b['updated_at'] as String);
      if (c != 0) return c;
      return (a['id'] as String).compareTo(b['id'] as String);
    });
    return all.where((r) {
      final u = r['updated_at'] as String;
      final id = r['id'] as String;
      return u.compareTo(cursor.lastUpdatedAt) > 0 ||
          (u == cursor.lastUpdatedAt &&
              id.compareTo(cursor.lastProcessedId) > 0);
    }).toList();
  }

  @override
  Future<void> upsert(String table, Map<String, dynamic> payload) async {
    if (throwAuthOnUpsert) {
      throw const AuthException('401 - refresh_token: invalid', statusCode: 401);
    }
    if (throwSecurityOnUpsert) {
      throw SecurityException('Integridade de tenant violada');
    }
    if (throwNetworkOnUpsert) {
      throw NetworkException('rede indisponível');
    }
    if (errorForUpsert != null) {
      throw errorForUpsert!;
    }
    upserted.add('$table:${payload['id']}');
    put(table, payload);
  }

  @override
  Future<void> delete(String table, String id) async {
    deleted.add('$table:$id');
    throw UnsupportedError('DELETE remoto ainda não exercido nos testes');
  }
}