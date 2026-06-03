import { generateUUID } from '../utils/idGenerator';
import { TraceEnvelope } from './traceTypes';
import { traceStore } from './traceStore';
import { deviceIdentityManager } from '../sync/deviceIdentity';

export class ReplayDiagnosticsService {
  public logReplay(count: number, source: string, latencyMs: number): void {
    const trace: TraceEnvelope = {
      traceId: generateUUID(),
      tenantId: 'local', // Assuming local context for now
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: source,
      targetLayer: 'PartialReplayEngine',
      timestamp: new Date().toISOString(),
      severity: count > 100 ? 'warning' : 'info',
      diagnosticType: 'REPLAY',
      message: `Processed ${count} envelopes from partial replay in ${latencyMs}ms.`,
      metadata: { count, latencyMs }
    };
    traceStore.append(trace);
  }

  public logStaleReplay(envelopeId: string): void {
    traceStore.append({
      traceId: generateUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer: 'ReplicationService',
      targetLayer: 'PartialReplayEngine',
      timestamp: new Date().toISOString(),
      severity: 'warning',
      diagnosticType: 'REPLAY',
      message: `Discarded stale envelope ${envelopeId} during replay.`,
      metadata: { envelopeId }
    });
  }
}

export const replayDiagnosticsService = new ReplayDiagnosticsService();
