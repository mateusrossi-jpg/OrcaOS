import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { TimelineEventService } from '../services/TimelineEventService';
import { WarrantyService } from '../services/WarrantyService';
import { RecurrenceAnalyzer } from '../services/RecurrenceAnalyzer';
import { HealthScoreService } from '../services/HealthScoreService';
import { WarrantyRecord } from '../domain/memory';

describe('Timeline & Memory Engine P0 Sprint', () => {
  beforeEach(async () => {
    await db.operationalEvents.clear();
    await db.anomalies.clear();
    await db.warranties.clear();
  });

  it('deve gerar eventos cronológicos para o AssetTimeline', async () => {
    // Insere eventos usando o serviço (que já registra o timestamp)
    await TimelineEventService.logEvent({
      companyId: 'test-co',
      workspaceId: 'ws-1',
      aggregateId: 'asset-1',
      aggregateType: 'asset',
      eventType: 'WORKORDER_COMPLETED',
      title: 'OS 001 Finalizada',
      description: 'Limpeza de filtros',
      actor: 'Mateus',
      metadata: { clientId: 'client-1' }
    });

    await TimelineEventService.logEvent({
      companyId: 'test-co',
      workspaceId: 'ws-1',
      aggregateId: 'asset-1',
      aggregateType: 'asset',
      eventType: 'ANOMALY_CREATED',
      title: 'Vazamento detectado',
      description: 'Gotejamento na condensadora',
      actor: 'Mateus',
      metadata: { clientId: 'client-1' }
    });

    const events = await db.operationalEvents.where({ aggregateId: 'asset-1' }).toArray();
    expect(events).toHaveLength(2);
    // Como foram gravados em sequência no milissegundo ou proximo, o segundo é a Anomaly
    // A validação de ordenação é feita na query UI (sort por timestamp)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    expect(events[0].eventType).toBe('ANOMALY_CREATED');
  });

  it('deve detectar garantia ativa e abater do health score', async () => {
    // 1. Cria garantia válida (expira no futuro) e recente (menos de 90 dias atrás)
    const started = new Date();
    started.setDate(started.getDate() - 10); // 10 dias atrás
    const expires = new Date();
    expires.setDate(expires.getDate() + 80); // +80 dias
    
    await db.warranties.put({
      id: 'war-1',
      companyId: 'test-co',
      workspaceId: 'ws-1',
      assetId: 'asset-1',
      serviceType: 'Troca de Compressor',
      parts: ['Compressor'],
      status: 'ACTIVE',
      startedAt: started.toISOString(),
      expiresAt: expires.toISOString(),
    } as WarrantyRecord);

    const hasWarranty = await WarrantyService.checkActiveWarranty('asset-1', 'test-co');
    expect(hasWarranty).toBe(true);

    const health = await HealthScoreService.calculateAssetHealth('asset-1', 'test-co');
    // Health default 100 - 10 (garantia recente) = 90
    expect(health.score).toBe(90);
    expect(health.label).toBe('Excelente');
  });

  it('deve identificar anomalias reincidentes e reduzir score', async () => {
    await db.anomalies.bulkPut([
      {
        id: 'a1',
        companyId: 'test-co',
        workspaceId: 'ws-1',
        assetId: 'asset-2',
        clientId: 'client-1',
        siteId: 'site-1',
        assetExecutionId: 'ex1',
        title: 'Vazamento de gás',
        description: 'Vazando',
        severity: 'high',
        status: 'RESOLVED',
        photoUuids: [],
        createdAt: new Date(Date.now() - 10000).toISOString(),
        createdBy: 'tech-1'
      },
      {
        id: 'a2',
        companyId: 'test-co',
        workspaceId: 'ws-1',
        assetId: 'asset-2',
        clientId: 'client-1',
        siteId: 'site-1',
        assetExecutionId: 'ex2',
        title: 'Vazamento novamente',
        description: 'Vazando no mesmo lugar',
        severity: 'critical',
        status: 'OPEN',
        photoUuids: [],
        createdAt: new Date().toISOString(),
        createdBy: 'tech-1'
      }
    ]);

    const recurrence = await RecurrenceAnalyzer.checkRecurrence('asset-2', 'test-co', 'Vazamento');
    expect(recurrence.isRecurrent).toBe(true);
    expect(recurrence.count).toBe(2);

    const health = await HealthScoreService.calculateAssetHealth('asset-2', 'test-co');
    // Base: 100
    // Anomalia OPEN: -5
    // Anomalia critica: -10
    // Score: 100 - 5 - 10 = 85 (Boa)
    expect(health.score).toBe(85);
    expect(health.label).toBe('Boa');
  });

  it('deve aguentar performance de 50.000 eventos na Timeline', async () => {
    const batch = [];
    for (let i = 0; i < 50000; i++) {
      batch.push({
        id: `evt-perf-${i}`,
        aggregateId: `asset-${i % 500}`,
        aggregateType: 'asset',
        eventType: 'WORKORDER_COMPLETED',
        timestamp: new Date().toISOString(),
        actor: 'Tech',
        source: 'Sys',
        metadata: { clientId: 'client-1' },
        createdAt: new Date().toISOString(),
        syncStatus: 'synced'
      });
    }

    await db.operationalEvents.bulkPut(batch as any);

    const start = performance.now();
    const assetEvents = await db.operationalEvents.where({ aggregateId: 'asset-42' }).toArray();
    const end = performance.now();

    expect(assetEvents).toHaveLength(100);
    // Tempo de consulta p/ 50k registros deve ser infimo com indice
    expect(end - start).toBeLessThan(200);
  });
});
