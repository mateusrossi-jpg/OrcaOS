import { SyncOutboxItem } from '../database/schema';

export class TenantIntegrityGuard {
  /**
   * Validates if the mutation belongs to the current active session (tenant and user).
   * @throws {Error} if there's a security mismatch
   */
  static validateMutationOwnership(mutation: SyncOutboxItem): void {
    const currentTenant = localStorage.getItem('tenant');
    const currentUser = localStorage.getItem('user_id');

    if (!currentTenant || !currentUser) {
      throw new Error('TenantIntegrityGuard: No active session found.');
    }

    if (mutation.tenant_id !== currentTenant) {
      throw new Error(`TenantIntegrityGuard: Mismatch. Mutation tenant_id (${mutation.tenant_id}) != Session tenant_id (${currentTenant})`);
    }

    if (mutation.user_id !== currentUser) {
      throw new Error(`TenantIntegrityGuard: Mismatch. Mutation user_id (${mutation.user_id}) != Session user_id (${currentUser})`);
    }

    // Checking payload if it has tenant_id
    if (mutation.payload && mutation.payload.tenant_id && mutation.payload.tenant_id !== currentTenant) {
       throw new Error(`TenantIntegrityGuard: Payload tenant_id mismatch.`);
    }
  }
}
