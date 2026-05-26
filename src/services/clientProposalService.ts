/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 */
import { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';
import { dexieClientProposalRepository } from '../repositories/dexieClientProposalRepository';
import { ClientProposalRepository } from '../repositories/clientProposalRepository';

export class ClientProposalService {
  private repository: ClientProposalRepository;

  constructor(repository?: ClientProposalRepository) {
    this.repository = repository ?? dexieClientProposalRepository;
  }

  async getAll(): Promise<ClientProposal[]> {
    return await this.repository.getAll();
  }

  async getById(id: string): Promise<ClientProposal | undefined> {
    return await this.repository.getById(id);
  }

  async add(proposal: ClientProposal): Promise<ClientProposal> {
    return await this.repository.add(proposal);
  }

  async update(proposal: ClientProposal): Promise<ClientProposal> {
    return await this.repository.update(proposal);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

export const clientProposalService = new ClientProposalService();
