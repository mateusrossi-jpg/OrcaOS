import { db } from '../database/db';
import type { FinancialTransaction } from '../database/schema';
import { createId } from '../../app/utils/idHelpers';

export class TransactionRepository {
  async getRecentTransactions(limit: number = 200): Promise<FinancialTransaction[]> {
    return db.transactions
      .orderBy('due_date')
      .reverse()
      .limit(limit)
      .toArray()
      .catch(() => db.transactions.toArray()); // fallback if no index
  }

  async create(payload: Omit<FinancialTransaction, 'id'>): Promise<FinancialTransaction> {
    const tx = {
      ...payload,
      id: createId('tx')
    } as FinancialTransaction;

    await db.transaction('rw', [db.transactions, db.sync_outbox], async () => {
      await db.transactions.add(tx);
      await db.sync_outbox.add({
        uuid: tx.id,
        table_name: 'transactions',
        operation: 'INSERT',
        payload: tx,
        created_at: Date.now(),
      });
    });

    return tx;
  }
}

export const transactionRepository = new TransactionRepository();
