import React, { useEffect, useState, useMemo } from 'react';
import { ClientPipelineProjection } from '../../../domain/operationalProjections';
import { operationalReadModelService } from '../../../services/operationalReadModelService';
import { operationalSubscriptionService } from '../../../services/operationalSubscriptionService';
import { CRMColumn } from './CRMColumn';

interface CRMBoardProps {
  onClientClick?: (clientId: string) => void;
}

export function CRMBoard({ onClientClick }: CRMBoardProps) {
  const [pipeline, setPipeline] = useState<Record<string, ClientPipelineProjection>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Hydration & Subscription
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const data = await operationalReadModelService.getClientPipelineProjection();
        if (mounted) {
          setPipeline(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading CRM pipeline:', err);
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to CRM incremental updates (set-based iteration is safe now)
    const unsubscribe = operationalSubscriptionService.subscribeClientPipelineUpdates(() => {
      loadData();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Projection Derivation (Categorization)
  const columns = useMemo(() => {
    const clients = Object.values(pipeline);
    
    return {
      leads: clients.filter(c => c.status === 'lead'),
      proposals: clients.filter(c => c.status === 'proposal_sent'),
      approved: clients.filter(c => c.status === 'approved'),
      execution: clients.filter(c => c.status === 'execution'),
      finalized: clients.filter(c => c.status === 'finalized'),
      recurring: clients.filter(c => c.status === 'recurring_candidate'),
    };
  }, [pipeline]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-100">CRM Pipeline</h2>
          <p className="text-sm text-gray-400">Fluxo operacional de relacionamento focado em conversão e recorrência</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-gray-500 uppercase font-semibold">Total Base</span>
            <p className="text-xl font-bold text-yellow-500">{Object.keys(pipeline).length}</p>
          </div>
        </div>
      </div>

      {/* Board Scrollable Area */}
      <div className="flex-1 overflow-x-auto p-6 bg-gray-950/20">
        <div className="flex gap-4 h-full min-h-[500px]">
          <CRMColumn 
            title="Leads / Oportunidades" 
            clients={columns.leads} 
            accentColor="bg-blue-500" 
            onCardClick={onClientClick}
          />
          <CRMColumn 
            title="Propostas Enviadas" 
            clients={columns.proposals} 
            accentColor="bg-yellow-500" 
            onCardClick={onClientClick}
          />
          <CRMColumn 
            title="Aprovados / Ganho" 
            clients={columns.approved} 
            accentColor="bg-green-500" 
            onCardClick={onClientClick}
          />
          <CRMColumn 
            title="Em Execução" 
            clients={columns.execution} 
            accentColor="bg-purple-500" 
            onCardClick={onClientClick}
          />
          <CRMColumn 
            title="Finalizados" 
            clients={columns.finalized} 
            accentColor="bg-gray-500" 
            onCardClick={onClientClick}
          />
          <CRMColumn 
            title="Candidatos à Recorrência" 
            clients={columns.recurring} 
            accentColor="bg-indigo-500" 
            onCardClick={onClientClick}
          />
        </div>
      </div>
    </div>
  );
}
