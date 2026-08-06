type TelemetryEvent =
  | 'sync_started' | 'sync_completed' | 'sync_failed'
  | 'bootstrap_started' | 'bootstrap_completed' | 'bootstrap_failed'
  | 'storage_pressure_warning' | 'storage_blocked'
  | 'browser_crash_detected' | 'memory_pressure'
  | 'conflict_created' | 'conflict_resolved'
  | 'mutation_blocked_security' | 'rls_denied';

export interface TelemetryPayload {
  tenantId: string;
  userId: string;
  event: TelemetryEvent;
  metadata?: Record<string, any>;
  timestamp: string;
  correlationId: string;
}

export class TelemetryService {
  private _queue: TelemetryPayload[] = [];

  // No mundo real isso apontaria para um Sentry, PostHog, ou Datadog
  track(event: TelemetryEvent, correlationId: string, metadata?: Record<string, any>) {
    const tenantId = localStorage.getItem('tenant') || 'unknown';
    const userId = localStorage.getItem('user_id') || 'unknown';

    const payload: TelemetryPayload = {
      tenantId,
      userId,
      event,
      metadata,
      timestamp: new Date().toISOString(),
      correlationId
    };

    this._queue.push(payload);
    this.flush();
  }

  private async flush() {
    if (this._queue.length === 0) return;

    const events = [...this._queue];
    this._queue = [];

    try {
      // Fake API request
      // await fetch('https://telemetry.aferix.com/events', { method: 'POST', body: JSON.stringify(events) });
      console.log('[Telemetry] Flushed events:', events.length);
    } catch (err) {
      // Se falhar a rede, devolvemos pra queue e tentamos depois
      this._queue.unshift(...events);
    }
  }
}

export const telemetryService = new TelemetryService();
