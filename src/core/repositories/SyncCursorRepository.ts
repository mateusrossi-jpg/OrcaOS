import { db } from '../database/db';
import type { SyncCursor } from '../database/schema';

export class SyncCursorRepository {
  static async getCursor(tenantId: string, tableName: string): Promise<SyncCursor | null> {
    const id = `${tenantId}_${tableName}`;
    return await db.sync_cursors.get(id) || null;
  }

  static async saveCursor(cursor: Omit<SyncCursor, 'updated_at' | 'id'>): Promise<void> {
    const id = `${cursor.tenant_id}_${cursor.table_name}`;
    await db.sync_cursors.put({
      ...cursor,
      id,
      updated_at: new Date().toISOString()
    });
  }

  static async saveCursorTx(
    tx: any,
    cursor: Omit<SyncCursor, 'updated_at' | 'id'>
  ): Promise<void> {
    const id = `${cursor.tenant_id}_${cursor.table_name}`;
    await tx.table('sync_cursors').put({
      ...cursor,
      id,
      updated_at: new Date().toISOString()
    });
  }
}
