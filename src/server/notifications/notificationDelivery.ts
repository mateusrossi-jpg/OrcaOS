import { NotificationEnvelope } from '../../core/realtime/transportTypes';
import { sessionManager } from '../runtime/sessionManager';

/**
 * NotificationDeliveryRuntime
 * Routes server-derived or client-derived notification envelopes safely to targets.
 */
export class NotificationDeliveryRuntime {
  public deliver(tenantId: string, envelope: NotificationEnvelope, targetDeviceId?: string): void {
    if (targetDeviceId) {
      // Unicast
      const session = sessionManager.getDeviceSession(tenantId, targetDeviceId);
      if (session) {
        session.socket.send(JSON.stringify({
          id: crypto.randomUUID(),
          type: 'notification',
          payload: envelope,
          timestamp: new Date().toISOString(),
          actor: 'system'
        }));
      }
    } else {
      // Broadcast to tenant
      const sessions = sessionManager.getTenantSessions(tenantId);
      for (const session of sessions) {
        session.socket.send(JSON.stringify({
          id: crypto.randomUUID(),
          type: 'notification',
          payload: envelope,
          timestamp: new Date().toISOString(),
          actor: 'system'
        }));
      }
    }
  }
}

export const notificationDeliveryRuntime = new NotificationDeliveryRuntime();
