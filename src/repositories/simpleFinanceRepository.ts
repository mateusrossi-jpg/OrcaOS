import { SimpleFinanceRecord } from '../domain/finance';

export interface SimpleFinanceRepository {
  createRecord(record: SimpleFinanceRecord): Promise<void>;
  updateRecord(record: SimpleFinanceRecord): Promise<void>;
  listRecords(): Promise<SimpleFinanceRecord[]>;
  getRecordById(id: string): Promise<SimpleFinanceRecord | undefined>;
  deleteRecord(id: string): Promise<void>;
}
