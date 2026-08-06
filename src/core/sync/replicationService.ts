import { generateUUID } from '../utils/idGenerator';
import { OperationalEvent } from '../../domain/operationalEvent';
import { SyncEnvelope } from './syncTypes';
import { deviceIdentityManager } from './deviceIdentity';
import { realtimeTransport } from '../realtime/transport';

/**
 * AppendOnlyReplicationService
 * Listens to local OperationalEvents and wraps them into SyncEnvelopes
 * to be replicated via the transport layer.
 * Strictly Append-Only: No mutable states are replicated.
 */
export class AppendOnlyReplicationService {
  private sequenceCounter = 0;

  /**
   * Called by the local OperationalEventService or Bridge
   * whenever a new domain event is appended locally.
   */
  public replicateLocalEvent(event: OperationalEvent): void {
    const envelope = this.createEnvelope(event);

    // Broadcast via RealtimeTransport abstraction
    // In the future, the RealtimeTransport will route this to WebSocket/Cloud Sync
    realtimeTransport.publish<SyncEnvelope>(
      envelope,
      'sync_request',
      deviceIdentityManager.getDeviceId(),
      event.correlationId
    );
  }

  private createEnvelope(event: OperationalEvent): SyncEnvelope<OperationalEvent> {
    this.sequenceCounter++;

    return {
      envelopeId: generateUUID(),
      eventId: event.id,
      deviceId: deviceIdentityManager.getDeviceId(),
      correlationId: event.correlationId,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      timestamp: event.timestamp,
      sequence: this.sequenceCounter,
      transportVersion: '1.0',
      syncVersion: '1.0',
      operationType: 'APPEND',
      payload: event
    };
  }
}

export const replicationService = new AppendOnlyReplicationService();
