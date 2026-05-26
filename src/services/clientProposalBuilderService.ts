import type { Client, WorkOrder } from '../core/types/business';
import type { CalculationCapture } from '../core/types/workflow';
import type { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';
import { buildClientProposalFromCaptures } from '../features/clientPortal/storage/buildClientProposalFromCaptures';

export async function buildClientProposal(input: {
  captures: CalculationCapture[];
  activeClient?: Client | null;
  activeWorkOrder?: WorkOrder | null;
}): Promise<ClientProposal> {
  return buildClientProposalFromCaptures(input);
}
