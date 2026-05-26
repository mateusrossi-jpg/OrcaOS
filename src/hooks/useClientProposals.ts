import { useState, useEffect, useCallback } from 'react';
import { ClientProposal } from '../features/clientPortal/storage/clientProposalStorage';
import { clientProposalService } from '../services/clientProposalService';

export function useClientProposals() {
  const [proposals, setProposals] = useState<ClientProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientProposalService.getAll();
      setProposals(data);
    } catch (error) {
      console.error('Failed to load client proposals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const addOrUpdateProposal = async (proposal: ClientProposal) => {
    await clientProposalService.update(proposal);
    await fetchProposals();
  };

  const removeProposal = async (id: string) => {
    await clientProposalService.delete(id);
    await fetchProposals();
  };

  return { proposals, loading, refresh: fetchProposals, addOrUpdateProposal, removeProposal };
}
