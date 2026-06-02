import { db } from '../storage/dexieDatabase';

export class RenewalProposalGenerator {
  static async generate(companyId: string, contractId: string): Promise<string | null> {
    const contract = await db.contracts.get(contractId);
    if (!contract) return null;

    // Aqui seria gerado o reajuste inflacionário (ex: IGPM)
    const baseValue = contract.amount || 0;
    const reajuste = baseValue * 0.05; // Simulação de 5% de reajuste

    const proposalId = `prop-ren-${contractId}-${Date.now()}`;
    await db.proposals.put({
      id: proposalId,
      companyId,
      workspaceId: contract.workspaceId || 'default',
      anomalyId: 'RENEWAL', // Placeholder para distinguir
      clientId: contract.clientId,
      title: `Renovação de Contrato 2026/2027`,
      description: `Renovação automática do contrato de manutenção preventiva e corretiva com reajuste anual aplicado.`,
      amount: baseValue + reajuste,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    });

    return proposalId;
  }
}
