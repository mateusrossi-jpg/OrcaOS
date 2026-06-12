import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../storage/dexieDatabase';
import { KnowledgeCaptureService } from '../services/KnowledgeCaptureService';
import { KnowledgeSimilarityService } from '../services/KnowledgeSimilarityService';
import { KnowledgeRatingService } from '../services/KnowledgeRatingService';
import { KnowledgePerformanceService } from '../services/KnowledgePerformanceService';

describe('Quality & Knowledge Engine P0', () => {
  beforeEach(async () => {
    await db.knowledgeCases.clear();
    await db.knowledgeSolutions.clear();
    await db.knowledgeRatings.clear();
    await db.knowledgeRecommendations.clear();
    await db.operationalEvents.clear();
  });

  it('deve capturar um caso e solução ao finalizar anomalia', async () => {
    const params = {
      companyId: 'co-1',
      workspaceId: 'ws-1',
      workOrderId: 'wo-1',
      title: 'Erro F4 Carrier',
      description: 'Ar não gela e painel pisca F4',
      assetType: 'Ar Condicionado',
      manufacturer: 'Carrier',
      failureCode: 'F4',
      severity: 'HIGH' as const,
      authorId: 'tech-1',
      solutionDescription: 'Trocada a placa inverter.',
      stepByStep: ['Desligar', 'Abrir', 'Trocar', 'Ligar'],
      repairTimeMin: 45,
      worked: true
    };

    const res = await KnowledgeCaptureService.captureCaseFromWorkOrder(params);
    expect(res.caseId).toBeDefined();
    expect(res.solutionId).toBeDefined();

    const capturedCase = await db.knowledgeCases.get(res.caseId);
    expect(capturedCase?.failureCode).toBe('F4');

    const evts = await db.operationalEvents.where({ eventType: 'KNOWLEDGE_CREATED' }).toArray();
    expect(evts.length).toBe(1);

    const evtsSolved = await db.operationalEvents.where({ eventType: 'CASE_SOLVED' }).toArray();
    expect(evtsSolved.length).toBe(1);
  });

  it('deve registrar avaliacao e recalcular sucesso de solucao', async () => {
    const caseRes = await KnowledgeCaptureService.captureCaseFromWorkOrder({
      companyId: 'co-1', workspaceId: 'ws-1', workOrderId: 'wo-1',
      title: 'T1', description: 'D1', severity: 'LOW', authorId: 'a1',
      solutionDescription: 'S1', stepByStep: [], repairTimeMin: 10, worked: false
    });

    const sol = await db.knowledgeSolutions.get(caseRes.solutionId);
    expect(sol?.successRate).toBe(0);

    // Primeiro tecnico testou e funcionou
    await KnowledgeRatingService.rateSolution({
      companyId: 'co-1', solutionId: caseRes.solutionId, technicianId: 'tech-2',
      workOrderId: 'wo-2', solved: true, rating: 5
    });

    let updatedSol = await db.knowledgeSolutions.get(caseRes.solutionId);
    expect(updatedSol?.successRate).toBe(100);
    expect(updatedSol?.timesReused).toBe(1);

    // Segundo tecnico testou e nao funcionou
    await KnowledgeRatingService.rateSolution({
      companyId: 'co-1', solutionId: caseRes.solutionId, technicianId: 'tech-3',
      workOrderId: 'wo-3', solved: false, rating: 2
    });

    updatedSol = await db.knowledgeSolutions.get(caseRes.solutionId);
    expect(updatedSol?.successRate).toBe(50); // 1 funcionou de 2 = 50%
    expect(updatedSol?.timesReused).toBe(2);
  });

  it('deve trazer metricas de performance', async () => {
    const coId = 'co-2';
    const c1 = await KnowledgeCaptureService.captureCaseFromWorkOrder({
      companyId: coId, workspaceId: 'w', workOrderId: 'wo1', title: 'T1', description: 'D1',
      severity: 'LOW', authorId: 'a1', solutionDescription: 'S1', stepByStep: [], repairTimeMin: 10, worked: true
    });
    const c2 = await KnowledgeCaptureService.captureCaseFromWorkOrder({
      companyId: coId, workspaceId: 'w', workOrderId: 'wo2', title: 'T2', description: 'D2',
      severity: 'LOW', authorId: 'a1', solutionDescription: 'S2', stepByStep: [], repairTimeMin: 10, worked: false
    });

    // Rating reusado para T1
    await KnowledgeRatingService.rateSolution({
      companyId: coId, solutionId: c1.solutionId, technicianId: 't2', workOrderId: 'wo3', solved: true, rating: 5
    });

    const metrics = await KnowledgePerformanceService.getPerformanceMetrics(coId);
    expect(metrics.casesCreated).toBe(2);
    expect(metrics.casesSolved).toBe(1);
    expect(metrics.reusageRate).toBe(100); // T1 had 2 ratings (1 on capture, 1 explicit). Total 2 reuses / 2 solutions = 100%
  });

  it('deve realizar busca de similaridade e recomendar casos em alta velocidade', async () => {
    const companyId = 'co-scale';
    const cases = [];
    const solutions = [];

    // 1000 items para teste de carga pra não estourar os 5s da vitest.
    // O dexie in-memory pode demorar um pouco mais se inserir muitos.
    for (let i = 0; i < 1000; i++) {
      cases.push({
        id: `c-${i}`, companyId, workspaceId: 'w', title: `Title ${i}`, description: `Desc ${i}`,
        assetType: i % 2 === 0 ? 'HVAC' : 'Solar', manufacturer: i % 3 === 0 ? 'Carrier' : 'LG',
        failureCode: `E${i % 5}`, severity: 'LOW', status: 'PUBLISHED', authorId: 'u1',
        createdAt: '', updatedAt: ''
      });
      solutions.push({
        id: `s-${i}`, companyId, caseId: `c-${i}`, description: 'S', stepByStep: [],
        successRate: 100, avgRepairTimeMin: 10, timesReused: 0, isVerified: false, authorId: 'u1', createdAt: ''
      });
    }

    await db.knowledgeCases.bulkPut(cases as any);
    await db.knowledgeSolutions.bulkPut(solutions as any);

    // Inserir um alvo
    await db.knowledgeCases.put({
      id: 'c-target', companyId, workspaceId: 'w', title: 'Erro de compressão', description: '',
      assetType: 'HVAC', manufacturer: 'Daikin', failureCode: 'E4', severity: 'CRITICAL', status: 'PUBLISHED',
      authorId: 'u1', createdAt: '', updatedAt: ''
    } as any);

    const startSearch = performance.now();
    const result = await KnowledgeSimilarityService.findSimilarCases({
      companyId, assetType: 'HVAC', failureCode: 'E4'
    });
    const endSearch = performance.now();

    expect(result.length).toBeGreaterThan(0);
    // Tempo de similaridade abaixo de 4000ms para 1000 itens in memory (leniente para runners virtuais)
    expect(endSearch - startSearch).toBeLessThan(4000);
  });
});
