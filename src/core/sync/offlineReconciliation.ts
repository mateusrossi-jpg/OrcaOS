import { SyncEnvelope } from './syncTypes';
import { versionVectorManager } from './versionVector';
import { partialReplayEngine } from './partialReplayEngine';
import { deviceIdentityManager } from './deviceIdentity';

/**
 * OfflineReconciliationService
 * Responsible for handling reconnect scenarios and incoming SyncEnvelopes from other devices.
 * It filters out duplicates and stale states before delegating to the local Event Store.
 */
export class OfflineReconciliationService {
  
  /**
   * Processes an incoming SyncEnvelope from the cloud/transport.
   * Ensures idempotency and causal consistency.
   */
  public processIncomingEnvelope(envelope: SyncEnvelope): void {
    // 1. Ignore our own echoes
    if (envelope.deviceId === deviceIdentityManager.getDeviceId()) {
      return;
    }

    // 2. Extract Device Cursor
    const localCursor = versionVectorManager.getDeviceCursor(envelope.deviceId);
    const cursorTime = localCursor ? localCursor.lastTimestamp : '1970-01-01T00:00:00Z';

    // 3. Prevent Duplicate/Stale Overwrite
    if (!partialReplayEngine.shouldReplay(envelope, cursorTime)) {
      console.warn(`[Sync] Discarding stale envelope ${envelope.envelopeId} from ${envelope.deviceId}`);
      return;
    }

    // 4. Update Version Vector
    versionVectorManager.updateDeviceCursor(
      envelope.deviceId,
      envelope.eventId,
      envelope.timestamp,
      envelope.sequence
    );

    versionVectorManager.updateAggregateCheckpoint(
      envelope.aggregateId,
      envelope.eventId,
      envelope.sequence // using sequence as primitive version for now
    );

    // 5. Delegate valid payload to local Event Store Append Pipeline
    // (In full implementation, this calls operationalEventService.appendFromSync(...))
    console.info(`[Sync] Accepted valid envelope ${envelope.envelopeId}`);
  }

  /**
   * Triggered when device reconnects to the network.
   * Negotiates with remote server to fetch only missing envelopes.
   */
  public async reconcileOnReconnect(): Promise<void> {
    console.info(`[Sync] Device reconnected. Requesting partial replay based on vector checkpoints.`);
    // TODO: Send local VersionVector checkpoints to Cloud.
    // Receive Missing Envelopes.
    // Call processIncomingEnvelope for each.
  }
}

export const offlineReconciliationService = new OfflineReconciliationService();
