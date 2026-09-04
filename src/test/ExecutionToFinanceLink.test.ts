import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { SimpleFinanceService } from '../services/SimpleFinanceService';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { workOrderService } from '../services/workOrderService';
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { ConsumedPartItem } from '../core/types/business';

describe('Execution to Finance Link & Real Parts Cost (Sprint Verification)', () => {
  const financeService = new SimpleFinanceService();
  const budgetPersistence = new BudgetPersistenceService();

  beforeEach(async () => {
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.inventoryItems.clear();
    await db.stockMovements.clear();
    await db.operationalEvents.clear();
    await db.clients.clear();

    await db.clients.add({
      id: 'client-audit-1',
      name: 'Cliente Auditoria E2E',
      phone: '11999999999',
      companyId: 'company-a',
      workspaceId: 'workspace-a',
      syncStatus: 'synced',
      syncUpdatedAt: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Adiciona itens no inventário
    await db.inventoryItems.bulkAdd([
      {
        id: 'inv-item-1',
        companyId: 'company-a',
        workspaceId: 'workspace-a',
        name: 'Disjuntor Bipolar 32A',
        sku: 'DISJ-32A',
        quantityOnHand: 10,
        minimumStock: 2,
        unitCost: 45.0,
        status: 'IN_STOCK',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'inv-item-2',
        companyId: 'company-a',
        workspaceId: 'workspace-a',
        name: 'Cabo Flexível 6mm',
        sku: 'CABO-6MM',
        quantityOnHand: 50,
        minimumStock: 10,
        unitCost: 8.0,
        status: 'IN_STOCK',
        lastUpdated: new Date().toISOString()
      }
    ]);
  });

  it('1. Deve preservar o orçamento original intacto mesmo quando o consumo for diferente', async () => {
    const budgetId = 'budget-test-1';
    const originalBudget: Budget = {
      id: budgetId,
      title: 'Instalação de Quadro Elétrico',
      clientId: 'client-audit-1',
      siteId: 'site-1',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 1500,
      materialCost: 200,
      travelCost: 50,
      helperCost: 0,
      fees: 0,
      discounts: 0,
      otherCosts: 0,
      items: [
        { id: 'bi-1', description: 'Mão de Obra', quantity: 1, unitPrice: 1300, category: 'labor' },
        { id: 'bi-2', description: 'Disjuntor Bipolar 32A', quantity: 2, unitPrice: 100, category: 'material', catalogId: 'DISJ-32A' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await budgetPersistence.saveBudget(originalBudget);

    const woId = 'wo-test-1';
    await workOrderService.add({
      id: woId,
      clientId: 'client-audit-1',
      budgetId: budgetId,
      title: 'Instalação de Quadro Elétrico',
      status: 'in-progress',
      paymentStatus: 'pending',
      executedValue: 1500,
      companyId: 'company-a',
      workspaceId: 'workspace-a',
      syncStatus: 'pending',
      syncUpdatedAt: Date.now()
    });

    // Execução consumindo 3 disjuntores ao invés de 2 (consumo maior + peça extra)
    const consumedParts: ConsumedPartItem[] = [
      { id: 'cp-1', sku: 'DISJ-32A', name: 'Disjuntor Bipolar 32A', quantity: 3, unitCost: 45.0 }
    ];

    await operationalFacade.completeWorkOrder(woId, 1500, 1500, 'Concluído com 3 disjuntores', consumedParts);

    // Orçamento original NÃO deve ter sido alterado
    const savedBudget = await budgetPersistence.getBudget(budgetId);
    expect(savedBudget).toBeDefined();
    expect(savedBudget?.items.length).toBe(2);
    expect(savedBudget?.items[1].quantity).toBe(2);
    expect(savedBudget?.materialCost).toBe(200);

    // WorkOrder deve conter consumedParts e status done
    const savedWO = await workOrderService.getById(woId);
    expect(savedWO?.status).toBe('done');
    expect(savedWO?.consumedParts?.length).toBe(1);
    expect(savedWO?.consumedParts?.[0].quantity).toBe(3);

    // SimpleFinanceRecord deve refletir o custo REAL (3 * 45 = 135) e não o orçado
    const financeRecords = await financeService.listRecords();
    const record = financeRecords.find(r => r.workOrderId === woId);
    expect(record).toBeDefined();
    expect(record?.materialCost).toBe(135.0); // 3 * 45.0
    expect(record?.expectedValue).toBe(1500);
    expect(record?.receivedValue).toBe(1500);
  });

  it('2. Deve baixar o estoque SOMENTE das peças e quantidades consumidas em campo', async () => {
    const woId = 'wo-test-stock';
    await workOrderService.add({
      id: woId,
      clientId: 'client-audit-1',
      title: 'Serviço de Fiação',
      status: 'in-progress',
      paymentStatus: 'pending',
      executedValue: 800,
      companyId: 'company-a',
      workspaceId: 'workspace-a',
      syncStatus: 'pending',
      syncUpdatedAt: Date.now()
    });

    const consumedParts: ConsumedPartItem[] = [
      { id: 'cp-2', sku: 'CABO-6MM', name: 'Cabo Flexível 6mm', quantity: 15, unitCost: 8.0 }
    ];

    await operationalFacade.completeWorkOrder(woId, 800, 800, 'Fiação finalizada', consumedParts);

    const updatedItem = await db.inventoryItems.get('inv-item-2');
    expect(updatedItem?.quantityOnHand).toBe(35); // 50 inicial - 15 consumido = 35

    const allMovements = await db.stockMovements.toArray();
    const movements = allMovements.filter(m => m.referenceId === woId);
    expect(movements.length).toBe(1);
    expect(movements[0].quantity).toBe(15);
    expect(movements[0].type).toBe('OUT');
  });

  it('3. Deve processar peças sem cadastro no estoque sem travar e computar o custo financeiro', async () => {
    const woId = 'wo-test-nostock';
    await workOrderService.add({
      id: woId,
      clientId: 'client-audit-1',
      title: 'Troca de Peça Avulsa',
      status: 'in-progress',
      paymentStatus: 'pending',
      executedValue: 400,
      companyId: 'company-a',
      workspaceId: 'workspace-a',
      syncStatus: 'pending',
      syncUpdatedAt: Date.now()
    });

    const consumedParts: ConsumedPartItem[] = [
      { id: 'cp-unregistered', sku: 'PARAFUSO-ESPEC', name: 'Parafuso Especial Não Cadastrado', quantity: 10, unitCost: 2.5 }
    ];

    await operationalFacade.completeWorkOrder(woId, 400, 400, 'Peça avulsa comprada no depósito', consumedParts);

    const savedWO = await workOrderService.getById(woId);
    expect(savedWO?.status).toBe('done');

    const financeRecords = await financeService.listRecords();
    const record = financeRecords.find(r => r.workOrderId === woId);
    expect(record).toBeDefined();
    expect(record?.materialCost).toBe(25.0); // 10 * 2.5
  });

  it('4. Deve garantir idempotência sem duplicar baixas de estoque ou registros financeiros em reprocessamentos', async () => {
    const woId = 'wo-test-idempotency';
    await workOrderService.add({
      id: woId,
      clientId: 'client-audit-1',
      title: 'Manutenção Padrão',
      status: 'in-progress',
      paymentStatus: 'pending',
      executedValue: 600,
      companyId: 'company-a',
      workspaceId: 'workspace-a',
      syncStatus: 'pending',
      syncUpdatedAt: Date.now()
    });

    const consumedParts: ConsumedPartItem[] = [
      { id: 'cp-1', sku: 'DISJ-32A', name: 'Disjuntor Bipolar 32A', quantity: 1, unitCost: 45.0 }
    ];

    // Primeira finalização
    await operationalFacade.completeWorkOrder(woId, 600, 600, 'Primeira chamada', consumedParts);

    const initialItem = await db.inventoryItems.get('inv-item-1');
    expect(initialItem?.quantityOnHand).toBe(9); // 10 - 1 = 9

    // Reprocessamento da mesma OS
    await operationalFacade.completeWorkOrder(woId, 600, 600, 'Segunda chamada reprocessada', consumedParts);

    const itemAfterRetry = await db.inventoryItems.get('inv-item-1');
    expect(itemAfterRetry?.quantityOnHand).toBe(9); // Permanece 9, sem dupla baixa

    const allMovements = await db.stockMovements.toArray();
    const movements = allMovements.filter(m => m.referenceId === woId);
    expect(movements.length).toBe(1);

    const financeRecords = await financeService.listRecords();
    const recordsForWO = financeRecords.filter(r => r.workOrderId === woId);
    expect(recordsForWO.length).toBe(1); // Sem duplicação financeira
  });

  it('5. Deve manter fallback legado quando consumedParts não for enviado (ex: OS antiga ou QuickService)', async () => {
    const budgetId = 'budget-legacy-fallback';
    const legacyBudget: Budget = {
      id: budgetId,
      title: 'Serviço Legado',
      clientId: 'client-audit-1',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 500,
      materialCost: 80,
      travelCost: 0,
      helperCost: 0,
      fees: 0,
      discounts: 0,
      otherCosts: 0,
      items: [
        { id: 'bi-1', description: 'Disjuntor Bipolar 32A', quantity: 1, unitPrice: 80, category: 'material', catalogId: 'DISJ-32A' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await budgetPersistence.saveBudget(legacyBudget);

    const woId = 'wo-legacy';
    await workOrderService.add({
      id: woId,
      clientId: 'client-audit-1',
      budgetId: budgetId,
      title: 'Serviço Legado',
      status: 'in-progress',
      paymentStatus: 'pending',
      executedValue: 500,
      companyId: 'company-a',
      workspaceId: 'workspace-a',
      syncStatus: 'pending',
      syncUpdatedAt: Date.now()
    });

    // Chamada sem consumedParts
    await operationalFacade.completeWorkOrder(woId, 500, 500, 'Finalização legada');

    const financeRecords = await financeService.listRecords();
    const record = financeRecords.find(r => r.workOrderId === woId);
    expect(record).toBeDefined();
    expect(record?.materialCost).toBe(45.0); // 1 * unitCost do estoque (45.0)
  });

  it('6. Deve registrar consumedParts e hasExtraParts no Event Store (WORKORDER_COMPLETED)', async () => {
    const budgetId = 'budget-event-test';
    const budget: Budget = {
      id: budgetId,
      title: 'Troca de Fiação',
      clientId: 'client-audit-1',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 1200,
      materialCost: 80,
      travelCost: 0,
      helperCost: 0,
      fees: 0,
      discounts: 0,
      otherCosts: 0,
      items: [
        { id: 'bi-1', description: 'Cabo Flexível 6mm', quantity: 5, unitPrice: 16, category: 'material' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await budgetPersistence.saveBudget(budget);

    const woId = 'wo-event-test';
    await workOrderService.add({
      id: woId,
      clientId: 'client-audit-1',
      budgetId: budgetId,
      title: 'Troca de Fiação',
      status: 'in-progress',
      paymentStatus: 'pending',
      executedValue: 1200,
      companyId: 'company-a',
      workspaceId: 'workspace-a',
      syncStatus: 'pending',
      syncUpdatedAt: Date.now()
    });

    const consumedParts: ConsumedPartItem[] = [
      { id: 'cp-1', name: 'Cabo Flexível 6mm', quantity: 8, unitCost: 8.0 } // 8 > 5 orçado => hasExtraParts: true
    ];

    await operationalFacade.completeWorkOrder(woId, 1200, 1200, 'Finalizado com cabo extra', consumedParts);

    const events = await db.operationalEvents.where('aggregateId').equals(woId).toArray();
    const completionEvent = events.find(e => e.eventType === 'WORKORDER_COMPLETED');
    expect(completionEvent).toBeDefined();
    expect(completionEvent?.metadata.hasExtraParts).toBe(true);
    expect(completionEvent?.metadata.consumedPartsCount).toBe(1);
    expect(completionEvent?.snapshot.materialCost).toBe(64.0); // 8 * 8.0
    expect(completionEvent?.snapshot.consumedParts.length).toBe(1);
  });
});
