export type SyncOperation = 'APPEND' | 'CHECKPOINT';
export type SyncDeliveryState = 'PENDING' | 'IN_FLIGHT' | 'ACKNOWLEDGED' | 'FAILED';

export interface DeviceMetadata {
  readonly os: string;
  readonly browser: string;
  readonly version: string;
}

export interface DeviceIdentity {
  readonly deviceId: string;
  readonly createdAt: string;
  readonly lastSeenAt: string;
  readonly metadata: DeviceMetadata;
}

export interface SyncCursor {
  readonly lastTimestamp: string;
  readonly lastEventId: string;
  readonly sequence: number;
}

export interface SyncEnvelope<T = unknown> {
  readonly envelopeId: string;
  readonly eventId: string;
  readonly deviceId: string;
  readonly correlationId?: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly timestamp: string;
  readonly sequence: number;
  readonly transportVersion: string;
  readonly syncVersion: string;
  readonly operationType: SyncOperation;
  readonly payload: T;
}

export interface DeviceCheckpoint {
  readonly deviceId: string;
  readonly cursor: SyncCursor;
  readonly syncedAt: string;
}

export interface AggregateCheckpoint {
  readonly aggregateId: string;
  readonly version: number;
  readonly lastEventId: string;
  readonly lastUpdatedAt: string;
}
