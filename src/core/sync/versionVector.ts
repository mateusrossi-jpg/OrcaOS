import { AggregateCheckpoint, DeviceCheckpoint } from './syncTypes';

/**
 * VersionVector Foundation
 * Tracks causal dependencies and replication cursors for multi-device sync.
 * Used to detect stale states and prevent overwrite loops.
 */
export class VersionVectorManager {
  private aggregateCheckpoints = new Map<string, AggregateCheckpoint>();
  private deviceCheckpoints = new Map<string, DeviceCheckpoint>();

  public updateAggregateCheckpoint(aggregateId: string, eventId: string, version: number): void {
    this.aggregateCheckpoints.set(aggregateId, {
      aggregateId,
      version,
      lastEventId: eventId,
      lastUpdatedAt: new Date().toISOString()
    });
  }

  public getAggregateVersion(aggregateId: string): number {
    return this.aggregateCheckpoints.get(aggregateId)?.version || 0;
  }

  public updateDeviceCursor(deviceId: string, lastEventId: string, lastTimestamp: string, sequence: number): void {
    this.deviceCheckpoints.set(deviceId, {
      deviceId,
      cursor: {
        lastEventId,
        lastTimestamp,
        sequence
      },
      syncedAt: new Date().toISOString()
    });
  }

  public getDeviceCursor(deviceId: string) {
    return this.deviceCheckpoints.get(deviceId)?.cursor || null;
  }
}

export const versionVectorManager = new VersionVectorManager();
