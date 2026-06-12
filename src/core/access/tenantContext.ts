export class TenantContextService {
  private static companyId: string | null = null;
  private static workspaceId: string | null = null;

  static setContext(companyId: string, workspaceId: string) {
    this.companyId = companyId;
    this.workspaceId = workspaceId;
  }

  static getCompanyId(): string {
    if (!this.companyId || this.companyId === 'default-company') {
      throw new Error('TenantContextError: Missing or invalid companyId. Context not initialized.');
    }
    return this.companyId;
  }

  static getWorkspaceId(): string {
    if (!this.workspaceId || this.workspaceId === 'default-workspace') {
      throw new Error('TenantContextError: Missing or invalid workspaceId. Context not initialized.');
    }
    return this.workspaceId;
  }

  static validateTenantEntity(entity: { companyId?: string; workspaceId?: string }) {
    if (!entity.companyId || entity.companyId === 'default-company') {
      throw new Error('TenantContextError: Attempted to save entity with invalid companyId.');
    }
    if (!entity.workspaceId || entity.workspaceId === 'default-workspace') {
      throw new Error('TenantContextError: Attempted to save entity with invalid workspaceId.');
    }
  }
}
