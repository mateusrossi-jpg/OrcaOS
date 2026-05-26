import { db } from '../storage/dexieDatabase';
import { SimpleFinanceRecord } from '../domain/finance';
import { SimpleFinanceRepository } from './simpleFinanceRepository';

export class DexieSimpleFinanceRepository implements SimpleFinanceRepository {
  async createRecord(record: SimpleFinanceRecord): Promise<void> {
    await db.simpleFinanceRecords.add(record);
  }

  async updateRecord(record: SimpleFinanceRecord): Promise<void> {
    await db.simpleFinanceRecords.put(record);
  }

  async listRecords(): Promise<SimpleFinanceRecord[]> {
    return await db.simpleFinanceRecords.toArray();
  }

  async getRecordById(id: string): Promise<SimpleFinanceRecord | undefined> {
    return await db.simpleFinanceRecords.get(id);
  }

  async deleteRecord(id: string): Promise<void> {
    await db.simpleFinanceRecords.delete(id);
  }
}
