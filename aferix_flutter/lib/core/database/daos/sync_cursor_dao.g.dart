// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sync_cursor_dao.dart';

// ignore_for_file: type=lint
mixin _$SyncCursorDaoMixin on DatabaseAccessor<AferixDatabase> {
  $SyncCursorsTableTable get syncCursorsTable =>
      attachedDatabase.syncCursorsTable;
  SyncCursorDaoManager get managers => SyncCursorDaoManager(this);
}

class SyncCursorDaoManager {
  final _$SyncCursorDaoMixin _db;
  SyncCursorDaoManager(this._db);
  $$SyncCursorsTableTableTableManager get syncCursorsTable =>
      $$SyncCursorsTableTableTableManager(
        _db.attachedDatabase,
        _db.syncCursorsTable,
      );
}
