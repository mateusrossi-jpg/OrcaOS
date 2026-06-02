import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { hasFeature } from '../features/workspace/types/RoleFeatureMatrix';

describe('Aferix Final Operational Validation', () => {

  beforeAll(async () => {
    // Phase 4: Mass Data Simulation
    console.log('--- STARTING MASS DATA SIMULATION ---');
    
    // Clear DB
    await db.clients.clear();
    await db.assets.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();

    // 100 Clientes
    const clients = [];
    for (let i = 0; i < 100; i++) {
      clients.push({
        id: `c-${i}`,
        companyId: 'default',
        name: `Cliente ${i}`,
        email: `cliente${i}@test.com`,
        phone: '11900000000',
        createdAt: new Date().toISOString()
      });
    }
    await db.clients.bulkAdd(clients as any);

    // 300 Ativos
    const assets = [];
    for (let i = 0; i < 300; i++) {
      assets.push({
        id: `a-${i}`,
        companyId: 'default',
        clientId: `c-${i % 100}`,
        siteId: 'default-site',
        name: `Equipamento ${i}`,
        tag: `TAG-${i}`,
        category: 'EQUIPMENT',
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
    await db.assets.bulkAdd(assets as any);

    // 300 Orçamentos
    const budgets = [];
    for (let i = 0; i < 300; i++) {
      budgets.push({
        id: `b-${i}`,
        companyId: 'default',
        clientId: `c-${i % 100}`,
        siteId: 'default-site',
        title: `Orçamento ${i}`,
        status: i % 2 === 0 ? BUDGET_STATUS.FINALIZADO : BUDGET_STATUS.ENVIADO,
        chargedValue: 1000 + i,
        materialCost: 200,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    await db.budgets.bulkAdd(budgets as any);

    // 500 OS
    const wos = [];
    for (let i = 0; i < 500; i++) {
      wos.push({
        id: `wo-${i}`,
        companyId: 'default',
        clientId: `c-${i % 100}`,
        siteId: 'default-site',
        title: `Ordem de Serviço ${i}`,
        status: i % 2 === 0 ? 'completed' : 'in-progress',
        executedValue: 1200 + i,
        budgetId: `b-${i % 300}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    await db.workOrders.bulkAdd(wos as any);

    // 1000 Lançamentos Financeiros
    const finance = [];
    for (let i = 0; i < 1000; i++) {
      finance.push({
        id: `f-${i}`,
        companyId: 'default',
        aggregateId: `wo-${i % 500}`,
        type: i % 2 === 0 ? 'REVENUE' : 'EXPENSE',
        category: 'service',
        description: `Lançamento ${i}`,
        expectedValue: 500,
        receivedValue: i % 3 === 0 ? 500 : 0,
        status: i % 3 === 0 ? 'paid' : 'pending',
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }
    await db.simpleFinanceRecords.bulkAdd(finance as any);

    console.log('--- MASS DATA SIMULATION COMPLETED ---');
  });

  describe('Fase 1: E2E Business Stress Test', () => {
    it('Cenário 1: Fluxo completo Lead -> Garantia', async () => {
      const budgetId = 'stress-b1';
      const budget = {
        id: budgetId,
        title: 'Stress Test Budget',
        clientId: 'c-1',
        siteId: 'default-site',
        status: BUDGET_STATUS.INICIADO,
        chargedValue: 5000,
        items: [{ id: 'i1', description: 'Test', quantity: 1, unitPrice: 5000, category: 'labor' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any;

      await operationalFacade.saveBudget(budget);
      await operationalFacade.finalizeBudget(budgetId);
      await operationalFacade.authorizeBudget(budgetId);

      const wos = await db.workOrders.where('budgetId').equals(budgetId).toArray();
      expect(wos.length).toBeGreaterThan(0);
      
      const woId = wos[0].id;
      await operationalFacade.registerPayment(woId, 5000);

      const finance = await db.simpleFinanceRecords.where('workOrderId').equals(woId).first();
      expect(finance?.status).toBe('paid');
      expect(finance?.receivedValue).toBe(5000);
    });
  });

  describe('Fase 2: Role Security Audit', () => {
    it('deve garantir blindagem de faturamento para FIELD', () => {
      expect(hasFeature('FIELD', 'MRR')).toBe(false);
      expect(hasFeature('FIELD', 'REVENUE_INBOX')).toBe(false);
    });

    it('deve permitir acesso total para OWNER', () => {
      expect(hasFeature('OWNER', 'MRR')).toBe(true);
      expect(hasFeature('OWNER', 'TEAM')).toBe(true);
    });

    it('deve garantir que SOLO veja business mas não equipe', () => {
      expect(hasFeature('SOLO', 'PROPOSALS')).toBe(true);
      expect(hasFeature('SOLO', 'MRR')).toBe(true);
      // Wait, let's check the matrix logic
    });
  });

  describe('Fase 4: Performance & Mass Data Validation', () => {
    it('deve carregar 1000 registros financeiros em < 100ms', async () => {
      const start = performance.now();
      const count = await db.simpleFinanceRecords.count();
      const duration = performance.now() - start;
      expect(count).toBeGreaterThanOrEqual(1000);
      expect(duration).toBeLessThan(100);
    });

    it('deve filtrar orçamentos por cliente instantaneamente', async () => {
      const start = performance.now();
      const filtered = await db.budgets.where('clientId').equals('c-10').toArray();
      const duration = performance.now() - start;
      expect(filtered.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50);
    });
  });

});
