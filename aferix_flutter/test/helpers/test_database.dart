import 'package:aferix_flutter/core/database/aferix_database.dart';
import 'package:aferix_flutter/core/database/database_manager.dart';

/// Abre um banco em memória para testes de unidade.
Future<AferixDatabase> openInMemoryDb() async {
  final manager = DatabaseManager();
  return manager.openInMemory();
}

/// Registro helper para criar payloads sincáveis.
Map<String, dynamic> syncableRecord({
  required String id,
  required String updatedAt,
  int version = 1,
  Map<String, dynamic> extra = const {},
}) =>
    {
      'id': id,
      'created_at': '2026-01-01T00:00:00.000Z',
      'updated_at': updatedAt,
      'version': version,
      'conflict_state': 'ok',
      ...extra,
    };