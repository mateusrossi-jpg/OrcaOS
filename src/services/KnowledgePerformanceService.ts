import { db } from '../storage/dexieDatabase';

export class KnowledgePerformanceService {
  static async getPerformanceMetrics(companyId: string): Promise<{
    casesCreated: number;
    casesSolved: number;
    reusageRate: number;
    topSolutions: Array<{ title: string; successRate: number; reuses: number }>;
    topFailures: Array<{ failureCode: string; count: number }>;
  }> {
    const cases = await db.knowledgeCases.where({ companyId, status: 'PUBLISHED' }).toArray();
    const solutions = await db.knowledgeSolutions.where({ companyId }).toArray();

    const casesSolved = solutions.filter(s => s.successRate > 0).length;
    const totalReuses = solutions.reduce((sum, s) => sum + (s.timesReused || 0), 0);

    const reusageRate = solutions.length > 0 ? (totalReuses / solutions.length) * 100 : 0;

    // Top Solutions
    const sortedSolutions = [...solutions].sort((a, b) => (b.timesReused || 0) - (a.timesReused || 0)).slice(0, 5);
    const topSolutions = [];
    for (const sol of sortedSolutions) {
      const parentCase = cases.find(c => c.id === sol.caseId);
      if (parentCase) {
        topSolutions.push({
          title: parentCase.title,
          successRate: sol.successRate,
          reuses: sol.timesReused
        });
      }
    }

    // Top Failures
    const failureCounts: Record<string, number> = {};
    for (const c of cases) {
      if (c.failureCode) {
        failureCounts[c.failureCode] = (failureCounts[c.failureCode] || 0) + 1;
      }
    }

    const topFailures = Object.entries(failureCounts)
      .map(([code, count]) => ({ failureCode: code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      casesCreated: cases.length,
      casesSolved,
      reusageRate,
      topSolutions,
      topFailures
    };
  }
}
