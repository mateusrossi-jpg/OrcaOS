import { describe, it, expect, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../storage/dexieDatabase';
import { BUDGET_STATUS } from '../domain/budget';
import { operationalFacade } from '../features/workflow/operationalFacade';
import { clientProposalService } from '../services/clientProposalService';
import { createClientProposalDraft } from '../features/clientPortal/storage/clientProposalStorage';

describe('AFERIX REVENUE VISIBILITY VALIDATION', () => {

  const COMPANY_ID = 'test-co';
  const WORKSPACE_ID = 'test-ws';

  async function getKPIs() {
    const [budgets, contracts, finance, wos] = await Promise.all([
      db.budgets.toArray(),
      db.contracts.where('status').equals('active').toArray(),
      db.simpleFinanceRecords.toArray(),
      db.workOrders.toArray()
    ]);

    const approvedBudgets = budgets.filter(b => 
      [BUDGET_STATUS.AUTORIZADO, BUDGET_STATUS.EM_EXECUCAO, BUDGET_STATUS.FINALIZADO].includes(b.status)
    );
    const budgetRevenue = approvedBudgets.reduce((acc, b) => acc + (b.chargedValue || 0), 0);
    const contractRevenue = contracts.reduce((acc, c) => acc + (c.billingAmount || 0), 0);
    const contractedTotal = budgetRevenue + contractRevenue;

    const inProgressWOs = wos.filter(wo => ['open', 'scheduled', 'in-progress'].includes(wo.status));
    const executionRevenue = inProgressWOs.reduce((acc, wo) => acc + (wo.executedValue || 0), 0);

    const invoicedRevenue = finance.reduce((acc, f) => acc + (f.expectedValue || 0), 0);
    const receivedRevenue = finance.reduce((acc, f) => acc + (f.receivedValue || 0), 0);
    const accountsReceivable = finance.reduce((acc, f) => acc + (f.openBalance || 0), 0);

    return { contractedTotal, executionRevenue, invoicedRevenue, receivedRevenue, accountsReceivable };
  }

  beforeAll(async () => {
    await db.clients.clear();
    await db.budgets.clear();
    await db.workOrders.clear();
    await db.simpleFinanceRecords.clear();
    await db.contracts.clear();
  });

  it('Cenário 1: Orçamento R$ 10.000 aprovado', async () => {
    const budgetId = 'b1-visibility';
    await db.budgets.add({
      id: budgetId,
      companyId: COMPANY_ID,
      workspaceId: WORKSPACE_ID,
      clientId: 'c1',
      siteId: 's1',
      title: 'Venda de 10k',
      status: BUDGET_STATUS.AUTORIZADO,
      chargedValue: 10000,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any);

    const kpis = await getKPIs();
    expect(kpis.contractedTotal).toBe(10000);
    expect(kpis.executionRevenue).toBe(0); // No OS yet
    expect(kpis.receivedRevenue).toBe(0);
  });

  it('Cenário 2: OS criada', async () => {
    const budgetId = 'b1-visibility';
    const budget = await db.budgets.get(budgetId);
    
    // Simular criação de OS (conforme operationalFacade.authorizeBudget)
    await db.workOrders.add({
      id: 'wo1-visibility',
      companyId: COMPANY_ID,
      workspaceId: WORKSPACE_ID,
      clientId: 'c1',
      siteId: 's1',
      budgetId: budgetId,
      title: 'Execução 10k',
      status: 'in-progress',
      executedValue: 10000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any);

    const kpis = await getKPIs();
    expect(kpis.contractedTotal).toBe(10000);
    expect(kpis.executionRevenue).toBe(10000);
    expect(kpis.receivedRevenue).toBe(0);
  });

  it('Cenário 3: Serviço concluído e faturado', async () => {
    // operationalFacade.completeWorkOrder
    await operationalFacade.completeWorkOrder('wo1-visibility', 10000, 0);

    const kpis = await getKPIs();
    expect(kpis.contractedTotal).toBe(10000);
    expect(kpis.executionRevenue).toBe(0); // Not in-progress anymore
    expect(kpis.invoicedRevenue).toBe(10000);
    expect(kpis.receivedRevenue).toBe(0);
    expect(kpis.accountsReceivable).toBe(10000);
  });

  it('Cenário 4: Pagamento recebido', async () => {
    await operationalFacade.registerPayment('wo1-visibility', 10000);

    const kpis = await getKPIs();
    expect(kpis.contractedTotal).toBe(10000);
    expect(kpis.receivedRevenue).toBe(10000);
    expect(kpis.accountsReceivable).toBe(0);
  });

});
