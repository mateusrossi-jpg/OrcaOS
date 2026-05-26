export interface PilotSessionMetric {
  readonly workOrderId: string;
  readonly durationMinutes: number;
  readonly reconnectCount: number;
  readonly attachmentCount: number;
  readonly highestIdleMinutes: number;
  readonly timestamp: string;
}

/**
 * PilotUsageMetrics
 * Bounded, local-first telemetry to measure real-world friction.
 * No heavy analytics SDK required.
 */
export class PilotUsageMetrics {
  private metrics: PilotSessionMetric[] = [];
  private readonly MAX_SESSIONS = 50;

  public logSession(metric: Omit<PilotSessionMetric, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: new Date().toISOString()
    });

    if (this.metrics.length > this.MAX_SESSIONS) {
      this.metrics.shift();
    }
    
    // In a real app, this flushes slowly to the backend via SyncEnvelope
    console.info(`[PilotMetrics] Logged session for OS ${metric.workOrderId}. Duration: ${metric.durationMinutes}m`);
  }

  public getAggregatedStats() {
    if (this.metrics.length === 0) return null;
    
    const avgDuration = this.metrics.reduce((acc, curr) => acc + curr.durationMinutes, 0) / this.metrics.length;
    const totalReconnects = this.metrics.reduce((acc, curr) => acc + curr.reconnectCount, 0);

    return {
      sessionsTracked: this.metrics.length,
      averageDurationMinutes: Math.round(avgDuration),
      totalNetworkDrops: totalReconnects
    };
  }
}

export const pilotUsageMetrics = new PilotUsageMetrics();
