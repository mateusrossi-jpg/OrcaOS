/**
 * Multi-Tenant Foundation
 * Ensures strict logical isolation between different company workspaces
 * on the distributed backend.
 */

export interface TenantContext {
  readonly tenantId: string;
  readonly companyName: string;
  readonly planType: 'free' | 'pro' | 'enterprise';
  readonly isActive: boolean;
}

export interface TenantEnvelope<T> {
  readonly tenantId: string;
  readonly payload: T;
}

export class TenantIsolationGuard {
  
  /**
   * Validates that an incoming payload matches the current active tenant context.
   * Throws an error if there is a tenant mismatch, preventing cross-tenant leakage.
   */
  public static assertTenantMatch<T>(context: TenantContext, envelope: TenantEnvelope<T>): void {
    if (context.tenantId !== envelope.tenantId) {
      throw new Error(`[Security] Tenant mismatch detected. Expected ${context.tenantId}, got ${envelope.tenantId}`);
    }
    
    if (!context.isActive) {
      throw new Error(`[Security] Tenant ${context.tenantId} is inactive.`);
    }
  }

  /**
   * Wraps an untrusted payload into a strictly verified TenantEnvelope.
   */
  public static wrap<T>(context: TenantContext, payload: T): TenantEnvelope<T> {
    return {
      tenantId: context.tenantId,
      payload
    };
  }
}
