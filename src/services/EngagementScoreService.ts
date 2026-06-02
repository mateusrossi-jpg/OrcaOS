import { db } from '../storage/dexieDatabase';

export class EngagementScoreService {
  static async calculateEngagement(companyId: string, clientId: string): Promise<void> {
    const workspaceId = 'default';
    const now = new Date().toISOString();

    let score = 0;
    
    // Exemplos práticos de engajamento do cliente
    const proposals = await db.proposals.where({ clientId }).toArray();
    const approvedProposals = proposals.filter(p => p.status === 'APPROVED');
    
    if (proposals.length > 0) {
      score += (approvedProposals.length / proposals.length) * 50; // Até 50 pontos por aprovação de propostas
    }

    // Acessos ao portal (simplificado, se teve aprovação, deduzimos que acessou o portal)
    if (approvedProposals.length > 0) {
      score += 25;
    }

    // Pagamentos / Finanças (simplificado)
    score += 25; // default para base de clientes regular

    const existing = await db.customerEngagement.where({ clientId }).first();
    if (existing) {
      await db.customerEngagement.update(existing.id, {
        engagementScore: Math.round(score),
        proposalsApproved: approvedProposals.length,
        totalInteractions: proposals.length,
        calculatedAt: now
      });
    } else {
      await db.customerEngagement.put({
        id: `eng-${Date.now()}`,
        companyId,
        workspaceId,
        clientId,
        engagementScore: Math.round(score),
        proposalsApproved: approvedProposals.length,
        totalInteractions: proposals.length,
        calculatedAt: now
      });
    }
  }
}
