import { generateUUID } from '../utils/idGenerator';
import { traceStore } from './traceStore';
import { deviceIdentityManager } from '../sync/deviceIdentity';

export class ProjectionDiagnosticsService {
  public logRebuild(projectionType: string, timeMs: number, eventCount: number): void {
    traceStore.append({
      traceId: generateUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'EventStore',
      targetLayer: projectionType,
      timestamp: new Date().toISOString(),
      severity: timeMs > 500 ? 'warning' : 'info', // Warn on slow rebuilds
      diagnosticType: 'PROJECTION',
      message: `Rebuilt ${projectionType} from ${eventCount} events in ${timeMs}ms.`,
      metadata: { projectionType, timeMs, eventCount }
    });
  }

  public logInvalidation(projectionType: string, reason: string): void {
    traceStore.append({
      traceId: generateUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'OperationalEventService',
      targetLayer: projectionType,
      timestamp: new Date().toISOString(),
      severity: 'info',
      diagnosticType: 'PROJECTION',
      message: `Invalidated ${projectionType} due to ${reason}`,
      metadata: { projectionType, reason }
    });
  }
}

export const projectionDiagnosticsService = new ProjectionDiagnosticsService();
