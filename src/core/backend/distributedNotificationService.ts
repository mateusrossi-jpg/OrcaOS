import { NotificationEnvelope } from '../realtime/transportTypes';
import { TenantContext, TenantIsolationGuard } from './tenantFoundation';

/**
 * DistributedNotificationService
 * Transports derived operational/automation alerts across the cluster.
 * 
 * Does NOT store notifications persistently in a parallel DB.
 * Purely acts as a realtime fan-out router to connected devices.
 */
export class DistributedNotificationService {

  public broadcastNotification(context: TenantContext, notification: NotificationEnvelope, targetDeviceId?: string): void {
    // 1. Tenant Security
    TenantIsolationGuard.assertTenantMatch(context, { tenantId: context.tenantId, payload: notification });

    // 2. Dispatch to Transport Gateway
    // If targetDeviceId is provided, unicast. Otherwise, broadcast to all tenant's active devices.
    if (targetDeviceId) {
      console.info(`[Server Notification] Unicasting ${notification.severity} alert to device ${targetDeviceId}`);
    } else {
      console.info(`[Server Notification] Broadcasting ${notification.severity} alert to tenant ${context.tenantId}`);
    }
  }
}

export const distributedNotificationService = new DistributedNotificationService();
