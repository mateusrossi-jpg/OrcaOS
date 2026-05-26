import { traceStore } from './traceStore';
import { deviceIdentityManager } from '../sync/deviceIdentity';

export class NotificationDiagnosticsService {
  public logDelivery(notificationId: string, priority: string): void {
    traceStore.append({
      traceId: crypto.randomUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'NotificationCenter',
      targetLayer: 'UI',
      timestamp: new Date().toISOString(),
      severity: priority === 'critical' ? 'warning' : 'info',
      diagnosticType: 'NOTIFICATION',
      message: `Delivered notification ${notificationId} (${priority})`,
      metadata: { notificationId, priority }
    });
  }

  public logDropped(notificationId: string, reason: string): void {
    traceStore.append({
      traceId: crypto.randomUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'NotificationCenter',
      targetLayer: 'None',
      timestamp: new Date().toISOString(),
      severity: 'error',
      diagnosticType: 'NOTIFICATION',
      message: `Dropped notification ${notificationId}: ${reason}`,
      metadata: { notificationId, reason }
    });
  }
}

export const notificationDiagnosticsService = new NotificationDiagnosticsService();
