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

    const companySolutions = await db.knowledgeSolutions.where({ companyId: params.companyId }).toArray();
    const caseIdSet = new Set(potentialCases.map(c => c.id));
    const solutionsByCaseId = new Map<string, KnowledgeSolution[]>();

    for (const s of companySolutions) {
      if (caseIdSet.has(s.caseId)) {
        let list = solutionsByCaseId.get(s.caseId);
        if (!list) {
          list = [];
          solutionsByCaseId.set(s.caseId, list);
        }
        list.push(s);
      }
    }

    const results = potentialCases.map(c => {
      const solutions = solutionsByCaseId.get(c.id) || [];
      // Sort solutions by success rate and verification
      solutions.sort((a, b) => {
        if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
        return b.successRate - a.successRate;
      });
      return { caseData: c, solutions };
    });

    return results;
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
      const now = Date.now();
      const createdAt = new Date().toISOString();
      const recommendations = topCases.map((item, i) => ({
        id: `rec-${now}-${i}`,
        companyId: params.companyId,
        workOrderId: params.workOrderId,
        anomalyId: params.anomalyId,
        recommendedCaseId: item.caseData.id,
        relevanceScore: 100 - (i * 10), // Simplificação
        createdAt
      }));
      await db.knowledgeRecommendations.bulkPut(recommendations);
    }
  }
}
