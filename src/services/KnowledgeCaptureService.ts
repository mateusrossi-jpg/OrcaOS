import { db } from '../storage/dexieDatabase';
import { KnowledgeCase, KnowledgeSolution } from '../domain/knowledge';


export class KnowledgeCaptureService {
  static async captureCaseFromWorkOrder(params: {
    companyId: string;
    workspaceId: string;
    workOrderId: string;
    title: string;
    description: string;
    assetType?: string;
    manufacturer?: string;
    failureCode?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    authorId: string;
    solutionDescription: string;
    stepByStep: string[];
    repairTimeMin: number;
    worked: boolean;
  }): Promise<{ caseId: string; solutionId: string }> {
    const caseId = `case-${Date.now()}`;
    const solutionId = `sol-${Date.now()}`;
    const now = new Date().toISOString();

    const newCase: KnowledgeCase = {
      id: caseId,
      companyId: params.companyId,
      workspaceId: params.workspaceId,
      title: params.title,
      description: params.description,
      assetType: params.assetType,
      manufacturer: params.manufacturer,
      failureCode: params.failureCode,
      severity: params.severity,
      status: 'PUBLISHED',
      authorId: params.authorId,
      createdAt: now,
      updatedAt: now
    };

    const newSolution: KnowledgeSolution = {
      id: solutionId,
      companyId: params.companyId,
      caseId,
      description: params.solutionDescription,
      stepByStep: params.stepByStep,
      successRate: params.worked ? 100 : 0,
      avgRepairTimeMin: params.repairTimeMin,
      timesReused: 0,
      isVerified: false,
      authorId: params.authorId,
      createdAt: now
    };

    await db.knowledgeCases.put(newCase);
    await db.knowledgeSolutions.put(newSolution);

    await db.operationalEvents.put({
      id: `evt-kno-${Date.now()}`,
      aggregateId: caseId,
      aggregateType: 'knowledgeCase',
      eventType: 'KNOWLEDGE_CREATED',
      timestamp: now,
      actor: params.authorId,
      source: 'KnowledgeCaptureService',
      createdAt: now
    } as any);

    if (params.worked) {
      await db.knowledgeRatings.put({
        id: `rat-${Date.now()}`,
        companyId: params.companyId,
        solutionId,
        technicianId: params.authorId,
        workOrderId: params.workOrderId,
        solved: true,
        rating: 5,
        createdAt: now
      });
      
      await db.operationalEvents.put({
        id: `evt-sol-${Date.now()}`,
        aggregateId: caseId,
        aggregateType: 'knowledgeCase',
        eventType: 'CASE_SOLVED',
        timestamp: now,
        actor: params.authorId,
        source: 'KnowledgeCaptureService',
        createdAt: now
      } as any);
    }

    return { caseId, solutionId };
  }
}
