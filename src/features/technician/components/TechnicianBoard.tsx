import React, { useEffect, useState, useMemo } from 'react';
import { operationalReadModelService } from '../../../services/operationalReadModelService';
import { operationalSubscriptionService } from '../../../services/operationalSubscriptionService';
import { QueueWorkflowInput, sortOperationalQueue, buildQueueSummary } from '../../../core/workflow/queueEngine';
import { TechnicianQueue } from './TechnicianQueue';
import { OperationalPressureCard } from '../../sla/components/OperationalPressureCard';
import { ERPLoader, ERPTokens } from '../../../ui/system';
import { OperationalFlowLayout } from '../../../ui/layouts';

export function TechnicianBoard() {
  const [workflows, setWorkflows] = useState<QueueWorkflowInput[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const queue = await operationalReadModelService.getOperationalQueue();
        if (mounted) {
          // Keep it sorted by engine rules
          setWorkflows(sortOperationalQueue(queue));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading technician queue:', err);
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to workflow updates
    // In actual app, we would use subscribeBoardUpdates or a specific queue update.
    // Here we use the generic operational fanout or board update as a proxy.
    const unsubscribe = operationalSubscriptionService.subscribeBoardUpdates(() => {
      loadData();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const summary = useMemo(() => buildQueueSummary(workflows), [workflows]);

  const queues = useMemo(() => {
    return {
      execution: workflows.filter(w => w.status === 'execution'),
      authorized: workflows.filter(w => w.status === 'authorized'),
      blocked: workflows.filter(w => w.blocked || w.status === 'blocked'),
      completed: workflows.filter(w => w.status === 'finished' || w.status === 'archived'),
    };
  }, [workflows]);

  if (isLoading) {
    return <ERPLoader message="Carregando hub do técnico..." />;
  }

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className={`text-lg font-bold ${ERPTokens.colors.textPrimary}`}>Technician Workflow Hub</h2>
        <p className={`text-sm ${ERPTokens.colors.textSecondary}`}>Gerenciamento da fila operacional e pressão de execução</p>
      </div>
      <div className="w-full sm:w-auto min-w-[300px]">
        <OperationalPressureCard summary={summary} />
      </div>
    </div>
  );

  return (
    <OperationalFlowLayout header={header}>
      <div className="flex gap-4 h-full min-h-[500px]">
          <TechnicianQueue
            title="Execução Ativa"
            workflows={queues.execution}
            accentColor="bg-amber-500"
          />
          <TechnicianQueue
            title="Fila de Espera (Autorizados)"
            workflows={queues.authorized}
            accentColor="bg-orange-500"
          />
          <TechnicianQueue 
            title="Impedimentos / Bloqueios" 
            workflows={queues.blocked} 
            accentColor="bg-red-500" 
          />
          <TechnicianQueue 
            title="Concluídos Recentes" 
            workflows={queues.completed.slice(0, 10)} 
            accentColor="bg-green-500" 
          />
        </div>
    </OperationalFlowLayout>
  );
}
