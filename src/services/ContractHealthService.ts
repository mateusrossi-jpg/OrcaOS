import { db } from '../storage/dexieDatabase';

export class ContractHealthService {
  static async calculateHealth(companyId: string, contractId: string): Promise<number> {
    const contract = await db.contracts.get(contractId);
    if (!contract) return 0;

    let score = 100;

    // Subtrai pontos por anomalias em aberto
    const anomalies = await db.anomalies.where({ companyId, clientId: contract.clientId }).toArray();
    const openAnomalies = anomalies.filter(a => a.status === 'PENDING' || a.status === 'QUOTED');
    score -= openAnomalies.length * 5;

    // Subtrai pontos se houver OS atrasadas (simulação via DispatchAlerts)
    const alerts = await db.dispatchAlerts.where({ companyId }).filter(a => !a.resolved && a.type === 'LATE_ARRIVAL').toArray();
    if (alerts.length > 0) score -= 15;

    // Subtrai por inadimplência hipotética 
    // Na vida real cruzaria com o financeiro, mas vamos simular: se tiver muita corretiva sem pagar
    const unpaidProposals = await db.proposals.where({ companyId, clientId: contract.clientId, status: 'APPROVED' }).toArray();
    // Exemplo: se tem propostas aprovadas pendentes de faturamento
    if (unpaidProposals.length > 3) score -= 20;

    score = Math.max(0, Math.min(score, 100)); // Trava entre 0 e 100

    // Atualiza a tabela health
    const existing = await db.contractHealth.where({ contractId }).first();
    if (existing) {
      await db.contractHealth.update(existing.id, { healthScore: score, lastCalculatedAt: new Date().toISOString() });
    } else {
      await db.contractHealth.put({
        id: `ch-${contractId}`,
        companyId,
        workspaceId: contract.workspaceId || 'default',
        contractId,
        clientId: contract.clientId,
        healthScore: score,
        lastCalculatedAt: new Date().toISOString()
      });
    }

    return score;
  }
}
