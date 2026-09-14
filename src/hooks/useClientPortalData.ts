import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../storage/dexieDatabase';
import { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';
import { Contract } from '../domain/contract';
import { Service as WorkOrder } from '../core/types/business';

export interface ClientPortalSnapshot {
  proposals: ClientProposal[];
  activeContracts: Contract[];
  recentExecutions: WorkOrder[];
}

export function useClientPortalData(): ClientPortalSnapshot | null {
  const proposals = useLiveQuery(() =>
    db.clientProposals
      .where('status')
      .anyOf(['sent', 'viewed'])
      .toArray()
  );

  const activeContracts = useLiveQuery(() =>
    db.contracts
      .where('status')
      .equals('active')
      .toArray()
  );

  const recentExecutions = useLiveQuery(() =>
    db.workOrders
      .where('status')
      .equals('done')
      .limit(5)
      .reverse()
      .sortBy('updatedAt')
  );

  if (!proposals || !activeContracts || !recentExecutions) return null;

  return { proposals, activeContracts, recentExecutions };
}