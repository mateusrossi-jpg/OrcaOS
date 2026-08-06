import { db } from '../database/db';
import type { SyncOutboxItem } from '../database/schema';

export class OutboxRepository {
  async enqueue(
    tableName: string,
    operation: 'insert' | 'update' | 'delete',
    payload: Record<string, any>
  ): Promise<void> {
    const tenant_id = localStorage.getItem('tenant');
    const user_id = localStorage.getItem('user_id');

    if (!tenant_id || !user_id) {
      throw new Error('Tenant or User ID is missing, cannot enqueue mutation.');
    }

    const item: SyncOutboxItem = {
      id: crypto.randomUUID(),
      tenant_id,
      user_id,
      table_name: tableName,
      record_id: payload.id || crypto.randomUUID(),
      operation,
      payload,
      correlation_id: `mut_${crypto.randomUUID()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      retry_count: 0,
      status: 'pending'
    };
    await db.sync_outbox.add(item);
  }

  async getPending(): Promise<SyncOutboxItem[]> {
    return await db.sync_outbox
      .where('status')
      .equals('pending')
      .or('status')
      .equals('')
      .toArray();
  }

  async getDeadLetters(): Promise<SyncOutboxItem[]> {
    return await db.sync_outbox
      .where('status')
      .equals('dead_letter')
      .toArray();
  }

  async markSuccess(id: string): Promise<void> {
    await db.sync_outbox.delete(id);
  }

  async discardMutation(id: string): Promise<void> {
    const item = await db.sync_outbox.get(id);
    if (!item) return;

    if (item.table_name === 'transactions') {
       throw new Error('Não é possível descartar transações financeiras automaticamente.');
    }

    await db.sync_outbox.delete(id);
  }

  async incrementRetry(id: string, errorMsg: string): Promise<void> {
    const item = await db.sync_outbox.get(id);
    if (!item) return;

    const nextRetry = (item.retry_count || 0) + 1;
    if (nextRetry >= 3) {
      await this.moveToDeadLetter(id, errorMsg, 'retryable_error');
    } else {
      await db.sync_outbox.update(id, {
        retry_count: nextRetry,
        last_error: errorMsg
      });
    }
  }

  async moveToDeadLetter(
    id: string,
    errorMsg: string,
    category: 'retryable_error' | 'validation_error' | 'conflict_error' | 'auth_error' | 'security_error'
  ): Promise<void> {
    await db.sync_outbox.update(id, {
      status: category === 'security_error' ? 'security_error' : 'dead_letter',
      last_error: errorMsg,
      error_category: category,
      updated_at: new Date().toISOString()
    });
  }

  async requeueDeadLetters(): Promise<void> {
    const all = await db.sync_outbox.where('status').equals('dead_letter').toArray();
    for (const item of all) {
      if (item.id && (item.error_category === 'retryable_error' || item.error_category === 'auth_error' || !item.error_category)) {
        await db.sync_outbox.update(item.id, {
          status: 'pending',
          retry_count: 0,
          last_error: undefined,
          error_category: undefined
        });
      }
    }
  }
}

export const outboxRepository = new OutboxRepository();