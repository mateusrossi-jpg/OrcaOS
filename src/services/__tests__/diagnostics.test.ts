import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { internalDiagnostics } from '../InternalDiagnosticsService';
import { db } from '../../storage/dexieDatabase';
import { Budget } from '../../domain/budget';

describe('Internal Diagnostics Service', () => {
  beforeEach(async () => {
    await db.budgets.clear();
    await db.clients.clear();
    await db.workOrders.clear();
  });

  it('runs full integrity audit with perfect score initially', async () => {
    const report = await internalDiagnostics.runFullIntegrityAudit();
    expect(report.healthScore).toBe(100);
    expect(report.totalBudgets).toBe(0);
    expect(report.criticalIssues.length).toBe(0);
  });

  it('detects sync queue integrity issues (missing syncUpdatedAt)', async () => {
    await db.budgets.add({
      id: 'b1',
      clientId: 'c1',
      title: 'Bad Budget',
      status: 'iniciado',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      // syncUpdatedAt is missing!
      items: [],
      pricing: {
        totalMaterialCost: 0, totalFixedCost: 0, totalVariableCost: 0,
        subcontractorCost: 0, riskMarginCost: 0, preTaxProfitMargin: 0,
        taxes: [], totalTaxes: 0, totalProfit: 0, calculatedPrice: 0,
        roundedPrice: 0, selectedPrice: 0
      }
    } as unknown as Budget);

    const warnings: string[] = [];
    const criticalIssues: string[] = [];
    const issues = await internalDiagnostics.scanSyncQueueIntegrity(warnings, criticalIssues);
    
    expect(issues).toBe(1);
    expect(criticalIssues[0]).toContain('lacks syncUpdatedAt');
  });

  it('detects invalid dates (updatedAt missing)', async () => {
    await db.budgets.add({
      id: 'b2',
      clientId: 'c1',
      title: 'No Date Budget',
      status: 'iniciado',
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
      syncUpdatedAt: Date.now(),
      // updatedAt is missing!
      items: [],
      pricing: {
        totalMaterialCost: 0, totalFixedCost: 0, totalVariableCost: 0,
        subcontractorCost: 0, riskMarginCost: 0, preTaxProfitMargin: 0,
        taxes: [], totalTaxes: 0, totalProfit: 0, calculatedPrice: 0,
        roundedPrice: 0, selectedPrice: 0
      }
    } as unknown as Budget);

    const warnings: string[] = [];
    const issues = await internalDiagnostics.scanInvalidDates(warnings);
    
    expect(issues).toBe(1);
    expect(warnings[0]).toContain('invalid updatedAt string');
  });

  it('detects broken references (budget missing client)', async () => {
    await db.budgets.add({
      id: 'b3',
      clientId: 'NON_EXISTENT_CLIENT',
      title: 'Broken Ref Budget',
      status: 'iniciado',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
      syncUpdatedAt: Date.now(),
      items: []
    } as unknown as Budget);

    const criticalIssues: string[] = [];
    const issues = await internalDiagnostics.scanBrokenReferences(criticalIssues);
    
    expect(issues).toBe(1);
    expect(criticalIssues[0]).toContain('references non-existent client NON_EXISTENT_CLIENT');
  });
});
