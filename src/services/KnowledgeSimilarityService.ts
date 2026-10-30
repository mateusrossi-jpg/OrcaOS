import { db } from '../storage/dexieDatabase';
import { KnowledgeCase, KnowledgeSolution } from '../domain/knowledge';

export class KnowledgeSimilarityService {
  static async findSimilarCases(params: {
    companyId: string;
    assetType?: string;
    manufacturer?: string;
    failureCode?: string;
    query?: string;
  }): Promise<Array<{ caseData: KnowledgeCase; solutions: KnowledgeSolution[] }>> {
    const casesQuery = db.knowledgeCases.where({ companyId: params.companyId, status: 'PUBLISHED' });

    let potentialCases = await casesQuery.toArray();

    // Filtros de similaridade em memória para simplificar
    if (params.assetType) {
      potentialCases = potentialCases.filter(c => c.assetType === params.assetType);
    }

    if (params.manufacturer) {
      potentialCases = potentialCases.filter(c => c.manufacturer === params.manufacturer);
    }

    if (params.failureCode) {
      potentialCases = potentialCases.filter(c => c.failureCode === params.failureCode);
    }
    
    if (params.query) {
      const lowerQuery = params.query.toLowerCase();
      potentialCases = potentialCases.filter(c => 
        c.title.toLowerCase().includes(lowerQuery) || 
        c.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (potentialCases.length === 0) {
      return [];
    }

    const caseIds = potentialCases.map(c => c.id);
    const caseIdSet = new Set(caseIds);

    // Efficient batch fetching strategy:
    // For small case lists (<= 20), query targeted caseIds via index.
    // For larger case lists (> 20), fetch company solutions in a single range query to avoid N point-lookups.
    let allSolutions: KnowledgeSolution[];
    if (caseIds.length <= 20) {
      allSolutions = await db.knowledgeSolutions.where('caseId').anyOf(caseIds).toArray();
    } else {
      const companySolutions = await db.knowledgeSolutions.where({ companyId: params.companyId }).toArray();
      allSolutions = companySolutions.filter(s => caseIdSet.has(s.caseId));
    }

    const solutionsByCaseId = new Map<string, KnowledgeSolution[]>();
    for (const sol of allSolutions) {
      let caseSolutions = solutionsByCaseId.get(sol.caseId);
      if (!caseSolutions) {
        caseSolutions = [];
        solutionsByCaseId.set(sol.caseId, caseSolutions);
      }
      caseSolutions.push(sol);
    }

    return potentialCases.map(c => {
      const solutions = solutionsByCaseId.get(c.id) || [];
      // Sort solutions by success rate and verification
      solutions.sort((a, b) => {
        if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
        return b.successRate - a.successRate;
      });
      return { caseData: c, solutions };
    });
  }

  static async recommendForWorkOrder(params: {
    companyId: string;
    workspaceId: string;
    workOrderId: string;
    anomalyId: string;
    assetType?: string;
    manufacturer?: string;
    failureCode?: string;
  }): Promise<void> {
    const similar = await this.findSimilarCases(params);

    if (similar.length > 0) {
      // Pick top 3
      const topCases = similar.slice(0, 3);
      for (let i = 0; i < topCases.length; i++) {
        await db.knowledgeRecommendations.put({
          id: `rec-${Date.now()}-${i}`,
          companyId: params.companyId,
          workOrderId: params.workOrderId,
          anomalyId: params.anomalyId,
          recommendedCaseId: topCases[i].caseData.id,
          relevanceScore: 100 - (i * 10), // Simplificação
          createdAt: new Date().toISOString()
        });
      }
    }
  }
}
