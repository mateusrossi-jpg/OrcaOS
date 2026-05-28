import { supabase, isCloudEnabled } from '../core/cloud/supabaseClient';
import { db } from '../storage/dexieDatabase';
import { aferixLogger } from '../core/debug/aferixLogger';

interface SyncableEvent {
  syncStatus?: 'synced' | 'pending';
}

/**
 * CloudSyncService: Maestro da FASE 3.
 * Responsável por replicar o Event Store local para o Supabase
 * e ouvir mudanças de outros dispositivos.
 */
export class CloudSyncService {
  private static instance: CloudSyncService;
  private isSyncing = false;

  private constructor() {}

  static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  async countPendingEvents(): Promise<number> {
    return await db.operationalEvents
      .filter(e => (e as unknown as SyncableEvent).syncStatus !== 'synced')
      .count();
  }

  /**
   * Sincroniza eventos pendentes do Event Store local para a nuvem.
   */
  async syncLocalToCloud(): Promise<{ sent: number; errors: number }> {
    if (!isCloudEnabled || this.isSyncing) return { sent: 0, errors: 0 };
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { sent: 0, errors: 0 };

    this.isSyncing = true;
    let sentCount = 0;
    let errorCount = 0;

    try {
      const unsyncedEvents = await db.operationalEvents
        .filter(e => (e as unknown as SyncableEvent).syncStatus !== 'synced')
        .toArray();

      for (const event of unsyncedEvents) {
        const { error } = await supabase.from('sync_envelopes').insert({
          envelope_id: `env-${event.id}`,
          event_id: event.id,
          device_id: (window as unknown as Record<string, string>).AFERIX_INSTALLATION_ID || 'browser',
          user_id: session.user.id,
          aggregate_id: event.aggregateId,
          aggregate_type: event.aggregateType,
          event_type: event.eventType,
          payload: {
            metadata: event.metadata,
            snapshot: event.snapshot,
            timestamp: event.timestamp,
            actor: event.actor
          },
          sequence: event.sequence || Date.now(),
          timestamp: event.timestamp
        });

        if (!error) {
          await db.operationalEvents.update(event.id, { syncStatus: 'synced' } as Record<string, unknown>);
          sentCount++;
        } else {
          errorCount++;
          console.error('[CloudSync] Failed to insert event:', error);
        }
      }

      if (sentCount > 0) {
        aferixLogger.audit('CloudSync', `Replicated ${sentCount} events to cloud.`);
      }
    } catch (err) {
      console.error('[CloudSync] Sync failed:', err);
    } finally {
      this.isSyncing = false;
    }

    return { sent: sentCount, errors: errorCount };
  }
}

export const cloudSyncService = CloudSyncService.getInstance();
