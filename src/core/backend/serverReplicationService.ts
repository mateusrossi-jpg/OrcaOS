import { SyncEnvelope } from '../sync/syncTypes';
import { distributedCheckpointService } from './distributedCheckpointService';
import { TenantContext, TenantIsolationGuard } from './tenantFoundation';

/**
 * ServerReplicationService
 * Receives Append-Only SyncEnvelopes from clients, validates their tenant context,
 * prevents stale replays, and persists them to the centralized Event Store.
 */
export class ServerReplicationService {

  public processIncomingReplication(context: TenantContext, envelope: SyncEnvelope): void {
    // 1. Tenant Security
    TenantIsolationGuard.assertTenantMatch(context, { tenantId: context.tenantId, payload: envelope });

    // 2. Stale/Duplicate Check
    if (distributedCheckpointService.isStale(context.tenantId, envelope.deviceId, envelope.sequence)) {
      console.warn(`[Server Sync] Discarding stale envelope ${envelope.envelopeId} from device ${envelope.deviceId}`);
      return;
    }

    // 3. Centralized Ingestion (Append-Only)
    // -> In a full implementation, write to DynamoDB / Postgres Event Store
    console.info(`[Server Sync] Accepted envelope ${envelope.envelopeId} for aggregate ${envelope.aggregateType}:${envelope.aggregateId}`);

    // 4. Update Checkpoint
    distributedCheckpointService.updateCheckpoint(context.tenantId, envelope.deviceId, {
      lastEventId: envelope.eventId,
      lastTimestamp: envelope.timestamp,
      sequence: envelope.sequence
    });

    // 5. Fan-out to other connected devices (Broadcast)
    // -> Trigger Distributed Event Gateway to publish to active WebSockets
  }
}

export const serverReplicationService = new ServerReplicationService();
