import { generateUUID } from '../utils/idGenerator';
import { traceStore } from './traceStore';
import { deviceIdentityManager } from '../sync/deviceIdentity';

export class AutomationDiagnosticsService {
  public logDispatch(automationId: string, trigger: string): void {
    traceStore.append({
      traceId: generateUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'AutomationDispatchService',
      targetLayer: 'CloudEventGateway',
      timestamp: new Date().toISOString(),
      severity: 'info',
      diagnosticType: 'AUTOMATION',
      message: `Dispatched automation ${automationId} (trigger: ${trigger})`,
      metadata: { automationId, trigger }
    });
  }

  public logDuplicatePrevention(automationId: string): void {
    traceStore.append({
      traceId: generateUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'AutomationDispatchService',
      targetLayer: 'AutomationDispatchService',
      timestamp: new Date().toISOString(),
      severity: 'warning',
      diagnosticType: 'AUTOMATION',
      message: `Prevented duplicate dispatch for automation ${automationId}`,
      metadata: { automationId }
    });
  }
}

export const automationDiagnosticsService = new AutomationDiagnosticsService();
