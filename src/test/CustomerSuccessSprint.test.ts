import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { CustomerRiskAnalyzer } from '../services/CustomerRiskAnalyzer';
import { CustomerSuccessTaskService } from '../services/CustomerSuccessTaskService';
import { CustomerHealthEvolution } from '../services/CustomerHealthEvolution';
import { EngagementScoreService } from '../services/EngagementScoreService';

describe('Customer Success & Retention Engine P0', () => {
  beforeEach(async () => {
    await db.customerHealth.clear();
    await db.customerRisks.clear();
    await db.customerActions.clear();
    await db.customerEngagement.clear();
    await db.operationalEvents.clear();
    await db.contracts.clear();
    await db.warrantyIncidents.clear();
    await db.proposals.clear();
  });

  it('deve calcular risco e gerar alertas para clientes sem contrato', async () => {
    const companyId = 'co-1';
    const clientId = 'client-risk';

    // Nenhum contrato ativo inserido
    await CustomerRiskAnalyzer.evaluateRisk(companyId, clientId);

    const health = await db.customerHealth.where({ clientId }).first();
    expect(health).toBeDefined();
    expect(health?.healthScore).toBeLessThan(100);

    const risk = await db.customerRisks.where({ clientId }).first();
    // 100 - 20 (sem contrato) = 80 -> ATTENTION, logo não deve criar Risk entity ou Task ainda, pois ATTENTION != AT_RISK.
    expect(risk).toBeUndefined();

    // Vamos forçar o risco para AT_RISK
    await db.warrantyIncidents.bulkPut([
      { id: 'i1', companyId, workspaceId: 'w', assetId: 'a1', isRecurrence: true, recurrenceLevel: 'CRITICAL' },
      { id: 'i2', companyId, workspaceId: 'w', assetId: 'a2', isRecurrence: true, recurrenceLevel: 'CRITICAL' },
      { id: 'i3', companyId, workspaceId: 'w', assetId: 'a3', isRecurrence: true, recurrenceLevel: 'CRITICAL' },
      { id: 'i4', companyId, workspaceId: 'w', assetId: 'a4', isRecurrence: true, recurrenceLevel: 'CRITICAL' }
    ]);

    await CustomerRiskAnalyzer.evaluateRisk(companyId, clientId);

    const newRisk = await db.customerRisks.where({ clientId }).first();
    expect(newRisk).toBeDefined(); // Health caiu mais 30 = 50 -> AT_RISK

    const actions = await db.customerActions.where({ clientId }).toArray();
    expect(actions.length).toBe(1); // Task "CALL" criada automaticamente
    expect(actions[0].type).toBe('CALL');
  });

  it('deve calcular engagement score baseado em propostas', async () => {
    const companyId = 'co-1';
    const clientId = 'client-eng';

    await db.proposals.bulkPut([
      { id: 'p1', companyId, workspaceId: 'w', anomalyId: 'a1', clientId, status: 'APPROVED' },
      { id: 'p2', companyId, workspaceId: 'w', anomalyId: 'a1', clientId, status: 'APPROVED' },
      { id: 'p3', companyId, workspaceId: 'w', anomalyId: 'a1', clientId, status: 'SENT' },
      { id: 'p4', companyId, workspaceId: 'w', anomalyId: 'a1', clientId, status: 'SENT' }
    ]);

    await EngagementScoreService.calculateEngagement(companyId, clientId);

    const engagement = await db.customerEngagement.where({ clientId }).first();
    expect(engagement).toBeDefined();
    
    // (2 aprovadas de 4) * 50 = 25. + 25 (acesso ao portal via aprovadas) + 25 = 75.
    expect(engagement?.engagementScore).toBe(75);
    expect(engagement?.proposalsApproved).toBe(2);
  });

  it('deve evoluir score e listar histórico', async () => {
    // Insere eventos falsos
    await db.operationalEvents.bulkPut([
      { id: 'e1', aggregateId: 'c-evo', aggregateType: 'client', eventType: 'CUSTOMER_HEALTH_CHANGED', timestamp: '2026-05-01T10:00:00Z', correlationId: '', syncStatus: 'SYNCED' },
      { id: 'e2', aggregateId: 'c-evo', aggregateType: 'client', eventType: 'CUSTOMER_HEALTH_CHANGED', timestamp: '2026-06-01T10:00:00Z', correlationId: '', syncStatus: 'SYNCED' }
    ]);

    const evo = await CustomerHealthEvolution.getEvolution('c-evo');
    expect(evo.length).toBe(2);
  });

  it('deve suportar alto volume na analise de risco (performance)', async () => {
    const companyId = 'co-perf';
    
    // Carregar 1000 contratos de 1000 clientes
    const contracts = [];
    for (let i = 0; i < 1000; i++) {
      contracts.push({
        id: `c-${i}`, companyId, workspaceId: 'w', clientId: `cli-${i}`, status: 'ACTIVE', startDate: '', billingFrequency: 'MONTHLY', amount: 1000
      });
    }

    await db.contracts.bulkPut(contracts as any);

    const startQuery = performance.now();
    // Avaliar o risco do cliente 'cli-500'
    await CustomerRiskAnalyzer.evaluateRisk(companyId, 'cli-500');
    const endQuery = performance.now();

    const health = await db.customerHealth.where({ clientId: 'cli-500' }).first();
    expect(health).toBeDefined();
    expect(health?.healthScore).toBe(100);
    expect(endQuery - startQuery).toBeLessThan(1000);
  });
});
