import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { SimpleFinanceService } from '../services/SimpleFinanceService';
import { BudgetPersistenceService } from '../services/BudgetPersistenceService';
import { workOrderService } from '../services/workOrderService';
import { BUDGET_STATUS, Budget } from '../domain/budget';
import { ConsumedPartItem, WorkOrder } from '../core/types/business';
import { calculateServiceProfit } from '../core/finance/serviceProfit';

describe('Sprint 6: Margem Real + Recebimento Rápido + Continuidade Proposta -> OS', () => {
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
      id: 'client-sprint6-1',
      name: 'Cliente Sprint 6 Teste',
      phone: '11988887777',
      companyId: 'company-6',
      workspaceId: 'workspace-6',
      syncStatus: 'synced',
      syncUpdatedAt: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  describe('1. Continuidade Proposta -> OS', () => {
    it('deve autorizar a proposta/orçamento e retornar a WorkOrder criada com os mesmos vínculos de contexto', async () => {
      const budgetId = 'budget-continuity-1';
      const budget: Budget = {
        id: budgetId,
        title: 'Manutenção Preventiva de Compressor',
        clientId: 'client-sprint6-1',
        siteId: 'site-alpha',
        status: BUDGET_STATUS.ENVIADO,
        chargedValue: 2400,
        materialCost: 400,
        travelCost: 100,
        items: [
          { id: 'item-1', description: 'Mão de Obra Especializada', quantity: 1, unitPrice: 2000, category: 'labor' },
          { id: 'item-2', description: 'Óleo Sintético ISO 68', quantity: 2, unitPrice: 200, category: 'material' }
        ],
        companyId: 'company-6',
        workspaceId: 'workspace-6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await budgetPersistence.saveBudget(budget);

      // Autoriza o orçamento via facade
      const createdWO = await operationalFacade.authorizeBudget(budgetId);

      expect(createdWO).toBeDefined();
      expect(createdWO?.id).toBeDefined();
      expect(createdWO?.budgetId).toBe(budgetId);
      expect(createdWO?.clientId).toBe('client-sprint6-1');
      expect(createdWO?.siteId).toBe('site-alpha');
      expect(createdWO?.executedValue).toBe(2400);

      // Valida que a OS existe no banco
      const savedWO = await workOrderService.getById(createdWO!.id);
      expect(savedWO).toBeDefined();
      expect(savedWO?.id).toBe(createdWO!.id);

      // Valida idempotência: chamada repetida não duplica e retorna a mesma OS
      const secondCallWO = await operationalFacade.authorizeBudget(budgetId);
      expect(secondCallWO?.id).toBe(createdWO!.id);

      const allWOs = await db.workOrders.where('budgetId').equals(budgetId).toArray();
      expect(allWOs.length).toBe(1);
    });
  });

  describe('2. Recebimento Rápido (Total vs Parcial)', () => {
    it('deve permitir liquidação total instantânea do openBalance com 1 toque', async () => {
      const woId = 'wo-payment-quick-1';
      await workOrderService.add({
        id: woId,
        clientId: 'client-sprint6-1',
        title: 'Troca de Rolamento Industrial',
        status: 'done',
        paymentStatus: 'pending',
        executedValue: 1200,
        companyId: 'company-6',
        workspaceId: 'workspace-6',
        syncStatus: 'synced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Cria registro financeiro com valor total em aberto (recebido = 0)
      await financeService.saveRecord({
        title: 'Troca de Rolamento Industrial',
        clientId: 'client-sprint6-1',
        clientName: 'Cliente Sprint 6 Teste',
        workOrderId: woId,
        expectedValue: 1200,
        receivedValue: 0,
        materialCost: 300,
        travelCost: 0,
        cardFee: 0,
        estimatedTax: 0,
        otherCosts: 0,
        companyId: 'company-6',
        workspaceId: 'workspace-6'
      });

      let records = await financeService.listRecords();
      let record = records.find(r => r.workOrderId === woId);
      expect(record?.openBalance).toBe(1200);
      expect(record?.status).toBe('pending');

      // Receber Total (1200) via operationalFacade
      await operationalFacade.registerPayment(woId, record!.openBalance);

      records = await financeService.listRecords();
      record = records.find(r => r.workOrderId === woId);
      expect(record?.receivedValue).toBe(1200);
      expect(record?.openBalance).toBe(0);
      expect(record?.status).toBe('paid');
    });

    it('deve suportar recebimento parcial incremental preservando openBalance restante', async () => {
      const woId = 'wo-payment-partial-1';
      await workOrderService.add({
        id: woId,
        clientId: 'client-sprint6-1',
        title: 'Reforma de Bomba Centrífuga',
        status: 'done',
        paymentStatus: 'pending',
        executedValue: 2000,
        companyId: 'company-6',
        workspaceId: 'workspace-6',
        syncStatus: 'synced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await financeService.saveRecord({
        title: 'Reforma de Bomba Centrífuga',
        clientId: 'client-sprint6-1',
        clientName: 'Cliente Sprint 6 Teste',
        workOrderId: woId,
        expectedValue: 2000,
        receivedValue: 0,
        materialCost: 500,
        travelCost: 50,
        cardFee: 0,
        estimatedTax: 0,
        otherCosts: 0,
        companyId: 'company-6',
        workspaceId: 'workspace-6'
      });

      // 1ª Entrada: 500 (Parcial)
      await operationalFacade.registerPayment(woId, 500);

      let records = await financeService.listRecords();
      let record = records.find(r => r.workOrderId === woId);
      expect(record?.receivedValue).toBe(500);
      expect(record?.openBalance).toBe(1500);
      expect(record?.status).toBe('partial');

      // 2ª Baixa: Quitar o saldo restante (1500)
      await operationalFacade.registerPayment(woId, record!.openBalance);

      records = await financeService.listRecords();
      record = records.find(r => r.workOrderId === woId);
      expect(record?.receivedValue).toBe(2000);
      expect(record?.openBalance).toBe(0);
      expect(record?.status).toBe('paid');
    });
  });

  describe('3. Comparativo Orçado × Real e Margem Confiável', () => {
    it('deve calcular corretamente o desvio de material e desvio de margem sem alterar o orçamento original', async () => {
      const budgetId = 'budget-variance-1';
      const budget: Budget = {
        id: budgetId,
        title: 'Instalação Elétrica Completa',
        clientId: 'client-sprint6-1',
        siteId: 'site-beta',
        status: BUDGET_STATUS.FINALIZADO,
        chargedValue: 3000,
        materialCost: 600, // Orçado: 600 em materiais
        travelCost: 100,   // Orçado: 100 em deslocamento
        items: [
          { id: 'bi-1', description: 'Mão de Obra', quantity: 1, unitPrice: 2400, category: 'labor' },
          { id: 'bi-2', description: 'Cabo 10mm', quantity: 60, unitPrice: 10, category: 'material' }
        ],
        companyId: 'company-6',
        workspaceId: 'workspace-6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await budgetPersistence.saveBudget(budget);

      const woId = 'wo-variance-1';
      await workOrderService.add({
        id: woId,
        clientId: 'client-sprint6-1',
        budgetId: budgetId,
        title: 'Instalação Elétrica Completa',
        status: 'in-progress',
        paymentStatus: 'pending',
        executedValue: 3000,
        companyId: 'company-6',
        workspaceId: 'workspace-6',
        syncStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Na execução real, foram consumidos R$ 900 de materiais (desvio de +R$ 300)
      const consumedParts: ConsumedPartItem[] = [
        { id: 'cp-1', name: 'Cabo 10mm Extra', quantity: 90, unitCost: 10 }
      ];

      await operationalFacade.completeWorkOrder(woId, 3000, 3000, 'Executado com cabo extra', consumedParts);

      // 1. Orçamento original PERMANECE INTACTO
      const originalBudget = await budgetPersistence.getBudget(budgetId);
      expect(originalBudget?.chargedValue).toBe(3000);
      expect(originalBudget?.materialCost).toBe(600);
      expect(originalBudget?.items?.length).toBe(2);

      // 2. Registro financeiro reflete o custo real
      const records = await financeService.listRecords();
      const financeRec = records.find(r => r.workOrderId === woId);
      expect(financeRec).toBeDefined();
      expect(financeRec?.materialCost).toBe(900);
      expect(financeRec?.receivedValue).toBe(3000);

      // 3. Cálculos de Lucro e Margem
      const budgetTotalCost = (budget.materialCost || 0) + (budget.travelCost || 0);
      const budgetMargin = budget.chargedValue - budgetTotalCost;
      expect(budgetMargin).toBe(2300);

      const realProfit = calculateServiceProfit({
        receivedAmount: financeRec!.receivedValue,
        materialCost: financeRec!.materialCost,
        travelCost: financeRec!.travelCost,
        otherCosts: financeRec!.otherCosts,
        cardFee: financeRec!.cardFee,
        estimatedTax: financeRec!.estimatedTax
      });
      expect(realProfit.netProfit).toBe(2000);
      expect(realProfit.directCosts).toBe(1000);

      const materialVariance = financeRec!.materialCost - (budget.materialCost || 0);
      const marginVariance = realProfit.netProfit - budgetMargin;

      expect(materialVariance).toBe(300); // Custou R$ 300 a mais em peças
      expect(marginVariance).toBe(-300);  // Perdeu R$ 300 de margem esperada
    });
  });
});
