import { db } from '../storage/dexieDatabase';
import { StockService } from './StockService';

export class InventoryReservationService {
  // Listen for PROPOSAL_APPROVED
  static async handleProposalApproved(proposalId: string): Promise<void> {
    const proposal = await db.proposals.get(proposalId);
    if (!proposal) return;

    // No MVP, supomos que a proposta tem itens atrelados (não modelado explicitamente ainda no core,
    // mas vamos inferir que o domínio chamaria a reserva para os itens listados na proposta).
    // Aqui fazemos um mock para fins do Engine:
    
    // Na prática iteraríamos sobre proposal.items
    // await StockService.reserve(proposal.companyId, proposal.workspaceId, item.id, item.qty, proposalId, 'PROPOSAL');
  }
}
