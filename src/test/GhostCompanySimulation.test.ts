import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { clientService } from '../services/clientService';
import { assetService } from '../services/assetService';
import { contractService } from '../services/contractService';
import { AuthService } from '../services/AuthService';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { BUDGET_STATUS } from '../domain/budget';
import { clientProposalService } from '../services/clientProposalService';
import { createClientProposalDraft } from '../features/clientPortal/storage/clientProposalStorage';

describe('AFERIX GHOST COMPANY VALIDATION: ELETRIFICA SERVIÇOS LTDA', () => {

  const COMPANY_ID = 'eletrifica-123';
  const WORKSPACE_ID = 'workspace-primary';

  beforeAll(async () => {
    await db.clients.clear();
    await db.assets.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.teamMembers.clear();
    await db.anomalies.clear();
    await db.clientProposals.clear();
    await db.contracts.clear();
    await db.operationalEvents.clear();
  });

  it('Fase 1: Estruturação da Empresa (Setup)', async () => {
    console.log('--- FASE 1: SETUP ELETRIFICA SERVIÇOS LTDA ---');

    await AuthService.createTeamMember({ name: 'Dono Eletrifica', email: 'owner@eletrifica.com', role: 'OWNER', companyId: COMPANY_ID, workspaceId: WORKSPACE_ID, status: 'active' });
    await AuthService.createTeamMember({ name: 'Gestor Operacional', email: 'manager@eletrifica.com', role: 'MANAGER', companyId: COMPANY_ID, workspaceId: WORKSPACE_ID, status: 'active' });
    await AuthService.createTeamMember({ name: 'Comercial Sênior', email: 'sales@eletrifica.com', role: 'SALES', companyId: COMPANY_ID, workspaceId: WORKSPACE_ID, status: 'active' });
    await AuthService.createTeamMember({ name: 'Técnico Alpha', email: 'field1@eletrifica.com', role: 'FIELD', companyId: COMPANY_ID, workspaceId: WORKSPACE_ID, status: 'active' });
    await AuthService.createTeamMember({ name: 'Técnico Beta', email: 'field2@eletrifica.com', role: 'FIELD', companyId: COMPANY_ID, workspaceId: WORKSPACE_ID, status: 'active' });
    await AuthService.createTeamMember({ name: 'Técnico Gamma', email: 'field3@eletrifica.com', role: 'FIELD', companyId: COMPANY_ID, workspaceId: WORKSPACE_ID, status: 'active' });

    for (let i = 1; i <= 30; i++) {
      await clientService.add({
        id: `c-${i}`,
        name: `Cliente Corporate ${i}`,
        email: `contato${i}@empresa.com`,
        phone: '119999900' + (i < 10 ? '0' + i : i),
        companyId: COMPANY_ID,
        workspaceId: WORKSPACE_ID
      } as any);
    }
    const clients = await db.clients.toArray();

    for (let i = 1; i <= 50; i++) {
      const client = clients[i % 30];
      await assetService.add({
        companyId: COMPANY_ID,
        workspaceId: WORKSPACE_ID,
        clientId: client.id,
        siteId: 'site-default',
        name: `Gerador de Energia G-${i}`,
        tag: `ELE-${1000 + i}`,
        category: 'EQUIPMENT',
        status: 'active'
      });
    }

    for (let i = 0; i < 5; i++) {
      const client = clients[i];
      await contractService.add({
        companyId: COMPANY_ID,
        workspaceId: WORKSPACE_ID,
        clientId: client.id,
        title: `Plano de Manutenção VIP ${i + 1}`,
        status: 'active',
        startDate: new Date().toISOString(),
        billingFrequency: 'monthly',
        billingAmount: 2500 + (i * 500),
        siteIds: ['site-default'],
        assetIds: [],
        maintenancePlanIds: []
      });
    }
    expect(await db.clients.count()).toBe(30);
    expect(await db.assets.count()).toBe(50);
    expect(await db.contracts.count()).toBe(5);
  });

  it('Fase 2 & 3: Operação Comercial e de Campo (Funil e OS)', async () => {
    console.log('--- FASE 2 & 3: OPERAÇÃO COMERCIAL E CAMPO ---');
    const clients = await db.clients.toArray();
    const assets = await db.assets.toArray();

    for (let i = 0; i < 50; i++) {
      const client = clients[i % 30];
      const asset = assets[i % 50];
      await db.anomalies.put({
        id: `ano-${i}`,
        companyId: COMPANY_ID,
        workspaceId: WORKSPACE_ID,
        clientId: client.id,
        siteId: 'site-default',
        assetId: asset.id,
        assetExecutionId: 'ex-001',
        title: `Falha Técnica detetada #${i}`,
        description: 'Verificação necessária nos cabos de alta tensão.',
        severity: i % 10 === 0 ? 'critical' : 'high',
        status: 'OPEN',
        photoUuids: [],
        createdBy: 'field1@eletrifica.com',
        createdAt: new Date().toISOString()
      });
    }

    for (let i = 0; i < 20; i++) {
      const anomaly = await db.anomalies.get(`ano-${i}`);
      if (!anomaly) continue;

      const budgetId = `bdg-${i}`;
      const budget = {
        id: budgetId,
        companyId: COMPANY_ID,
        workspaceId: WORKSPACE_ID,
        clientId: anomaly.clientId,
        siteId: anomaly.siteId,
        title: `Proposta para ${anomaly.title}`,
        status: BUDGET_STATUS.INICIADO,
        chargedValue: 1500 + (i * 100),
        items: [{ id: 'i1', description: 'Reparo', quantity: 1, unitPrice: 1500 + (i * 100), category: 'labor' }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await operationalFacade.saveBudget(budget as any);
      
      const publicProposal = createClientProposalDraft({
        budgetId: budget.id,
        companyId: COMPANY_ID,
        clientId: budget.clientId,
        clientName: `Cliente ${i % 30}`,
        title: budget.title,
        summary: 'Resumo da proposta',
        total: budget.chargedValue,
        subtotal: budget.chargedValue,
        status: 'sent',
        items: []
      });
      await clientProposalService.add(publicProposal);

      if (i < 12) {
        await operationalFacade.approveProposal(publicProposal.id);
      } else {
        await db.budgets.update(budgetId, { status: BUDGET_STATUS.RECUSADO });
        await db.clientProposals.update(publicProposal.id, { status: 'rejected' });
      }
    }

    // "Executar" 8 das 12 OS autorizadas para gerar faturamento
    const budgets = await db.budgets.where('status').equals(BUDGET_STATUS.AUTORIZADO).toArray();
    for (let i = 0; i < 8; i++) {
      const b = budgets[i];
      const relatedOS = await db.workOrders.where('budgetId').equals(b.id).first();
      if (relatedOS) {
        await operationalFacade.completeWorkOrder(relatedOS.id, b.chargedValue, 0);
      }
    }

    expect(await db.workOrders.count()).toBe(12);
    const completedCount = await db.workOrders.where('status').equals('done').count();
    expect(completedCount).toBe(8);
  });

  it('Fase 4 & 5: Financeiro e Garantias', async () => {
    console.log('--- FASE 4 & 5: FINANCEIRO E GARANTIAS ---');
    const wos = await db.workOrders.where('status').equals('done').toArray();
    
    let totalPaid = 0;
    for (let i = 0; i < 4; i++) {
      await operationalFacade.registerPayment(wos[i].id, wos[i].executedValue || 1500);
      totalPaid += (wos[i].executedValue || 1500);
    }

    const finance = await db.simpleFinanceRecords.toArray();
    const paidSum = finance.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.receivedValue, 0);
    
    expect(paidSum).toBe(totalPaid);
    console.log('Total recebido:', paidSum);
    console.log('A receber:', finance.filter(f => f.status !== 'paid').reduce((acc, f) => acc + f.openBalance, 0));
  });

  it('Fase 8: Pilot Kill Test', async () => {
    console.log('--- FASE 8: PILOT KILL TEST ---');
    
    const budgets = await db.budgets.where('status').equals(BUDGET_STATUS.AUTORIZADO).toArray();
    for (const b of budgets) {
      const relatedOS = await db.workOrders.where('budgetId').equals(b.id).first();
      expect(relatedOS).toBeDefined();
      
      if (relatedOS?.status === 'done') {
        const finance = await db.simpleFinanceRecords.where('workOrderId').equals(relatedOS.id).first();
        expect(finance).toBeDefined();
        expect(finance?.expectedValue).toBe(b.chargedValue);
      }
    }
  });
});
