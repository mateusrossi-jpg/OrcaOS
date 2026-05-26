import { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';

export interface ClientProposalRepository {
  getAll(): Promise<ClientProposal[]>;
  getById(id: string): Promise<ClientProposal | undefined>;
  add(proposal: ClientProposal): Promise<ClientProposal>;
  update(proposal: ClientProposal): Promise<ClientProposal>;
  delete(id: string): Promise<void>;
  bulkAdd(proposals: ClientProposal[]): Promise<void>;
}
