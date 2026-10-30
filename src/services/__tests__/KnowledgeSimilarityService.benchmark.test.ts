import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../storage/dexieDatabase';
import { KnowledgeSimilarityService } from '../KnowledgeSimilarityService';
import { KnowledgeCase, KnowledgeSolution } from '../../domain/knowledge';

describe('KnowledgeSimilarityService Benchmark', () => {
  beforeEach(async () => {
    await db.knowledgeCases.clear();
    await db.knowledgeSolutions.clear();
  });

  const runBenchmark = async (numCases: number) => {
    const companyId = 'bench-company';
    const cases: KnowledgeCase[] = [];
    const solutions: KnowledgeSolution[] = [];

    for (let i = 0; i < numCases; i++) {
      const caseId = `c-${i}`;
      cases.push({
        id: caseId,
        companyId,
        workspaceId: 'w1',
        title: `Case Title ${i}`,
        description: `Case Description ${i}`,
        assetType: 'HVAC',
        manufacturer: 'Carrier',
        failureCode: 'E1',
        severity: 'MEDIUM',
        status: 'PUBLISHED',
        authorId: 'u1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      solutions.push({
        id: `s-${i}-1`,
        companyId,
        caseId,
        description: `Solution 1 for case ${i}`,
        stepByStep: ['step 1'],
        successRate: 80,
        avgRepairTimeMin: 30,
        timesReused: 5,
        isVerified: true,
        authorId: 'u1',
        createdAt: new Date().toISOString(),
      });
      solutions.push({
        id: `s-${i}-2`,
        companyId,
        caseId,
        description: `Solution 2 for case ${i}`,
        stepByStep: ['step 1', 'step 2'],
        successRate: 95,
        avgRepairTimeMin: 20,
        timesReused: 10,
        isVerified: false,
        authorId: 'u1',
        createdAt: new Date().toISOString(),
      });
    }

    await db.knowledgeCases.bulkPut(cases);
    await db.knowledgeSolutions.bulkPut(solutions);

    // Warmup
    await KnowledgeSimilarityService.findSimilarCases({
      companyId,
      assetType: 'HVAC',
      failureCode: 'E1',
    });

    // Measured runs
    const runs = 5;
    let totalMs = 0;
    for (let r = 0; r < runs; r++) {
      const start = performance.now();
      const results = await KnowledgeSimilarityService.findSimilarCases({
        companyId,
        assetType: 'HVAC',
        failureCode: 'E1',
      });
      totalMs += (performance.now() - start);
      expect(results.length).toBe(numCases);
    }

    const avgMs = totalMs / runs;
    console.log(`[OPTIMIZED BENCHMARK] N=${numCases} cases: Average time = ${avgMs.toFixed(2)} ms (${runs} runs)`);
    return avgMs;
  };

  it('measures optimized performance for 100 cases', async () => {
    await runBenchmark(100);
  }, 15000);

  it('measures optimized performance for 500 cases', async () => {
    await runBenchmark(500);
  }, 15000);

  it('measures optimized performance for 1000 cases', async () => {
    await runBenchmark(1000);
  }, 30000);
});
