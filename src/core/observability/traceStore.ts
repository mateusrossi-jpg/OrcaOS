import { TraceEnvelope } from './traceTypes';

/**
 * TraceStore
 * Bounded retention for observability traces. Prevents infinite memory growth.
 * Reconnect-safe and append-only.
 */
export class TraceStore {
  private traces: TraceEnvelope[] = [];
  private readonly MAX_TRACES = 1000;

  public append(trace: TraceEnvelope): void {
    this.traces.push(trace);
    if (this.traces.length > this.MAX_TRACES) {
      this.traces.shift(); // Bounded retention: drop oldest
    }
  }

  public getRecentTraces(limit: number = 50): TraceEnvelope[] {
    return this.traces.slice(-limit).reverse(); // Latest first
  }

  public getTracesBySeverity(severity: TraceEnvelope['severity']): TraceEnvelope[] {
    return this.traces.filter(t => t.severity === severity).reverse();
  }
}

export const traceStore = new TraceStore();
