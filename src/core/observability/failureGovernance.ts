import { DeadLetterEnvelope } from './traceTypes';
import { traceStore } from './traceStore';
import { deviceIdentityManager } from '../sync/deviceIdentity';

export class FailureGovernanceService {
  private deadLetters: DeadLetterEnvelope[] = [];

  public captureDeadLetter(reason: string, envelope: unknown, sourceLayer: string): void {
    const deadLetter: DeadLetterEnvelope = {
      deadLetterId: crypto.randomUUID(),
      originalEnvelope: envelope,
      reason,
      timestamp: new Date().toISOString(),
      sourceLayer
    };
    
    this.deadLetters.push(deadLetter);

    traceStore.append({
      traceId: crypto.randomUUID(),
      tenantId: 'local',
      deviceId: deviceIdentityManager.getDeviceId(),
      sourceLayer,
      targetLayer: 'DeadLetterStore',
      timestamp: new Date().toISOString(),
      severity: 'error',
      diagnosticType: 'DEAD_LETTER',
      message: `Dead letter captured: ${reason}`,
      metadata: { deadLetterId: deadLetter.deadLetterId }
    });
  }

  public getDeadLetters(): DeadLetterEnvelope[] {
    return [...this.deadLetters];
  }
}

export const failureGovernanceService = new FailureGovernanceService();
