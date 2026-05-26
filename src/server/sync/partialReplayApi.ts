import { SyncCursor, SyncEnvelope } from '../../core/sync/syncTypes';
import { backendEventStore } from '../storage/backendEventStore';
import { distributedCheckpointService } from '../../core/backend/distributedCheckpointService';

export interface ReplayRequest {
  readonly tenantId: string;
  readonly deviceId: string;
  readonly cursor: SyncCursor;
}

export interface ReplayWindow {
  readonly envelopes: readonly SyncEnvelope[];
  readonly totalMissing: number;
}

/**
 * PartialReplayApi
 * Handles reconnect-safe partial replays.
 * Ensures the device only receives what it missed since its last known sequence.
 */
export class PartialReplayApi {
  public computeReplay(request: ReplayRequest): ReplayWindow {
    const { tenantId, deviceId, cursor } = request;

    // 1. Find missing events from the Central Store
    const missingEnvelopes = backendEventStore.getEventsAfter(tenantId, cursor.sequence);

    // 2. Update backend checkpoint for this device
    if (missingEnvelopes.length > 0) {
      const highest = missingEnvelopes[missingEnvelopes.length - 1];
      distributedCheckpointService.updateCheckpoint(tenantId, deviceId, {
        lastEventId: highest.eventId,
        lastTimestamp: highest.timestamp,
        sequence: highest.sequence
      });
    }

    console.info(`[Replay API] Computed partial replay for ${deviceId}: ${missingEnvelopes.length} envelopes.`);

    return {
      envelopes: missingEnvelopes,
      totalMissing: missingEnvelopes.length
    };
  }
}

export const partialReplayApi = new PartialReplayApi();
