// Remove empty import or keep empty
import { traceStore } from './traceStore';
import { deviceIdentityManager } from '../sync/deviceIdentity';

export class TransportDiagnosticsService {
  public logConnection(state: string): void {
    traceStore.append({
      traceId: crypto.randomUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'RealtimeTransport',
      targetLayer: 'WebSocket',
      timestamp: new Date().toISOString(),
      severity: state === 'disconnected' || state === 'offline' ? 'warning' : 'info',
      diagnosticType: 'TRANSPORT',
      message: `Transport connection state changed to: ${state}`,
      metadata: { state }
    });
  }

  public logDeliveryError(envelopeId: string, error: string): void {
    traceStore.append({
      traceId: crypto.randomUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'RealtimeTransport',
      targetLayer: 'CloudEventGateway',
      timestamp: new Date().toISOString(),
      severity: 'error',
      diagnosticType: 'TRANSPORT',
      message: `Failed to deliver envelope ${envelopeId}: ${error}`,
      metadata: { envelopeId, error }
    });
  }
}

export const transportDiagnosticsService = new TransportDiagnosticsService();
