import { AutomationEnvelope } from './automationTypes';
import { deviceIdentityManager } from '../sync/deviceIdentity';
import { realtimeTransport } from '../realtime/transport';

/**
 * AutomationDispatchService
 * Centralizes dispatch to prevent duplicate executions, ensure stale safety,
 * and provide reconnect-safe operational recommendations.
 *
 * Strictly Append-Only: Dispatching an automation means creating an Envelope
 * that travels through the transport. The backend/engine will execute it.
 */
export class AutomationDispatchService {
  private dispatchedAutomations = new Set<string>();

  /**
   * Evaluates if a given automation has already been dispatched locally
   * to avoid dispatch storms.
   */
  public hasBeenDispatched(automationId: string): boolean {
    return this.dispatchedAutomations.has(automationId);
  }

  /**
   * Safely dispatches an automation envelope across the realtime transport.
   * Ensures idempotency locally.
   */
  public dispatchSafely(envelope: AutomationEnvelope): void {
    if (this.hasBeenDispatched(envelope.automationId)) {
      console.warn(`[Automation] Prevented duplicate dispatch for ${envelope.automationId}`);
      return;
    }

    this.dispatchedAutomations.add(envelope.automationId);

    // Broadcast via RealtimeTransport abstraction
    realtimeTransport.publish<AutomationEnvelope>(
      envelope,
      'automation_dispatch',
      deviceIdentityManager.getDeviceId(),
      envelope.correlationId
    );

    console.info(`[Automation] Dispatched ${envelope.triggerType} for ${envelope.aggregateType}:${envelope.aggregateId}`);
  }
}

export const automationDispatchService = new AutomationDispatchService();
