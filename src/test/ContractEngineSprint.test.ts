import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { ContractHealthService } from '../services/ContractHealthService';
import { ChurnRiskService } from '../services/ChurnRiskService';
import { ContractRenewalService } from '../services/ContractRenewalService';

describe('Contract & Recurring Revenue Engine P0', () => {
  beforeEach(async () => {
    await db.contracts.clear();
    await db.contractHealth.clear();
    await db.contractRenewals.clear();
    await db.contractAlerts.clear();
    await db.anomalies.clear();
    await db.dispatchAlerts.clear();
    await db.proposals.clear();
    await db.operationalEvents.clear();
  });

  it('deve penalizar o Health Score por SLAs atrasados e inadimplencia', async () => {
    const companyId = 'test-co';
    const contractId = 'c-1';
    
    await db.contracts.put({
      id: contractId, companyId, workspaceId: 'w-1', clientId: 'cli-1',
      status: 'ACTIVE', startDate: '2025-01-01', billingFrequency: 'MONTHLY', syncStatus: 'synced'
    });

    // Sem penalidades (Health = 100)
    let score = await ContractHealthService.calculateHealth(companyId, contractId);
    expect(score).toBe(100);

    // Cria atrasos e inadimplência
    await db.dispatchAlerts.put({
      id: 'a-1', companyId, workspaceId: 'w-1', jobId: 'j-1', type: 'LATE_ARRIVAL', message: '', resolved: false, createdAt: ''
    });
    
    await db.proposals.bulkPut([
      { id: 'p-1', companyId, workspaceId: 'w-1', anomalyId: 'a', clientId: 'cli-1', status: 'APPROVED' },
      { id: 'p-2', companyId, workspaceId: 'w-1', anomalyId: 'a', clientId: 'cli-1', status: 'APPROVED' },
      { id: 'p-3', companyId, workspaceId: 'w-1', anomalyId: 'a', clientId: 'cli-1', status: 'APPROVED' },
      { id: 'p-4', companyId, workspaceId: 'w-1', anomalyId: 'a', clientId: 'cli-1', status: 'APPROVED' }
    ] as any);

    score = await ContractHealthService.calculateHealth(companyId, contractId);
    expect(score).toBe(65); // 100 - 15 (alert) - 20 (proposals) = 65
  });

  it('deve disparar alerta de CHURN para contratos com saúde crítica', async () => {
    const companyId = 'test-co';
    await db.contracts.put({
      id: 'c-2', companyId, workspaceId: 'w-1', clientId: 'cli-2',
      status: 'ACTIVE', startDate: '2025-01-01', billingFrequency: 'MONTHLY', syncStatus: 'synced'
    });

    // Simulando que o contrato tem 15 anomalias
    for(let i=0; i<15; i++) {
      await db.anomalies.put({
        id: `a-${i}`, companyId, workspaceId: 'w-1', clientId: 'cli-2', siteId: 's', assetId: 'a', status: 'PENDING',
        title: '', description: '', severity: 'high', photoUuids: [], createdBy: 't', createdAt: '', assetExecutionId: ''
      });
    }

    const risk = await ChurnRiskService.evaluateRisk(companyId, 'c-2');
    expect(risk).toBe('CRITICAL'); // 100 - (15*5) = 25 -> CRITICAL

    const alerts = await db.contractAlerts.toArray();
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('HIGH_CHURN_RISK');
  });

  it('deve gerar renovação automática para contratos a vencer em 90 dias', async () => {
    const companyId = 'test-co';
    
    // Contrato vence daqui a 45 dias
    const endDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();
    
    await db.contracts.put({
      id: 'c-3', companyId, workspaceId: 'w-1', clientId: 'cli-3',
      status: 'ACTIVE', startDate: '2025-01-01', endDate, billingFrequency: 'MONTHLY', syncStatus: 'synced', amount: 10000
    });

    await ContractRenewalService.checkRenewals(companyId);

    const renewals = await db.contractRenewals.toArray();
    expect(renewals.length).toBe(1);
    expect(renewals[0].status).toBe('PROPOSAL_GENERATED');

    const proposals = await db.proposals.where({ anomalyId: 'RENEWAL' }).toArray();
    expect(proposals.length).toBe(1);
    expect(proposals[0].amount).toBe(10500); // 10k + 5%
  });

  it('deve suportar performance de 1000 contratos', async () => {
    const companyId = 'test-co';
    const contracts = [];
    
    for (let i = 0; i < 1000; i++) {
      contracts.push({
        id: `cont-perf-${i}`, companyId, workspaceId: 'w-1', clientId: `c-${i}`,
        status: i % 2 === 0 ? 'ACTIVE' : 'EXPIRED',
        startDate: '2025-01-01', syncStatus: 'synced'
      });
    }

    const startInsert = performance.now();
    await db.contracts.bulkPut(contracts as any);
    const endInsert = performance.now();
    
    expect(endInsert - startInsert).toBeLessThan(8000); 

    const startQuery = performance.now();
    const active = await db.contracts.where({ companyId, status: 'ACTIVE' }).toArray();
    const endQuery = performance.now();

    expect(active.length).toBe(500);
    expect(endQuery - startQuery).toBeLessThan(1000);
  });
});
