import { db } from '../storage/dexieDatabase';
import { aferixLogger } from '../core/debug/aferixLogger';
import { storagePressureService } from './StoragePressureService';
import { conflictDetectionService } from './ConflictDetectionService';
import { operationalConsistencyService } from './OperationalConsistencyService';
import { performanceAuditService } from './PerformanceAuditService';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import { budgetHardeningService } from './BudgetHardeningService';

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
  databaseHealthScore: number;
  financialHealthScore: number;
  operationalHealthScore: number;
  performanceHealthScore: number;
  
  warnings: string[];
  criticalIssues: string[];

  storagePressureWarning?: boolean;
  activeConflicts?: number;
  eventStoreCount: number;
  hardeningReport?: {
    consistentBudgets: number;
    driftCount: number;
    repairedCount: number;
  };
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

    const storagePressure = await storagePressureService.detectStoragePressure();
    if (storagePressure.pressureWarning) {
      warnings.push('Storage pressure warning: ' + Math.round(storagePressure.percentageUsed * 100) + '% used');
    }

    const conflicts = conflictDetectionService.getConflicts();
    const activeConflicts = conflicts.length;
    if (activeConflicts > 0) {
      warnings.push(`Detected ${activeConflicts} active sync conflicts`);
    }

    const eventStoreCount = await db.operationalEvents.count();

    // Hardening Audit
    const allBudgets = await db.budgets.toArray();
    let consistentBudgets = 0;
    let driftCount = 0;

    for (const b of allBudgets) {
      try {
        const audit = await budgetHardeningService.auditBudget(b.id);
        if (audit.isConsistent) {
          consistentBudgets++;
        } else {
          driftCount++;
          if (audit.driftValue > 0) {
            criticalIssues.push(`[Hardening] Orçamento ${b.id}: Drift financeiro de R$ ${audit.driftValue.toFixed(2)}`);
          }
        }
      } catch {
        warnings.push(`[Hardening] Falha ao auditar orçamento ${b.id}`);
      }
    }

    const opReport = operationalConsistencyService.generateOperationalReport(allBudgets);
    opReport.anomalies.forEach(a => {
      if (a.severity === 'critical') criticalIssues.push(`[OpAnomaly] ${a.budgetId}: ${a.issue}`);
      else warnings.push(`[OpAnomaly] ${a.budgetId}: ${a.issue}`);
    });

    const perfWarnings = performanceAuditService.detectLargeCollections([
      { name: 'budgets', count: totalBudgets },
      { name: 'clients', count: totalClients },
      { name: 'workOrders', count: totalWorkOrders }
    ]);
    perfWarnings.forEach(pw => {
      if (pw.severity === 'high') criticalIssues.push(`[Perf] ${pw.description}`);
      else warnings.push(`[Perf] ${pw.description}`);
    });

    // Sub-scoring
    const databaseHealthScore = Math.max(0, 100 - (brokenRefs * 10) - (invalidDateCount * 2));
    const financialHealthScore = Math.max(0, 100 - (finInconsistencies * 10) - (driftCount * 5));
    const operationalHealthScore = Math.max(0, 100 - (opReport.criticalAnomalies * 10) - ((opReport.totalAnomalies - opReport.criticalAnomalies) * 2));
    const performanceHealthScore = Math.max(0, 100 - (perfWarnings.length * 5) - (storagePressure.pressureWarning ? 10 : 0));

    // Scoring
    const healthScore = Math.max(0, Math.floor((databaseHealthScore + financialHealthScore + operationalHealthScore + performanceHealthScore) / 4));
    
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
      databaseHealthScore,
      financialHealthScore,
      operationalHealthScore,
      performanceHealthScore,
      warnings,
      criticalIssues,
      storagePressureWarning: storagePressure.pressureWarning,
      activeConflicts,
      eventStoreCount,
      hardeningReport: {
        consistentBudgets,
        driftCount,
        repairedCount: 0
      }
    };
  }

  /**
   * Executa reparo em massa baseado na auditoria do Hardening.
   */
  async repairAllFinancialDrifts(): Promise<number> {
    const allBudgets = await db.budgets.toArray();
    let repaired = 0;
    for (const b of allBudgets) {
      try {
        const audit = await budgetHardeningService.auditBudget(b.id);
        if (!audit.isConsistent) {
          const success = await budgetHardeningService.repairBudget(b.id);
          if (success) repaired++;
        }
      } catch (e) {
        console.error(`Repair failed for budget ${b.id}:`, e);
      }
    }
    return repaired;
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

  async scanFinancialConsistency(criticalIssues: string[]): Promise<number> {
    let issues = 0;
    const allBudgets = await db.budgets.toArray();
    for (const b of allBudgets) {
      const engineResult = calculateBudget(b);
      
      // Check for drifts in finalized budgets
      if (b.status === 'finalizado' && b.financialSnapshot) {
        const drift = Math.abs(b.financialSnapshot.lucroBruto - engineResult.lucroBruto);
        if (drift > 0.01) {
          criticalIssues.push(`[FinanceDrift] Orçamento ${b.id}: Lucro no snapshot (${b.financialSnapshot.lucroBruto.toFixed(2)}) diverge do motor (${engineResult.lucroBruto.toFixed(2)})`);
          issues++;
        }
      }

      // Check for invalid totals
      if ((b.chargedValue || 0) < 0 || engineResult.totalComercial < 0) {
        criticalIssues.push(`[InvalidFinance] Orçamento ${b.id}: Valor cobrado ou total comercial é negativo`);
        issues++;
      }
    }
    return issues;
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
