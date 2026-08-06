import { SyncCursor } from '../sync/syncTypes';

export interface DeviceCheckpointRecord {
  readonly tenantId: string;
  readonly deviceId: string;
  readonly cursor: SyncCursor;
  readonly lastReconciledAt: string;
}

/**
 * DistributedCheckpointService
 * Manages the high-water marks (cursors) for every device in the cluster.
 * Critical for computing partial replays and preventing duplicate synchronization storms.
 */
export class DistributedCheckpointService {
  // In-memory stub for the distributed key-value store (e.g., Redis)
  private checkpoints = new Map<string, DeviceCheckpointRecord>();

  private getPartitionKey(tenantId: string, deviceId: string): string {
    return `${tenantId}:${deviceId}`;
  }

  public getCheckpoint(tenantId: string, deviceId: string): DeviceCheckpointRecord | null {
    return this.checkpoints.get(this.getPartitionKey(tenantId, deviceId)) || null;
  }

  public updateCheckpoint(tenantId: string, deviceId: string, cursor: SyncCursor): void {
    const key = this.getPartitionKey(tenantId, deviceId);

    // Idempotency: only advance if the new sequence is strictly greater
    const current = this.checkpoints.get(key);
    if (current && cursor.sequence <= current.cursor.sequence) {
      return; // Ignore stale or duplicate checkpoint updates
    }

    this.checkpoints.set(key, {
      tenantId,
      deviceId,
      cursor,
      lastReconciledAt: new Date().toISOString()
    });
  }

  /**
   * Determines if a given sequence has already been processed by the device.
   */
  public isStale(tenantId: string, deviceId: string, sequence: number): boolean {
    const current = this.getCheckpoint(tenantId, deviceId);
    if (!current) return false;
    return sequence <= current.cursor.sequence;
  }
}

export const distributedCheckpointService = new DistributedCheckpointService();
