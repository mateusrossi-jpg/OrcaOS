import { db } from '../storage/dexieDatabase';
import { Proposal } from '../domain/revenue';
import { ContractRenewal, ContractAlert } from '../domain/contracts';
import { OperationalEvent } from '../domain/operationalEvent';

export class ContractRenewalService {
  static async checkRenewals(companyId: string) {
    const activeContracts = await db.contracts.where({ companyId, status: 'ACTIVE' }).toArray();
    if (activeContracts.length === 0) return;

    const existingRenewals = await db.contractRenewals.where({ companyId }).toArray();
    const existingContractIds = new Set(existingRenewals.map(r => r.contractId));

    const now = new Date().getTime();
    const nowIso = new Date(now).toISOString();
    const days90 = 90 * 24 * 60 * 60 * 1000;

    const proposalsToPut: Proposal[] = [];
    const renewalsToPut: ContractRenewal[] = [];
    const alertsToPut: ContractAlert[] = [];
    const eventsToPut: OperationalEvent[] = [];

    for (let i = 0; i < activeContracts.length; i++) {
      const contract = activeContracts[i];
      if (!contract.endDate) continue;

      const end = new Date(contract.endDate).getTime();
      const timeToExpiration = end - now;

      // Se estiver a menos de 90 dias do fim
      if (timeToExpiration > 0 && timeToExpiration <= days90) {
        // Verifica se já não foi engatilhado
        if (!existingContractIds.has(contract.id)) {
          const baseValue = contract.billingAmount || 0;
          const reajuste = baseValue * 0.05; // Simulação de 5% de reajuste
          const proposalId = `prop-ren-${contract.id}-${now}`;

          proposalsToPut.push({
            id: proposalId,
            companyId,
            workspaceId: contract.workspaceId || 'default',
            anomalyId: 'RENEWAL', // Placeholder para distinguir
            clientId: contract.clientId,
            title: `Renovação de Contrato 2026/2027`,
            description: `Renovação automática do contrato de manutenção preventiva e corretiva com reajuste anual aplicado.`,
            amount: baseValue + reajuste,
            status: 'DRAFT',
            createdAt: nowIso
          });

          renewalsToPut.push({
            id: `ren-${contract.id}`,
            companyId,
            workspaceId: contract.workspaceId || 'default',
            contractId: contract.id,
            clientId: contract.clientId,
            proposalId: proposalId,
            status: 'PROPOSAL_GENERATED',
            generatedAt: nowIso,
            dueDate: contract.endDate
          });

          alertsToPut.push({
            id: `alert-ren-${contract.id}`,
            companyId,
            workspaceId: contract.workspaceId || 'default',
            contractId: contract.id,
            type: 'EXPIRING_SOON',
            message: `Contrato vence em menos de 90 dias. Proposta de renovação gerada automaticamente.`,
            resolved: false,
            createdAt: nowIso
          });

          eventsToPut.push({
            id: `evt-ren-${contract.id}-${now}`,
            aggregateId: contract.id,
            aggregateType: 'contract',
            eventType: 'CONTRACT_RENEWAL_GENERATED',
            timestamp: nowIso,
            actor: 'SYSTEM',
            source: 'ContractRenewalService',
            createdAt: nowIso
          });
        }
      }
    }

    if (proposalsToPut.length > 0) {
      await db.proposals.bulkPut(proposalsToPut);
      await db.contractRenewals.bulkPut(renewalsToPut);
      await db.contractAlerts.bulkPut(alertsToPut);
      await db.operationalEvents.bulkPut(eventsToPut);
    }
  }
}
