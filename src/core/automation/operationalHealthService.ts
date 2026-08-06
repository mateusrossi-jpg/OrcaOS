import { OperationalBoardProjection } from '../../domain/operationalProjections';

export interface OperationalHealthMetrics {
  readonly executionPressure: number; // 0 to 1
  readonly queueSaturation: number; // 0 to 1
  readonly workflowHealth: number; // 0 to 1
}

/**
 * OperationalHealthService
 * Computes global ERP health indices based on board projections.
 * Used for high-level UI insights and orchestration gating.
 */
export class OperationalHealthService {

  public computeGlobalHealth(board: OperationalBoardProjection): OperationalHealthMetrics {
    const totalActive = board.approved.length + board.authorized.length + board.inExecution.length;
    const totalStalled = board.inExecution.filter(c => c.stalledWorkflow || c.overdue).length;

    // Execution Pressure: ratio of inExecution to total active workflow
    const executionPressure = totalActive > 0 ? board.inExecution.length / totalActive : 0;

    // Queue Saturation: ratio of stalled/overdue to inExecution
    const queueSaturation = board.inExecution.length > 0 ? totalStalled / board.inExecution.length : 0;

    // Workflow Health: Inverse of saturation, slightly penalized by pressure
    const workflowHealth = Math.max(0, 1 - (queueSaturation * 0.7 + executionPressure * 0.3));

    return {
      executionPressure,
      queueSaturation,
      workflowHealth
    };
  }
}

export const operationalHealthService = new OperationalHealthService();
