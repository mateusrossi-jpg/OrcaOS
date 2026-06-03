import { generateUUID } from '../utils/idGenerator';
import { OperationalCardProjection } from '../../domain/operationalProjections';
import { AutomationEnvelope } from './automationTypes';
import { deviceIdentityManager } from '../sync/deviceIdentity';
import { automationDispatchService } from './automationDispatchService';

/**
 * TechnicianIntelligenceService
 * Evaluates operational execution to derive workload pressure, execution bottlenecks,
 * and technician overload risks without toxic gamification.
 * 
 * Consumer-Only: Evaluates projections to generate insight envelopes.
 */
export class TechnicianIntelligenceService {

  public evaluateWorkloadPressure(inExecutionCards: readonly OperationalCardProjection[]): void {
    // Identify bottlenecks per technician
    const workloadMap = new Map<string, number>();
    const delayedMap = new Map<string, number>();

    for (const card of inExecutionCards) {
      if (card.assignedTechnician) {
        workloadMap.set(card.assignedTechnician, (workloadMap.get(card.assignedTechnician) || 0) + 1);
        if (card.overdue || card.executionDelay > 0) {
          delayedMap.set(card.assignedTechnician, (delayedMap.get(card.assignedTechnician) || 0) + 1);
        }
      }
    }

    for (const [technician, count] of workloadMap.entries()) {
      if (count > 5) { // Threshold for overload
        const delayed = delayedMap.get(technician) || 0;
        const severity = delayed > 2 ? 'critical' : 'warning';
        
        const envelope: AutomationEnvelope = {
          automationId: `tech-overload-${technician}-${new Date().toISOString().split('T')[0]}`,
          aggregateId: technician,
          aggregateType: 'technician',
          triggerType: 'TECHNICIAN_OVERLOAD',
          confidence: 0.90,
          timestamp: new Date().toISOString(),
          deviceId: deviceIdentityManager.getDeviceId(),
          dispatchState: 'PENDING',
          decision: {
            decisionId: generateUUID(),
            type: 'FLAG_RISK',
            recommendation: {
              recommendationId: generateUUID(),
              message: `Técnico com ${count} ordens simultâneas (${delayed} atrasadas). Risco de gargalo na execução.`,
              actionLabel: 'Revisar Fila',
              severity
            }
          }
        };

        automationDispatchService.dispatchSafely(envelope);
      }
    }
  }
}

export const technicianIntelligenceService = new TechnicianIntelligenceService();
