import { db } from '../storage/dexieDatabase';


export class KnowledgeRatingService {
  static async rateSolution(params: {
    companyId: string;
    solutionId: string;
    technicianId: string;
    workOrderId: string;
    solved: boolean;
    rating: number;
    comment?: string;
  }): Promise<void> {
    const now = new Date().toISOString();

    await db.knowledgeRatings.put({
      id: `rat-${Date.now()}`,
      companyId: params.companyId,
      solutionId: params.solutionId,
      technicianId: params.technicianId,
      workOrderId: params.workOrderId,
      solved: params.solved,
      rating: params.rating,
      comment: params.comment,
      createdAt: now
    });

    await db.operationalEvents.put({
      id: `evt-rat-${Date.now()}`,
      aggregateId: params.solutionId,
      aggregateType: 'knowledgeSolution',
      eventType: 'KNOWLEDGE_RATED',
      timestamp: now,
      actor: params.technicianId,
      source: 'KnowledgeRatingService',
      createdAt: now
    } as any);

    if (params.solved) {
      await db.operationalEvents.put({
        id: `evt-reu-${Date.now()}`,
        aggregateId: params.solutionId,
        aggregateType: 'knowledgeSolution',
        eventType: 'CASE_REUSED',
        timestamp: now,
        actor: params.technicianId,
        source: 'KnowledgeRatingService',
        createdAt: now
      } as any);
    }

    // Recalcular a taxa de sucesso da solução
    await this.recalculateSuccessRate(params.solutionId);
  }

  private static async recalculateSuccessRate(solutionId: string): Promise<void> {
    const ratings = await db.knowledgeRatings.where({ solutionId }).toArray();
    if (ratings.length === 0) return;

    const solvedCount = ratings.filter(r => r.solved).length;
    const successRate = (solvedCount / ratings.length) * 100;

    const solution = await db.knowledgeSolutions.get(solutionId);
    if (solution) {
      await db.knowledgeSolutions.update(solutionId, { 
        successRate,
        timesReused: ratings.length
      });
    }
  }
}
