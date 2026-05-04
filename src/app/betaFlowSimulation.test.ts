import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateServiceProfit } from '../core/finance/serviceProfit';
import { calculateBudgetTotal } from '../core/pricing/budget';
import type { Client, WorkOrder } from '../core/types/business';
import { saveBudgetRecord, loadSavedBudgets } from '../features/budgets/storage/savedBudgetsStorage';
import { loadCatalogHubItems, loadCatalogSuppliers, saveCatalogHubItems, saveCatalogSuppliers } from '../features/catalog/storage/catalogHubStorage';
import { loadClients, loadWorkOrders, loadActiveWorkOrderId, saveActiveWorkOrderId, saveClients, saveWorkOrders } from '../features/clients/storage/clientWorkOrderStorage';
import { loadSimpleFinanceRecords, saveSimpleFinanceRecord } from '../features/finance/storage/simpleFinanceStorage';
import { createMemoryStorage } from '../test/createMemoryStorage';

describe('beta practical flow simulation', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.setSystemTime(new Date('2026-05-03T12:00:00.000Z'));
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: createMemoryStorage() },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('validates client, atendimento, approved budget, real profit and catalog lookup data', () => {
    const client: Client = {
      id: 'client-beta-1',
      name: 'Cliente exemplo',
      documentNumber: '',
      phone: '',
      email: 'cliente@example.com',
      address: 'Endereço do cliente',
      city: 'Cidade',
      state: 'SP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const workOrder: WorkOrder = {
      id: 'attendance-beta-1',
      clientId: client.id,
      title: 'Instalação de tomadas no quarto',
      description: 'Cliente quer adicionar 3 pontos e revisar tomada antiga.',
      address: client.address,
      status: 'open',
      priority: 'normal',
      scheduledDate: '2026-05-04T09:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveClients([client]);
    saveWorkOrders([workOrder]);
    saveActiveWorkOrderId(workOrder.id);

    expect(loadClients()).toHaveLength(1);
    expect(loadWorkOrders()[0]?.title).toBe('Instalação de tomadas no quarto');
    expect(loadActiveWorkOrderId()).toBe(workOrder.id);

    const approvedBudget = saveBudgetRecord({
      clientName: client.name,
      title: workOrder.title,
      status: 'approved',
      discount: 0,
      travelCost: 35,
      additionalFees: 0,
      paymentTerms: 'Pix na conclusão',
      validity: '7 dias',
      guarantee: 'Garantia conforme serviço executado',
      items: [
        { id: 'labor-1', description: 'Mão de obra para instalação de tomadas', quantity: 1, unitPrice: 245, category: 'labor' },
        { id: 'material-1', description: 'Módulos 20A, placa e insumos', quantity: 1, unitPrice: 71, category: 'material' },
      ],
    });

    expect(approvedBudget).not.toBeNull();
    expect(loadSavedBudgets()[0]?.status).toBe('approved');
    expect(calculateBudgetTotal({
      id: approvedBudget?.id ?? 'budget',
      title: workOrder.title,
      status: 'approved',
      discount: 0,
      travelCost: 35,
      additionalFees: 0,
      items: approvedBudget?.items ?? [],
    })).toBe(351);

    const financeRecord = saveSimpleFinanceRecord({
      title: workOrder.title,
      clientName: client.name,
      status: 'realized',
      receivedAmount: 351,
      materialCost: 71,
      travelCost: 35,
      cardFee: 0,
      estimatedTax: 21.06,
      otherCosts: 0,
      sourceBudgetId: approvedBudget?.id,
    });

    expect(financeRecord).not.toBeNull();
    expect(loadSimpleFinanceRecords()[0]?.status).toBe('realized');
    expect(calculateServiceProfit(financeRecord!)).toMatchObject({
      receivedAmount: 351,
      directCosts: 106,
      financialCosts: 21.06,
      grossProfit: 245,
      netProfit: 223.94,
    });

    const suppliers = loadCatalogSuppliers();
    const catalogItems = loadCatalogHubItems();
    saveCatalogSuppliers(suppliers);
    saveCatalogHubItems(catalogItems);

    const lookupResults = loadCatalogHubItems().filter((item) => [item.title, item.popularName, item.category].filter(Boolean).join(' ').toLowerCase().includes('tomada 20a'));
    expect(lookupResults.length).toBeGreaterThan(0);
    expect(lookupResults[0]?.destination).toMatch(/budget|both/);
  });
});
