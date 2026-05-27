import { aferixLogger } from '../core/debug/aferixLogger';

export type UXAnomaly = {
  category: 'workflow_fatigue' | 'interaction_cost' | 'navigation_overload' | 'mobile_ergonomics';
  description: string;
  severity: 'low' | 'medium' | 'high';
};

export const operationalUXAuditService = {
  detectOperationalFriction(recentActions: { actionType: string, timestamp: number }[]): UXAnomaly[] {
    const anomalies: UXAnomaly[] = [];
    // A rapid succession of edits or repeated cancel/saves indicates friction
    const rapidEdits = recentActions.filter(a => a.actionType === 'EDIT_BUDGET' || a.actionType === 'SAVE_DRAFT');
    
    if (rapidEdits.length > 5) {
      anomalies.push({
        category: 'workflow_fatigue',
        description: 'High frequency of edits detected. Possible lack of auto-save or ambiguous form state.',
        severity: 'medium'
      });
    }

    return anomalies;
  },

  detectExcessiveInteractionCost(clickCount: number, taskDurationMs: number): UXAnomaly[] {
    const anomalies: UXAnomaly[] = [];
    
    if (clickCount > 15 && taskDurationMs < 10000) {
      anomalies.push({
        category: 'interaction_cost',
        description: `Excessive clicks (${clickCount}) in a short timeframe. UI may require consolidation or better defaults.`,
        severity: 'high'
      });
    }

    return anomalies;
  },

  detectWorkflowFatigue(sessionDurationMs: number, completedTasks: number): UXAnomaly[] {
    const anomalies: UXAnomaly[] = [];
    const hours = sessionDurationMs / (1000 * 60 * 60);

    if (hours > 2 && completedTasks < 2) {
      anomalies.push({
        category: 'workflow_fatigue',
        description: 'Long session with low completion rate. User might be lost or stuck in analysis paralysis.',
        severity: 'medium'
      });
    }

    return anomalies;
  },

  detectNavigationOverload(routeChanges: number): UXAnomaly[] {
    const anomalies: UXAnomaly[] = [];
    if (routeChanges > 30) {
      anomalies.push({
        category: 'navigation_overload',
        description: 'High route thrashing detected. The user is bouncing between screens too much.',
        severity: 'high'
      });
    }
    return anomalies;
  },

  generateOperationalUXReport(metrics: {
    recentActions: { actionType: string, timestamp: number }[];
    clickCount: number;
    taskDurationMs: number;
    sessionDurationMs: number;
    completedTasks: number;
    routeChanges: number;
  }): UXAnomaly[] {
    const anomalies = [
      ...this.detectOperationalFriction(metrics.recentActions),
      ...this.detectExcessiveInteractionCost(metrics.clickCount, metrics.taskDurationMs),
      ...this.detectWorkflowFatigue(metrics.sessionDurationMs, metrics.completedTasks),
      ...this.detectNavigationOverload(metrics.routeChanges)
    ];

    if (anomalies.length > 0) {
      aferixLogger.warn('OperationalUX', `Detected ${anomalies.length} UX friction points.`);
    }

    return anomalies;
  }
};
