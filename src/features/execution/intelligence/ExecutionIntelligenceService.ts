export interface ExecutionRiskProfile {
  readonly slaRisk: 'low' | 'medium' | 'high' | 'critical';
  readonly isBlocked: boolean;
  readonly idleTimeMinutes: number;
  readonly hasPendingDependencies: boolean;
  readonly recommendedEscalation: boolean;
}

export interface ExecutionContext {
  readonly workOrderId: string;
  readonly slaMinutesRemaining: number;
  readonly blockReason?: string;
  readonly lastActivityAt: string;
  readonly pendingMaterials: number;
}

/**
 * ExecutionIntelligenceService
 * Derives operational risk without mutating state or workflow.
 * Projection-driven. Consumer-only.
 */
export class ExecutionIntelligenceService {
  public deriveRiskProfile(context: ExecutionContext): ExecutionRiskProfile {
    const idleMs = Date.now() - new Date(context.lastActivityAt).getTime();
    const idleMinutes = Math.floor(idleMs / 60000);

    const slaRisk = 
      context.slaMinutesRemaining < 0 ? 'critical' :
      context.slaMinutesRemaining < 30 ? 'high' :
      context.slaMinutesRemaining < 60 ? 'medium' : 'low';

    return {
      slaRisk,
      isBlocked: !!context.blockReason,
      idleTimeMinutes: idleMinutes,
      hasPendingDependencies: context.pendingMaterials > 0,
      recommendedEscalation: context.slaMinutesRemaining < -30 || (!!context.blockReason && idleMinutes > 60)
    };
  }
}

export const executionIntelligenceService = new ExecutionIntelligenceService();
