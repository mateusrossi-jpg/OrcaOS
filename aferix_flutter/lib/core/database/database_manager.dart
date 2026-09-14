import 'package:drift/native.dart';
import 'package:drift_flutter/drift_flutter.dart';

import '../error/app_exception.dart';

import 'aferix_database.dart';

/// Isolamento multi-tenant no nível do arquivo de banco (R10).
///
/// Equivalente Flutter de `AferixDB_{companyId}_{userId}` do Dexie
/// (seção 1.1 e RC2). `openForSession` fecha o banco anterior e abre um
/// novo arquivo — quem invalida os providers dependentes é a camada de DI.
class DatabaseManager {
  AferixDatabase? _database;

  AferixDatabase get database {
    final db = _database;
    if (db == null) {
      throw const DatabaseException(
        'Nenhuma base aberta. Chame openForSession() antes.',
      );
    }
    return db;
  }

  bool get isOpen => _database != null;

  /// Abre (ou alterna) o banco isolado por sessão: `aferix_{company}_{user}.db`.
  Future<AferixDatabase> openForSession({
    required String companyId,
    required String userId,
    bool guest = false,
  }) async {
    await close();

    final executor = driftDatabase(
      name: guest
          ? 'aferix_guest'
          : 'aferix_${companyId}_$userId',
    );
    final db = AferixDatabase(executor);
    _database = db;
    return db;
  }

  /// Abre um banco em memória (testes de unidade).
  Future<AferixDatabase> openInMemory() async {
    await close();
    final db = AferixDatabase(NativeDatabase.memory());
    _database = db;
    return db;
  }

  Future<void> close() async {
    final db = _database;
    _database = null;
    if (db != null) {
      await db.close();
    }
  }
}