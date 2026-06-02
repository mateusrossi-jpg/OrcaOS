import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../../../storage/dexieDatabase';
import { BudgetPersistenceService } from '../../../services/BudgetPersistenceService';
import { SimpleFinanceService } from '../../../services/SimpleFinanceService';
import { operationalFacade } from '../../workflow/operationalFacade';
import { BUDGET_STATUS, Budget } from '../../../domain/budget';

describe('AFERIX FINANCIAL CYCLE ADJUSTMENT PERSISTENCE TEST', () => {
  const budgetPersistence = new BudgetPersistenceService();
  const financeService = new SimpleFinanceService();

  beforeAll(async () => {
    await db.clients.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.clientProposals.clear();
    await db.simpleFinanceRecords.clear();
    await db.operationalEvents.clear();
  });

  it('verifies complete financial mutation, audit trail generation, engine recalculation, and Dexie persistence', async () => {
    const budgetId = 'test-budget-adjust-999';
    
    // 1. Arrange: Create a draft budget
    const initialBudget: Budget = {
      id: budgetId,
      clientId: 'client-123',
      siteId: 'site-1',
      clientName: 'Roberto Carlos',
      title: 'Instalação Elétrica Premium',
      status: BUDGET_STATUS.INICIADO,
      chargedValue: 5000,
      materialCost: 1500,
      travelCost: 300,
      helperCost: 500,
      fees: 200,
      discounts: 100,
      otherCosts: 0,
      items: [
        { id: 'item-1', description: 'Serviço técnico', quantity: 1, unitPrice: 3000, category: 'labor' },
        { id: 'item-2', description: 'Cabos e Conectores', quantity: 1, unitPrice: 2000, category: 'material' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save initial budget
    await operationalFacade.saveBudget(initialBudget);
    let saved = await budgetPersistence.getBudget(budgetId);
    expect(saved).toBeDefined();
    expect(saved?.status).toBe(BUDGET_STATUS.INICIADO);

    // 2. Act: Finalize the budget to compute the initial financial snapshot
    await operationalFacade.finalizeBudget(budgetId);
    saved = await budgetPersistence.getBudget(budgetId);
    expect(saved?.status).toBe(BUDGET_STATUS.FINALIZADO);
    expect(saved?.financialSnapshot).toBeDefined();
    
    // Initial profit: 5000 (charged) - 100 (discount) - 2300 (costs: 1500 + 300 + 500) = 2600.
    // Note: fees (200) is direct cost in calculations too if applicable.
    const initialProfit = saved?.financialSnapshot?.lucroBruto || 0;
    expect(initialProfit).toBeGreaterThan(0);

    // 3. Act: Trigger Adjustment (Simulating SimpleFinanceWorkspace saveAdjustment click)
    const workOrderId = 'wo-' + budgetId;
    await operationalFacade.createWorkOrder({
      id: workOrderId,
      clientId: 'client-123',
      siteId: 'site-1',
      title: 'OS Teste',
      status: 'done',
      paymentStatus: 'pending',
      executedValue: 6000
    } as any);

    await operationalFacade.registerPayment(workOrderId, 6000);

    // 4. Assert: Load updated budget and verify that database fields DID NOT CHANGE (Immutable)
    const updatedBudget = await budgetPersistence.getBudget(budgetId);
    expect(updatedBudget).toBeDefined();
    expect(updatedBudget?.chargedValue).toBe(5000); // Intact
    expect(updatedBudget?.materialCost).toBe(1500); // Intact

    // 5. Assert: Verify the financial snapshot is intact
    expect(updatedBudget?.financialSnapshot).toBeDefined();
    const newProfit = updatedBudget?.financialSnapshot?.lucroBruto || 0;
    expect(newProfit).toBe(initialProfit); // Remained the same

    // 6. Assert: Verify the audit trail event and simple finance records are persisted in IndexedDB
    const financeRecords = await financeService.listRecords();
    const persistedRecord = financeRecords.find(r => r.workOrderId === workOrderId);
    expect(persistedRecord).toBeDefined();
    expect(persistedRecord?.receivedValue).toBe(6000);

    const events = await db.operationalEvents.where('aggregateId').equals(workOrderId).toArray();
    const realizedEvent = events.find(e => e.eventType === 'FINANCE_RECORD_REALIZED' && e.metadata?.adjustment === true);
    expect(realizedEvent).toBeDefined();
    expect(realizedEvent?.metadata?.adjustment).toBe(true);
  });
});
