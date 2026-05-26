import { AutomationEnvelope } from '../../core/automation/automationTypes';
import { sessionManager } from '../runtime/sessionManager';

/**
 * AutomationDeliveryRuntime
 * Distributes deduplicated automation envelopes across the tenant.
 */
export class AutomationDeliveryRuntime {
  public distribute(tenantId: string, envelope: AutomationEnvelope): void {
    const sessions = sessionManager.getTenantSessions(tenantId);
    
    for (const session of sessions) {
      // Broadcast to all devices so they can render insights or act
      if (session.deviceId !== envelope.deviceId) {
        session.socket.send(JSON.stringify({
          id: crypto.randomUUID(),
          type: 'automation_dispatch',
          payload: envelope,
          timestamp: new Date().toISOString(),
          actor: 'system'
        }));
      }
    }
  }
}

export const automationDeliveryRuntime = new AutomationDeliveryRuntime();
