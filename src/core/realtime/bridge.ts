import { realtimeTransport } from './transport';
import { operationalSubscriptionService } from '../../services/operationalSubscriptionService';
import { OperationalFeedItem } from '../../domain/operationalFeedProjection';

/**
 * OperationalRealtimeBridge
 * Connects the OperationalSubscriptionService (Domain) to the RealtimeTransport (Network/UI).
 * It listens to domain events and publishes them as Transport Envelopes.
 */
class OperationalRealtimeBridge {
  private initialized = false;
  private unsubscribers: Array<() => void> = [];

  public initialize() {
    if (this.initialized) return;

    // Bridge Operational Alerts to Transport Notifications
    const unsubAlerts = operationalSubscriptionService.subscribeOperationalAlerts((alerts) => {
      for (const alert of alerts) {
        realtimeTransport.publish<OperationalFeedItem>(
          alert,
          'notification',
          alert.actor,
          alert.correlationId
        );
      }
    });

    // Bridge Activity Feed to Transport sync requests
    // Example: A new feed item implies other tabs might need to invalidate their projections
    const unsubFeed = operationalSubscriptionService.subscribeActivityFeed((payload) => {
      if (payload.newItems.length > 0) {
        realtimeTransport.publish(
          { count: payload.newItems.length, latest: payload.newItems[0].id },
          'sync_request',
          'system'
        );
      }
    });

    this.unsubscribers.push(unsubAlerts, unsubFeed);
    this.initialized = true;
  }

  public shutdown() {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.initialized = false;
  }
}

export const realtimeBridge = new OperationalRealtimeBridge();
