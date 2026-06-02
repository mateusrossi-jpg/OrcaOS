import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { Anomaly, Proposal } from '../domain/revenue';

describe('Revenue Engine P0 Sprint', () => {
  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste
    await db.anomalies.clear();
    await db.proposals.clear();
    await db.operationalEvents.clear();
  });

  it('deve suportar criação de anomalia, atualização de timeline e conversão em proposta', async () => {
    // 1. Criar anomalia simulando o campo (Checklist)
    const mockAnomaly: Anomaly = {
      id: 'ano-001',
      companyId: 'test-company',
      workspaceId: 'test-workspace',
      clientId: 'cli-001',
      siteId: 'site-001',
      assetId: 'asset-001',
      assetExecutionId: 'exec-001',
      title: 'Falha: Pressão de Gás',
      description: 'Vazamento encontrado na porca',
      recommendedAction: 'Troca da porca e carga de gás',
      severity: 'high',
      status: 'OPEN',
      photoUuids: [],
      createdAt: new Date().toISOString(),
      createdBy: 'tech-001'
    };

    await db.anomalies.put(mockAnomaly);
    
    // Validar Persistência e Indexação
    const anomalies = await db.anomalies.where({ companyId: 'test-company', status: 'OPEN' }).toArray();
    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].title).toBe('Falha: Pressão de Gás');

    // 2. Criar proposta simulando a Conversão no Revenue Inbox (Zero Redigitação)
    const mockProposal: Proposal = {
      id: 'prop-001',
      companyId: mockAnomaly.companyId,
      workspaceId: mockAnomaly.workspaceId,
      anomalyId: mockAnomaly.id,
      clientId: mockAnomaly.clientId,
      siteId: mockAnomaly.siteId,
      assetId: mockAnomaly.assetId,
      title: `Orçamento de Correção: ${mockAnomaly.title}`,
      description: mockAnomaly.recommendedAction || '',
      amount: 850.00,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };

    await db.proposals.put(mockProposal);
    
    // Atualiza status da anomalia para QUOTED
    await db.anomalies.update(mockAnomaly.id, { status: 'QUOTED' });

    // Emite evento para a Timeline do Ativo
    await db.operationalEvents.put({
      id: 'evt-001',
      companyId: mockAnomaly.companyId,
      workspaceId: mockAnomaly.workspaceId,
      aggregateId: mockAnomaly.assetId,
      aggregateType: 'asset',
      eventType: 'PROPOSAL_CREATED_FROM_ANOMALY',
      payload: { proposalId: mockProposal.id, anomalyId: mockAnomaly.id },
      timestamp: new Date().toISOString(),
      syncStatus: 'pending'
    });

    // Validações
    const quotedAnomaly = await db.anomalies.get('ano-001');
    expect(quotedAnomaly?.status).toBe('QUOTED');

    const proposal = await db.proposals.get('prop-001');
    expect(proposal?.anomalyId).toBe('ano-001');
    expect(proposal?.amount).toBe(850);

    const timelineEvents = await db.operationalEvents.where({ aggregateId: 'asset-001' }).toArray();
    expect(timelineEvents).toHaveLength(1);
    expect(timelineEvents[0].eventType).toBe('PROPOSAL_CREATED_FROM_ANOMALY');
  });

  it('deve suportar indexação massiva (10.000 anomalias) sem gargalos críticos', async () => {
    // Inserção em batch (bulkPut)
    const batch: Anomaly[] = [];
    for (let i = 0; i < 10000; i++) {
      batch.push({
        id: `ano-bulk-${i}`,
        companyId: 'test-company',
        workspaceId: 'ws-1',
        clientId: 'cli-1',
        siteId: 'site-1',
        assetId: `asset-${i % 100}`, // Distribui por 100 ativos
        assetExecutionId: `exec-${i}`,
        title: `Anomaly ${i}`,
        description: 'Test',
        severity: 'low',
        status: i % 2 === 0 ? 'OPEN' : 'RESOLVED',
        photoUuids: [],
        createdAt: new Date().toISOString(),
        createdBy: 'tech-1'
      });
    }

    const start = performance.now();
    await db.anomalies.bulkPut(batch);
    const endPut = performance.now();

    // Testa tempo de query em compound index
    const startQuery = performance.now();
    const openAnomalies = await db.anomalies.where({ companyId: 'test-company', status: 'OPEN' }).toArray();
    const endQuery = performance.now();

    expect(openAnomalies.length).toBe(5000);
    expect(endPut - start).toBeLessThan(3000); // bulkPut deve demorar menos de 3s
    expect(endQuery - startQuery).toBeLessThan(150); // query deve demorar menos de 150ms
  });
});
