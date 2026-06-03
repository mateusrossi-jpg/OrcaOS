import { generateUUID } from '../utils/idGenerator';
import { TransportConnectionState, TransportEnvelope, TransportSubscription } from './transportTypes';

/**
 * RealtimeTransport Foundation
 * Abstract transport layer ready for WebSocket/SSE in the future.
 * Currently implements a local BroadcastChannel fallback for multi-tab sync.
 */
export class RealtimeTransport {
  private state: TransportConnectionState = 'disconnected';
  private subscribers = new Set<TransportSubscription>();
  private channel: BroadcastChannel | null = null;
  private readonly channelName = 'aferix_realtime_bridge';

  constructor() {
    this.initializeLocalBridge();
  }

  private initializeLocalBridge() {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = (e: MessageEvent<TransportEnvelope>) => {
        // Only process incoming messages if they're not from ourselves (handled by BroadcastChannel implicitly)
        this.notifySubscribers({ ...e.data, isReplay: false });
      };
      this.state = 'connected';
    } else {
      this.state = 'offline';
      console.warn('BroadcastChannel not supported. Multi-tab sync disabled.');
    }
  }

  public getState(): TransportConnectionState {
    return this.state;
  }

  public subscribe(callback: TransportSubscription): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(envelope: TransportEnvelope) {
    // Snapshot to prevent mutation during iteration
    const listeners = [...this.subscribers];
    for (const listener of listeners) {
      try {
        listener(envelope);
      } catch (err) {
        console.error('Error in realtime transport subscriber:', err);
      }
    }
  }

  public publish<T>(payload: T, type: TransportEnvelope['type'], actor: string = 'system', correlationId?: string): void {
    const envelope: TransportEnvelope<T> = {
      id: generateUUID(),
      type,
      payload,
      timestamp: new Date().toISOString(),
      actor,
      correlationId,
      isReplay: false
    };

    // Notify local subscribers
    this.notifySubscribers(envelope);

    // Broadcast to other tabs
    if (this.channel && this.state === 'connected') {
      this.channel.postMessage(envelope);
    }
  }

  public connect(): void {
    if (this.state === 'disconnected') {
      this.state = 'connecting';
      setTimeout(() => {
        this.state = 'connected';
      }, 500);
    }
  }

  public disconnect(): void {
    this.state = 'disconnected';
    if (this.channel) {
      this.channel.close();
    }
  }
}

export const realtimeTransport = new RealtimeTransport();
