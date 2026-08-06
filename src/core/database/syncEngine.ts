import { outboxRepository } from '../repositories/OutboxRepository';
import { supabase } from './supabaseClient';
import { syncHealthService } from '../services/SyncHealthService';
import { mediaCleanupWorker } from '../services/MediaCleanupWorker';
import { db } from './db';
import { TenantIntegrityGuard } from '../services/TenantIntegrityGuard';
import { telemetryService } from '../services/TelemetryService';

import { backgroundTaskGuard } from '../services/BackgroundTaskGuard';
// ─── AUTH GUARD (Removed, using BackgroundTaskGuard) ────────────────────────

// ─── PUSH: Sincronização Local -> Remoto ────────────────────────────────────

export async function enqueueMutation(
  tableName: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: Record<string, any>
) {
  if (operation === 'UPDATE' || operation === 'INSERT') {
    payload.updated_at = new Date().toISOString();
    payload.version = (payload.version || 0) + 1;
  }
  await outboxRepository.enqueue(tableName, operation, payload);
  triggerSync().catch(console.error);
}

let isProcessingPush = false;
let isProcessingPull = false;

export async function processOutbox() {
  if (isProcessingPush) return;
  const guardState = await backgroundTaskGuard.check();
  if (guardState !== 'authenticated') return;

  isProcessingPush = true;

  try {
    const pendingItems = await outboxRepository.getPending();

    for (const item of pendingItems) {
      if (!item.id) continue;

      try {
        TenantIntegrityGuard.validateMutationOwnership(item);

        if (item.operation === 'insert' || item.operation === 'update') {
          const { data: remoteData, error: fetchErr } = await supabase
            .from(item.table_name)
            .select('*')
            .eq('id', item.record_id)
            .maybeSingle();

          if (fetchErr && (fetchErr.code === 'PGRST301' || fetchErr.code === '401' || fetchErr.code === '403')) {
            throw { status: 401, message: 'Authentication required' };
          }

          if (remoteData) {
            const remoteVersion = remoteData.version || 0;
            const localVersion = item.payload.version || 0;

            if (item.table_name === 'work_orders' && remoteVersion > localVersion) {
              await db.work_orders.update(item.record_id, { conflict_state: 'conflict' });
              await outboxRepository.moveToDeadLetter(item.id, 'Conflict detected (remote > local)', 'conflict_error');
              telemetryService.track('conflict_created', item.correlation_id, { record_id: item.record_id });
              continue;
            }

            if (item.table_name === 'transactions' && item.operation === 'update') {
              await outboxRepository.markSuccess(item.id);
              continue;
            }

            if (item.table_name === 'stock_reservations' && remoteData.status === 'consumed') {
               await outboxRepository.moveToDeadLetter(item.id, 'Stock conflict', 'conflict_error');
               continue;
            }
          }

          const { error } = await supabase
            .from(item.table_name)
            .upsert(item.payload);

          if (error) throw error;
        } else if (item.operation === 'delete') {
          const { error } = await supabase
            .from(item.table_name)
            .delete()
            .eq('id', item.record_id);

          if (error) throw error;
        }

        await outboxRepository.markSuccess(item.id);
      } catch (err: any) {
        console.error(`[SyncEngine] Falha push ${item.id}`, err);
        const errorMsg = err.message || JSON.stringify(err);

        if (errorMsg.includes('TenantIntegrityGuard')) {
          await outboxRepository.moveToDeadLetter(item.id, errorMsg, 'security_error');
          telemetryService.track('mutation_blocked_security', item.correlation_id, { reason: 'tenant_mismatch', table: item.table_name });
          continue;
        }

        const status = err.status || err.code;

        if (status === 401 || status === 403 || status === 'PGRST301') {
          syncHealthService.setState('authentication_required');
          telemetryService.track('rls_denied', item.correlation_id, { table: item.table_name });
          break; // Para o sync, espera o usuário logar
        } else if (status === 400 || (typeof status === 'number' && status >= 400 && status < 500 && status !== 429)) {
          await outboxRepository.moveToDeadLetter(item.id, errorMsg, 'validation_error');
        } else {
          await outboxRepository.incrementRetry(item.id, errorMsg);
          break; // Para manter a ordem e aguardar network (retry exponencial no outbox)
        }
      }
    }
    syncHealthService.recordSuccess();
  } finally {
    isProcessingPush = false;
  }
}

// ─── PULL: Sincronização Remoto -> Local (Reconciliação) ───────────────────

import { SyncCursorRepository } from '../repositories/SyncCursorRepository';

// We will fetch tenant_id from supabase auth.

export async function pullChanges() {
  if (isProcessingPull) return;
  const guardState = await backgroundTaskGuard.check();
  if (guardState !== 'authenticated') return;

  isProcessingPull = true;

  try {
    const pendingOutbox = await outboxRepository.getPending();
    const pendingMap = new Map<string, any>();
    for (const item of pendingOutbox) pendingMap.set(item.uuid, item);

    const tables = ['work_orders', 'customers', 'transactions', 'stock_reservations'];

    const session = await supabase.auth.getSession();
    const tenantId = session.data.session?.user.app_metadata?.company_id || session.data.session?.user.id || 'guest';

    for (const table of tables) {
      let cursor = await SyncCursorRepository.getCursor(tenantId, table);
      let latestTimestamp = cursor?.last_updated_at || new Date(0).toISOString();
      let latestId = cursor?.last_processed_id || '';
      let hasMore = true;
      const pageSize = 500;

      while (hasMore) {
        let query = supabase
          .from(table)
          .select('*')
          .order('updated_at', { ascending: true })
          .order('id', { ascending: true })
          .limit(pageSize);

        if (latestTimestamp && latestId) {
          query = query.or(`updated_at.gt.${latestTimestamp},and(updated_at.eq.${latestTimestamp},id.gt.${latestId})`);
        } else {
          query = query.gt('updated_at', latestTimestamp);
        }

        const { data, error } = await query;

        if (error) {
          const code = error.code || (error as any).status;
          if (code === 'PGRST301' || code === '401' || code === '403') {
            syncHealthService.setState('authentication_required');
          }
          break; // stop pulling this table, will retry later
        }

        if (!data || data.length === 0) {
          hasMore = false;
          break;
        }

        let chunkLatestTimestamp = latestTimestamp;
        let chunkLatestId = latestId;

        await db.transaction('rw', [(db as any)[table], db.sync_cursors], async (tx) => {
          for (const remoteRow of data) {
            if (remoteRow.updated_at > chunkLatestTimestamp) {
              chunkLatestTimestamp = remoteRow.updated_at;
              chunkLatestId = remoteRow.id;
            } else if (remoteRow.updated_at === chunkLatestTimestamp && remoteRow.id > chunkLatestId) {
              chunkLatestId = remoteRow.id;
            }

            const localPending = pendingMap.get(remoteRow.id);

            if (table === 'transactions') {
              const exists = await db.transactions.get(remoteRow.id);
              if (!exists) await db.transactions.add(remoteRow as any);
              continue;
            }

            if (table === 'customers') {
              await db.customers.put(remoteRow as any);
              continue;
            }

            if (table === 'work_orders') {
              if (localPending) {
                 await db.work_orders.update(remoteRow.id, {
                   conflict_state: 'conflict',
                   remote_version: remoteRow.version,
                   remote_snapshot: remoteRow
                 });
              } else {
                 await db.work_orders.put(remoteRow as any);
              }
              continue;
            }

            if (table === 'stock_reservations') {
               await db.stock_reservations.put(remoteRow as any);
            }
          }

          await SyncCursorRepository.saveCursorTx(tx, {
            tenant_id: tenantId,
            table_name: table,
            last_updated_at: chunkLatestTimestamp,
            last_processed_id: chunkLatestId
          });
        });

        latestTimestamp = chunkLatestTimestamp;
        latestId = chunkLatestId;

        if (data.length < pageSize) {
          hasMore = false;
        }
      }
    }
    syncHealthService.recordSuccess();
  } catch (err) {
    console.error('[SyncEngine] Falha pull', err);
  } finally {
    isProcessingPull = false;
  }
}

export async function triggerSync() {
  await processOutbox();
  await pullChanges();
  syncHealthService.markSyncComplete();
}

import { sessionLifecycleManager } from '../services/SessionLifecycleManager';

if (typeof window !== 'undefined') {
  const safeTrigger = async () => {
    const isValid = await sessionLifecycleManager.ensureValidSession();
    if (isValid) {
      triggerSync().catch(() => {});
      mediaCleanupWorker.start().catch(() => {});
    }
  };

  setTimeout(safeTrigger, 1000); // app iniciou

  setInterval(() => {
    safeTrigger();
  }, 30000);

  setInterval(() => {
    safeTrigger();
  }, 5 * 60 * 1000); // 5 minutes

  window.addEventListener('online', safeTrigger); // voltou a ficar online

  document.addEventListener('visibilitychange', () => { // voltou do background / mudança de visibilidade
    if (document.visibilityState === 'visible') {
       safeTrigger();
    }
  });
}