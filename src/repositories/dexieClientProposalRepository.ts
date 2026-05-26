/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 */
import { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';
import { ClientProposalRepository } from './clientProposalRepository';
import { db } from '../storage/dexieDatabase';

export class DexieClientProposalRepository implements ClientProposalRepository {
  async getAll(): Promise<ClientProposal[]> {
    const proposals = await db.clientProposals.toArray();
    return proposals.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getById(id: string): Promise<ClientProposal | undefined> {
    return await db.clientProposals.get(id);
  }

  async add(proposal: ClientProposal): Promise<ClientProposal> {
    await db.clientProposals.add(proposal);
    return proposal;
  }

  async update(proposal: ClientProposal): Promise<ClientProposal> {
    await db.clientProposals.put(proposal);
    return proposal;
  }

  async delete(id: string): Promise<void> {
    await db.clientProposals.delete(id);
  }

  async bulkAdd(proposals: ClientProposal[]): Promise<void> {
    await db.clientProposals.bulkAdd(proposals);
  }
}

export const dexieClientProposalRepository = new DexieClientProposalRepository();
