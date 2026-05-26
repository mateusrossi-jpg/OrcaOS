import { OperationalCardProjection } from '../../domain/operationalProjections';
import { AutomationEnvelope } from './automationTypes';
import { deviceIdentityManager } from '../sync/deviceIdentity';
import { automationDispatchService } from './automationDispatchService';

/**
 * SLAIntelligenceService
 * Detects SLA risks, breach predictions, and queue saturation.
 * Generates warning envelopes. Does not mutate the workflow directly.
 */
export class SLAIntelligenceService {

  public evaluateSLA(card: OperationalCardProjection): void {
    if (card.slaBreached && !card.stalledWorkflow) {
      const envelope: AutomationEnvelope = {
        automationId: `sla-breach-${card.id}-${card.aging}`,
        aggregateId: card.id,
        aggregateType: 'workorder',
        triggerType: 'SLA_RISK',
        confidence: 1.0, // definitive breach
        timestamp: new Date().toISOString(),
        deviceId: deviceIdentityManager.getDeviceId(),
        dispatchState: 'PENDING',
        decision: {
          decisionId: crypto.randomUUID(),
          type: 'ESCALATE_SLA',
          recommendation: {
            recommendationId: crypto.randomUUID(),
            message: `SLA violado para ${card.title}. Atraso operacional de ${card.executionDelay} dias.`,
            actionLabel: 'Priorizar Execução',
            severity: 'critical'
          }
        }
      };

      automationDispatchService.dispatchSafely(envelope);
    }
  }

  public evaluateActiveWorkflow(cards: readonly OperationalCardProjection[]): void {
    for (const card of cards) {
      this.evaluateSLA(card);
    }
  }
}

export const slaIntelligenceService = new SLAIntelligenceService();
