import { db } from '../storage/dexieDatabase';
import { RenewalProposalGenerator } from './RenewalProposalGenerator';

export class ContractRenewalService {
  static async checkRenewals(companyId: string) {
    const activeContracts = await db.contracts.where({ companyId, status: 'ACTIVE' }).toArray();
    const now = new Date().getTime();
    const days90 = 90 * 24 * 60 * 60 * 1000;

    for (const contract of activeContracts) {
      if (!contract.endDate) continue;

      const end = new Date(contract.endDate).getTime();
      const timeToExpiration = end - now;

      // Se estiver a menos de 90 dias do fim
      if (timeToExpiration > 0 && timeToExpiration <= days90) {
        
        // Verifica se já não foi engatilhado
        const existingRenewal = await db.contractRenewals.where({ contractId: contract.id }).first();
        
        if (!existingRenewal) {
          const proposalId = await RenewalProposalGenerator.generate(companyId, contract.id);
          
          await db.contractRenewals.put({
            id: `ren-${contract.id}`,
            companyId,
            workspaceId: contract.workspaceId || 'default',
            contractId: contract.id,
            clientId: contract.clientId,
            proposalId: proposalId || undefined,
            status: 'PROPOSAL_GENERATED',
            generatedAt: new Date().toISOString(),
            dueDate: contract.endDate
          });

          await db.contractAlerts.put({
            id: `alert-ren-${contract.id}`,
            companyId,
            workspaceId: contract.workspaceId || 'default',
            contractId: contract.id,
            type: 'EXPIRING_SOON',
            message: `Contrato vence em menos de 90 dias. Proposta de renovação gerada automaticamente.`,
            resolved: false,
            createdAt: new Date().toISOString()
          });

          // Lança Evento
          await db.operationalEvents.put({
            id: `evt-ren-${Date.now()}`,
            aggregateId: contract.id,
            aggregateType: 'contract',
            eventType: 'CONTRACT_RENEWAL_GENERATED',
            timestamp: new Date().toISOString(),
            actor: 'SYSTEM',
            source: 'ContractRenewalService',
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  }
}
