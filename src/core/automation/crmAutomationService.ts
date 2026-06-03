import { generateUUID } from '../utils/idGenerator';
import { OperationalCardProjection } from '../../domain/operationalProjections';
import { AutomationEnvelope } from './automationTypes';
import { deviceIdentityManager } from '../sync/deviceIdentity';
import { automationDispatchService } from './automationDispatchService';

/**
 * CRMAutomationService
 * Evaluates CRM pipeline projections and generates recommendation envelopes
 * for aging, abandoned proposals, and inactive clients.
 * 
 * Consumer-Only: Does not mutate projections. Only derives operational insights.
 */
export class CRMAutomationService {

  public evaluateAbandonedProposal(card: OperationalCardProjection): void {
    if (card.currentStatus === 'PROPOSAL_SENT' && card.aging > 7) {
      const envelope: AutomationEnvelope = {
        automationId: `crm-abandoned-${card.id}-${card.aging}`,
        aggregateId: card.id,
        aggregateType: 'proposal',
        triggerType: 'ABANDONED_PROPOSAL',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        deviceId: deviceIdentityManager.getDeviceId(),
        dispatchState: 'PENDING',
        decision: {
          decisionId: generateUUID(),
          type: 'SEND_FOLLOWUP',
          recommendation: {
            recommendationId: generateUUID(),
            message: `Proposta ${card.title} enviada há ${card.aging} dias sem resposta. Sugestão: Enviar follow-up via WhatsApp.`,
            actionLabel: 'Enviar Follow-up',
            severity: 'warning'
          }
        }
      };

      automationDispatchService.dispatchSafely(envelope);
    }
  }

  public evaluatePipeline(cards: readonly OperationalCardProjection[]): void {
    for (const card of cards) {
      this.evaluateAbandonedProposal(card);
    }
  }
}

export const crmAutomationService = new CRMAutomationService();
