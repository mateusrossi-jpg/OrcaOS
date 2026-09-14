/**
 * OFFICIAL ARCHITECTURE: UI -> Hooks -> Services -> Repositories -> Dexie.
 * Do not access storage/repository directly from UI/hooks.
 */

import { db } from '../storage/dexieDatabase';
import { Proposal } from '../domain/revenue';

export class ProposalService {
  async getAll(): Promise<Proposal[]> {
    return await db.proposals.toArray();
  }

  async getById(id: string): Promise<Proposal | undefined> {
    return await db.proposals.get(id);
  }

  async getByAnomalyId(anomalyId: string): Promise<Proposal[]> {
    return await db.proposals.where('anomalyId').equals(anomalyId).toArray();
  }

  async put(proposal: Proposal): Promise<void> {
    await db.proposals.put(proposal);
  }

  async update(id: string, changes: Partial<Proposal>): Promise<void> {
    await db.proposals.update(id, changes);
  }
}

export const proposalService = new ProposalService();
