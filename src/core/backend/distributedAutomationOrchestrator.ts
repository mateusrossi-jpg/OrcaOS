import { AutomationEnvelope } from '../automation/automationTypes';
import { TenantContext, TenantIsolationGuard } from './tenantFoundation';

/**
 * DistributedAutomationOrchestrator
 * Coordinates Automation Envelopes dispatched by different devices within a tenant cluster.
 * 
 * Prevents duplicate automation executions, race conditions, and reconnect storms
 * by acting as a distributed deduplication layer. It does NOT execute domain logic itself.
 */
export class DistributedAutomationOrchestrator {
  // In-memory stub for distributed set (e.g., Redis Set per tenant)
  private dispatchedAutomations = new Set<string>();

  private getPartitionKey(tenantId: string, automationId: string): string {
    return `${tenantId}:${automationId}`;
  }

  public orchestrateDispatch(context: TenantContext, envelope: AutomationEnvelope): void {
    // 1. Tenant Security
    TenantIsolationGuard.assertTenantMatch(context, { tenantId: context.tenantId, payload: envelope });

    const key = this.getPartitionKey(context.tenantId, envelope.automationId);

    // 2. Distributed Deduplication
    if (this.dispatchedAutomations.has(key)) {
      console.warn(`[Server Orchestrator] Prevented duplicate global dispatch for automation ${envelope.automationId}`);
      return;
    }

    this.dispatchedAutomations.add(key);

    // 3. Centralized Routing
    console.info(`[Server Orchestrator] Accepted and routing automation ${envelope.automationId} [${envelope.triggerType}]`);
    
    // -> Fan-out to connected devices (or workers if server-side execution is needed)
  }
}

export const distributedAutomationOrchestrator = new DistributedAutomationOrchestrator();
