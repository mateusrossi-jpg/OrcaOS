import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/dexieDatabase';
import { SimpleFinanceRecord } from '../domain/finance';

export function useSimpleFinanceRecords(): SimpleFinanceRecord[] {
  return useLiveQuery(() => db.simpleFinanceRecords.toArray()) || [];
}