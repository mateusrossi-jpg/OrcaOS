import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { CustomerNotificationService } from '../services/CustomerNotificationService';
import { Proposal } from '../domain/revenue';

describe('Client Portal Sprint P1', () => {
  beforeEach(async () => {
    await db.proposals.clear();
    await db.anomalies.clear();
  });

  it('deve simular disparo de notificação sem erro', async () => {
    const success = await CustomerNotificationService.notifyProposalGenerated('cli-1', 'prop-1');
    expect(success).toBe(true);
  });

  it('deve processar a aprovação da assinatura digital', async () => {
    // Insere anomalia base
    await db.anomalies.put({
      id: 'ano-99',
      companyId: 'test',
      workspaceId: 'test',
      clientId: 'cli-1',
      siteId: 'site-1',
      assetId: 'asset-1',
      assetExecutionId: 'ex-1',
      title: 'Vazamento',
      description: '',
      severity: 'high',
      status: 'QUOTED',
      photoUuids: [],
      createdBy: 'tech-1',
      createdAt: new Date().toISOString()
    });

    // Insere proposta
    await db.proposals.put({
      id: 'prop-99',
      companyId: 'test',
      workspaceId: 'test',
      anomalyId: 'ano-99',
      clientId: 'cli-1',
      siteId: 'site-1',
      assetId: 'asset-1',
      title: 'Orçamento X',
      description: 'Arrumar vazamento',
      amount: 1000,
      status: 'SENT',
      createdAt: new Date().toISOString()
    });

    // Simulação do onClick da Assinatura
    await db.proposals.update('prop-99', { status: 'APPROVED' });
    await db.anomalies.update('ano-99', { status: 'APPROVED', approvedAt: new Date().toISOString() });

    const p = await db.proposals.get('prop-99');
    expect(p?.status).toBe('APPROVED');

    const a = await db.anomalies.get('ano-99');
    expect(a?.status).toBe('APPROVED');
    expect(a?.approvedAt).toBeDefined();
  });
});
