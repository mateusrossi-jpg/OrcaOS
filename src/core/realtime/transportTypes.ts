export type TransportConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'offline';

export type TransportEvent = 'ping' | 'pong' | 'operational_event' | 'notification' | 'sync_request';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface TransportEnvelope<T = unknown> {
  readonly id: string;
  readonly type: TransportEvent;
  readonly payload: T;
  readonly timestamp: string;
  readonly actor: string;
  readonly correlationId?: string;
  readonly isReplay?: boolean;
}

export interface NotificationEnvelope {
  readonly id: string;
  readonly eventId: string;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly message: string;
  readonly timestamp: string;
  readonly unread: boolean;
  readonly actor: string;
  readonly actionUrl?: string;
  readonly severity: 'info' | 'success' | 'warning' | 'error';
}

export type TransportSubscription = (envelope: TransportEnvelope) => void;
