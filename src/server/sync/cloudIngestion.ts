import { SyncEnvelope } from '../../core/sync/syncTypes';
import { backendEventStore } from '../storage/backendEventStore';
import { distributedCheckpointService } from '../../core/backend/distributedCheckpointService';
import { sessionManager } from '../runtime/sessionManager';

/**
 * CloudIngestionService
 * Receives incoming append-only SyncEnvelopes from clients.
 * Enforces staleness checks and duplicate rejection before hitting the backend store.
 */
export class CloudIngestionService {
  public ingest(tenantId: string, envelope: SyncEnvelope): void {
    // 1. Stale / Sequence validation
    if (distributedCheckpointService.isStale(tenantId, envelope.deviceId, envelope.sequence)) {
      console.warn(`[Cloud Ingestion] Discarded stale append ${envelope.envelopeId} from device ${envelope.deviceId}`);
      return;
    }

    // 2. Append to central Event Store
    backendEventStore.append(tenantId, envelope);

    // 3. Update device checkpoint
    distributedCheckpointService.updateCheckpoint(tenantId, envelope.deviceId, {
      lastEventId: envelope.eventId,
      lastTimestamp: envelope.timestamp,
      sequence: envelope.sequence
    });

    // 4. Fan-out to other connected devices in the tenant
    this.fanout(tenantId, envelope);
  }

  private fanout(tenantId: string, envelope: SyncEnvelope): void {
    const sessions = sessionManager.getTenantSessions(tenantId);
    
    for (const session of sessions) {
      if (session.deviceId !== envelope.deviceId) { // Do not echo back
        try {
          session.socket.send(JSON.stringify({
            id: crypto.randomUUID(),
            type: 'sync_request',
            payload: envelope,
            timestamp: new Date().toISOString(),
            actor: 'system'
          }));
        } catch (err) {
          console.error(`[Cloud Ingestion] Failed to fan-out to ${session.deviceId}`, err);
        }
      }
    }
  }
}

export const cloudIngestionService = new CloudIngestionService();
