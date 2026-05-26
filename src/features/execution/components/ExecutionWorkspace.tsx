import React, { useState } from 'react';
import { ExecutionHeader } from './ExecutionHeader';
import { ExecutionTimeline, TimelineEvent } from './ExecutionTimeline';
import { ExecutionQuickActions } from './ExecutionQuickActions';
import { ExecutionPressureCard } from './health/ExecutionPressureCard';

interface ExecutionWorkspaceProps {
  readonly workOrderId: string;
  readonly clientName: string;
  readonly onExit: () => void;
}

/**
 * ExecutionWorkspace
 * The Field-First Operational Interface.
 * No navigation sidebars, no bureaucratic ERP clutter. Just execution.
 */
export const ExecutionWorkspace: React.FC<ExecutionWorkspaceProps> = ({ workOrderId, clientName, onExit }) => {
  const [activeState, setActiveState] = useState<'idle' | 'in_progress' | 'paused'>('idle');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: '1', type: 'ARRIVAL', timestamp: new Date().toISOString(), description: 'Técnico chegou ao local' }
  ]);

  const handleAction = (action: string) => {
    // In a real app, this dispatches to the OperationalEventService via QueueEngine
    if (action === 'start') {
      setActiveState('in_progress');
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), type: 'START', timestamp: new Date().toISOString(), description: 'Execução iniciada' }]);
    } else if (action === 'pause') {
      setActiveState('paused');
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), type: 'PAUSE', timestamp: new Date().toISOString(), description: 'Execução pausada (motivo: aguardando)' }]);
    } else if (action === 'finish') {
      setActiveState('idle');
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), type: 'FINISH', timestamp: new Date().toISOString(), description: 'Serviço finalizado' }]);
    } else if (action === 'photo') {
      setTimeline(prev => [...prev, { id: crypto.randomUUID(), type: 'PHOTO', timestamp: new Date().toISOString(), description: 'Evidência fotográfica adicionada' }]);
    }
  };

  return (
    <div className="fixed inset-0 bg-surface-900 z-40 flex flex-col overflow-hidden">
      <ExecutionHeader 
        clientName={clientName} 
        workOrderId={workOrderId} 
        status={activeState === 'in_progress' ? 'Em andamento' : activeState === 'paused' ? 'Pausado' : 'Aguardando'} 
        onBack={onExit} 
      />

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <ExecutionPressureCard 
          slaMinutesRemaining={120} 
          isBlocked={false} 
          hasPendingMaterial={false} 
        />

        <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 mb-4">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Instruções</h2>
          <p className="text-text-primary text-sm leading-relaxed">
            Verificar vazamento na válvula principal. Trocar o reparo caso necessário. Trazer fotos do antes e depois.
          </p>
        </div>

        <ExecutionTimeline events={timeline} />
      </div>

      <ExecutionQuickActions activeState={activeState} onAction={handleAction} />
    </div>
  );
};
