import { traceStore } from './traceStore';

export interface HealthReport {
  readonly warnings: number;
  readonly errors: number;
  readonly criticals: number;
  readonly healthy: boolean;
}

export class DistributedHealthService {
  public getHealthReport(): HealthReport {
    const traces = traceStore.getRecentTraces(200);
    
    let warnings = 0;
    let errors = 0;
    let criticals = 0;

    for (const trace of traces) {
      if (trace.severity === 'warning') warnings++;
      else if (trace.severity === 'error') errors++;
      else if (trace.severity === 'critical') criticals++;
    }

    // Heuristic: Healthy if there are no criticals and few errors in the last window
    const healthy = criticals === 0 && errors < 5;

    return {
      warnings,
      errors,
      criticals,
      healthy
    };
  }
}

export const distributedHealthService = new DistributedHealthService();
