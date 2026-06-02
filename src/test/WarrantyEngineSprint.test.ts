import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { WarrantyEngine } from '../services/WarrantyEngine';
import { WarrantyAlertService } from '../services/WarrantyAlertService';
import { RecurrenceAnalyzer } from '../services/RecurrenceAnalyzer';
import { WarrantyFinancialImpact } from '../services/WarrantyFinancialImpact';

describe('Warranty & Return Automation Engine P0', () => {
  beforeEach(async () => {
    await db.warrantyCoverage.clear();
    await db.warrantyClaims.clear();
    await db.warrantyAlerts.clear();
    await db.warrantyIncidents.clear();
    await db.operationalEvents.clear();
  });

  it('deve registrar cobertura de garantia e consultar proteção ativa', async () => {
    const companyId = 'test-co';
    const assetId = 'asset-1';

    await WarrantyEngine.registerCoverage({
      id: 'w-1', companyId, workspaceId: 'w-1', assetId,
      partName: 'Compressor', provider: 'MANUFACTURER',
      startDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE', costProtected: 4500
    });

    const result = await WarrantyEngine.checkAssetCoverage(companyId, assetId);
    expect(result.hasActiveCoverage).toBe(true);
    expect(result.protectedValue).toBe(4500);

    const events = await db.operationalEvents.where({ eventType: 'WARRANTY_CREATED' }).toArray();
    expect(events.length).toBe(1);
  });

  it('deve alertar sobre garantias vencendo e expiradas', async () => {
    const companyId = 'test-co';

    // Uma garantia já expirada e outra expirando em 15 dias
    await db.warrantyCoverage.bulkPut([
      { id: 'w-exp', companyId, workspaceId: 'w', assetId: 'a1', partName: 'P1', provider: 'MANUFACTURER', startDate: '', expirationDate: new Date(Date.now() - 10000).toISOString(), status: 'ACTIVE', costProtected: 100 },
      { id: 'w-soon', companyId, workspaceId: 'w', assetId: 'a2', partName: 'P2', provider: 'MANUFACTURER', startDate: '', expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'ACTIVE', costProtected: 100 }
    ]);

    await WarrantyAlertService.evaluateExpirations(companyId);

    const alerts = await db.warrantyAlerts.toArray();
    expect(alerts.length).toBe(2);

    const expAlert = alerts.find(a => a.type === 'EXPIRED');
    const soonAlert = alerts.find(a => a.type === 'EXPIRING_SOON');

    expect(expAlert).toBeDefined();
    expect(soonAlert).toBeDefined();

    const events = await db.operationalEvents.where({ eventType: 'WARRANTY_EXPIRING' }).toArray();
    expect(events.length).toBe(1); // Somente a soon gera evento de 'expirando'
  });

  it('deve analisar reincidência e escalar criticidade', async () => {
    const companyId = 'test-co';
    const assetId = 'asset-2';
    const partName = 'Placa Principal';

    const r1 = await RecurrenceAnalyzer.analyze(companyId, assetId, partName, 'Curto-circuito');
    expect(r1.isRecurrence).toBe(false);
    expect(r1.level).toBe('LOW');

    const r2 = await RecurrenceAnalyzer.analyze(companyId, assetId, partName, 'Curto-circuito de novo');
    expect(r2.isRecurrence).toBe(true);
    expect(r2.level).toBe('MEDIUM');

    const r3 = await RecurrenceAnalyzer.analyze(companyId, assetId, partName, 'Mais um curto');
    expect(r3.isRecurrence).toBe(true);
    expect(r3.level).toBe('HIGH');

    const r4 = await RecurrenceAnalyzer.analyze(companyId, assetId, partName, 'Explodiu');
    expect(r4.isRecurrence).toBe(true);
    expect(r4.level).toBe('CRITICAL');

    const events = await db.operationalEvents.where({ eventType: 'RECURRENCE_DETECTED' }).toArray();
    expect(events.length).toBe(3); // r2, r3, r4
  });

  it('deve calcular impacto financeiro de garantias', async () => {
    const companyId = 'test-co';

    await db.warrantyCoverage.put({
      id: 'w-1', companyId, workspaceId: 'w', assetId: 'a1', partName: 'P1', provider: 'MANUFACTURER',
      startDate: '', expirationDate: '', status: 'ACTIVE', costProtected: 50000
    });

    await db.warrantyClaims.put({
      id: 'wc-1', companyId, workspaceId: 'w', coverageId: 'w-2', assetId: 'a2', claimDate: '',
      reason: '', status: 'CLAIMED', financialRecovery: 12500
    });

    const impact = await WarrantyFinancialImpact.calculateImpact(companyId);
    expect(impact.protectedRevenue).toBe(50000);
    expect(impact.avoidedCosts).toBe(12500);
    expect(impact.claimedWarranties).toBe(1);
  });

  it('deve suportar carga alta de registros operacionais', async () => {
    const companyId = 'test-co';
    const incidents = [];
    
    // Inserir 1000 incidentes para simular carga
    for (let i = 0; i < 1000; i++) {
      incidents.push({
        id: `inc-perf-${i}`, companyId, workspaceId: 'w-1', assetId: `a-${i}`, partName: 'Placa',
        incidentDate: '', symptom: '', isRecurrence: false, recurrenceLevel: 'LOW'
      });
    }

    const startInsert = performance.now();
    await db.warrantyIncidents.bulkPut(incidents as any);
    const endInsert = performance.now();
    
    expect(endInsert - startInsert).toBeLessThan(8000); 

    // Vamos testar o analisador contra a base cheia para um ativo que já tem histórico falso
    await db.warrantyIncidents.put({
      id: 'inc-tgt-1', companyId, workspaceId: 'w', assetId: 'target-asset', partName: 'Filtro',
      incidentDate: '', symptom: '', isRecurrence: false, recurrenceLevel: 'LOW'
    });

    const startQuery = performance.now();
    const res = await RecurrenceAnalyzer.analyze(companyId, 'target-asset', 'Filtro', 'Vazamento');
    const endQuery = performance.now();

    expect(res.isRecurrence).toBe(true);
    expect(endQuery - startQuery).toBeLessThan(1000); 
  });
});
