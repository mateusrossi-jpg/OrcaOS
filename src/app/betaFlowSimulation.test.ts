import { describe, it, expect } from 'vitest';
import { Budget } from '../domain/budget';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { BudgetService } from '../services/budgetService';

describe.skip('Beta Workflow Simulation', () => {
  const persistence = new BudgetPersistenceService();
  const service = new BudgetService();

  it('completes a full budget lifecycle in beta', async () => {
    const mockBudget: Budget = {
      id: 'beta-1',
      clientId: 'client-1',
      title: 'Instalação Beta',
      items: [
        { id: 'item-1', description: 'Mão de obra', quantity: 1, unitPrice: 500, category: 'labor' }
      ],
      status: 'iniciado',
      chargedValue: 500,
      materialCost: 0,
      travelCost: 0,
      helperCost: 0,
      fees: 0,
      discounts: 0,
      otherCosts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Save
    await persistence.saveBudget(mockBudget);
    let loaded = await persistence.getBudget('beta-1');
    expect(loaded?.title).toBe('Instalação Beta');

    // 2. Transition
    await service.finalizeBudget(mockBudget);
    loaded = await persistence.getBudget('beta-1');
    expect(loaded?.status).toBe('finalizado');
    expect(loaded?.finalizedAt).toBeDefined();
  });
});
