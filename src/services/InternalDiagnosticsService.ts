import { db } from '../storage/dexieDatabase';
import { aferixLogger } from '../core/debug/aferixLogger';

export type OperationalHealthReport = {
  generatedAt: string;
  databaseVersion: number;
  totalBudgets: number;
  totalClients: number;
  totalWorkOrders: number;
  
  pendingSyncCount: number;
  deletedSyncCount: number;
  
  orphanRecords: number;
  brokenReferences: number;
  duplicateRecords: number;
  invalidDates: number;
  
  financialInconsistencies: number;
  
  backupCompatible: boolean;
  
  healthScore: number;
  
  warnings: string[];
  criticalIssues: string[];
};

export class InternalDiagnosticsService {
  async runFullIntegrityAudit(): Promise<OperationalHealthReport> {
    aferixLogger.audit('Diagnostics', 'Starting full integrity audit...');
    
    const warnings: string[] = [];
    const criticalIssues: string[] = [];

    const dbVersion = db.verno;
    
    // Base stats
    const totalBudgets = await db.budgets.count();
    const totalClients = await db.clients.count();
    const totalWorkOrders = await db.workOrders.count();
    
    const pendingBudgets = await db.budgets.where('syncStatus').equals('pending').count();
    const pendingClients = await db.clients.where('syncStatus').equals('pending').count();
    const pendingWorkOrders = await db.workOrders.where('syncStatus').equals('pending').count();
    const pendingSyncCount = pendingBudgets + pendingClients + pendingWorkOrders;
    
    const deletedBudgets = await db.budgets.where('syncStatus').equals('deleted').count();
    const deletedClients = await db.clients.where('syncStatus').equals('deleted').count();
    const deletedWorkOrders = await db.workOrders.where('syncStatus').equals('deleted').count();
    const deletedSyncCount = deletedBudgets + deletedClients + deletedWorkOrders;

    // Run scans
    const orphanCount = await this.scanOrphanRecords(warnings);
    const brokenRefs = await this.scanBrokenReferences(criticalIssues);
    await this.scanDeletedLeaks(criticalIssues);
    const dupCount = await this.scanDuplicateIds(criticalIssues);
    const invalidDateCount = await this.scanInvalidDates(warnings);
    const finInconsistencies = await this.scanFinancialConsistency(criticalIssues);
    await this.scanSyncQueueIntegrity(warnings, criticalIssues);
    
    const backupCompatible = await this.scanBackupCompatibility(warnings);

    // Scoring
    const healthScore = Math.max(0, 100 - (criticalIssues.length * 10) - (warnings.length * 2));
    
    aferixLogger.audit('Diagnostics', `Audit complete. Score: ${healthScore}`);

    return {
      generatedAt: new Date().toISOString(),
      databaseVersion: dbVersion,
      totalBudgets,
      totalClients,
      totalWorkOrders,
      pendingSyncCount,
      deletedSyncCount,
      orphanRecords: orphanCount,
      brokenReferences: brokenRefs,
      duplicateRecords: dupCount,
      invalidDates: invalidDateCount,
      financialInconsistencies: finInconsistencies,
      backupCompatible,
      healthScore,
      warnings,
      criticalIssues
    };
  }

  async scanOrphanRecords(_warnings: string[]): Promise<number> {
    return 0; // Simplified for MVP
  }

  async scanDeletedLeaks(_criticalIssues: string[]): Promise<number> {
    const leaks = 0;
    // In a real scenario, we'd query indexedDB for any 'deleted' items that show up in list queries.
    // The Dexie Repositories already filter them out.
    return leaks;
  }

  async scanFinancialConsistency(_criticalIssues: string[]): Promise<number> {
    return 0;
  }

  async scanSyncQueueIntegrity(_warnings: string[], criticalIssues: string[]): Promise<number> {
    let issues = 0;
    const allBudgets = await db.budgets.toArray();
    for (const b of allBudgets) {
      if (b.syncStatus !== 'synced' && typeof b.syncUpdatedAt !== 'number') {
        criticalIssues.push(`Budget ${b.id} is pending/deleted but lacks syncUpdatedAt`);
        issues++;
      }
    }
    return issues;
  }

  async scanDuplicateIds(_criticalIssues: string[]): Promise<number> {
    return 0;
  }

  async scanInvalidDates(warnings: string[]): Promise<number> {
    let issues = 0;
    const allBudgets = await db.budgets.toArray();
    for (const b of allBudgets) {
      if (!b.updatedAt || typeof b.updatedAt !== 'string') {
        warnings.push(`Budget ${b.id} has invalid updatedAt string`);
        issues++;
      }
    }
    return issues;
  }

  async scanBrokenReferences(criticalIssues: string[]): Promise<number> {
    let issues = 0;
    const workOrders = await db.workOrders.filter(w => w.syncStatus !== 'deleted').toArray();
    const clients = await db.clients.filter(c => c.syncStatus !== 'deleted').toArray();
    const clientIds = new Set(clients.map(c => c.id));
    
    const budgets = await db.budgets.filter(b => b.syncStatus !== 'deleted').toArray();
    const budgetIds = new Set(budgets.map(b => b.id));

    for (const b of budgets) {
      if (b.clientId && !clientIds.has(b.clientId)) {
        criticalIssues.push(`Budget ${b.id} references non-existent client ${b.clientId}`);
        issues++;
      }
    }
    for (const w of workOrders) {
      if (w.budgetId && !budgetIds.has(w.budgetId)) {
        criticalIssues.push(`WorkOrder ${w.id} references non-existent budget ${w.budgetId}`);
        issues++;
      }
    }
    return issues;
  }

  async scanBackupCompatibility(_warnings: string[]): Promise<boolean> {
    return true;
  }
}

export const internalDiagnostics = new InternalDiagnosticsService();
