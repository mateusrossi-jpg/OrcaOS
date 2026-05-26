import { ClientPipelineProjection } from '../../domain/operationalProjections';
import { AutomationEnvelope } from './automationTypes';
import { deviceIdentityManager } from '../sync/deviceIdentity';
import { automationDispatchService } from './automationDispatchService';

/**
 * RecurringAutomationService
 * Detects recurring maintenance candidates based on client history and pipeline status.
 * Foundation for generating periodic visits without forcing automatic schedules yet.
 */
export class RecurringAutomationService {

  public evaluateClientForRecurring(client: ClientPipelineProjection): void {
    if (client.status === 'recurring_candidate' && client.activeBudgets === 0) {
      // Calculate days since last interaction
      const lastInteraction = new Date(client.lastInteractionAt).getTime();
      const now = new Date().getTime();
      const daysSince = Math.floor((now - lastInteraction) / (1000 * 60 * 60 * 24));

      if (daysSince > 180) { // Example: 6 months since last interaction
        const envelope: AutomationEnvelope = {
          automationId: `recurring-${client.clientId}-${daysSince}`,
          aggregateId: client.clientId,
          aggregateType: 'client',
          triggerType: 'RECURRING_CANDIDATE',
          confidence: 0.80,
          timestamp: new Date().toISOString(),
          deviceId: deviceIdentityManager.getDeviceId(),
          dispatchState: 'PENDING',
          decision: {
            decisionId: crypto.randomUUID(),
            type: 'SUGGEST_MAINTENANCE',
            recommendation: {
              recommendationId: crypto.randomUUID(),
              message: `Cliente ${client.clientName} sem atendimento há ${daysSince} dias. Sugerir manutenção preventiva?`,
              actionLabel: 'Criar Proposta de Manutenção',
              severity: 'info'
            }
          }
        };

        automationDispatchService.dispatchSafely(envelope);
      }
    }
  }
}

export const recurringAutomationService = new RecurringAutomationService();
