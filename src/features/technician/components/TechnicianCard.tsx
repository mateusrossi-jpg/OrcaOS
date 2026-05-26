import React from 'react';
import { QueueWorkflowInput, getQueueDerivedState, getQueuePriority, getWorkflowWarning } from '../../../core/workflow/queueEngine';
import { SLABadge } from '../../sla/components/SLABadge';

interface TechnicianCardProps {
  workflow: QueueWorkflowInput;
  onClick?: (id: string) => void;
}

export function TechnicianCard({ workflow, onClick }: TechnicianCardProps) {
  const derivedState = getQueueDerivedState(workflow);
  const priority = getQueuePriority(workflow);
  const warning = getWorkflowWarning(workflow);

  // Map QueuePriority to SLAStatus for visual consistency
  const getBadgeStatus = () => {
    if (derivedState === 'blocked') return 'blocked';
    if (derivedState === 'inactive' || derivedState === 'awaiting_client') return 'stalled';
    if (priority === 'critical') return 'critical';
    if (priority === 'high') return 'warning';
    return 'healthy';
  };

  return (
    <div 
      onClick={() => onClick?.(workflow.id)}
      className={`bg-gray-900 border rounded-lg p-3 hover:bg-gray-800/80 transition-colors cursor-pointer flex flex-col gap-2
        ${priority === 'critical' ? 'border-red-900/50' : priority === 'high' ? 'border-yellow-900/50' : 'border-gray-800'}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-mono">{workflow.id.substring(0, 8)}...</span>
          <span className="text-sm font-medium text-gray-200 capitalize mt-0.5">Estado: {workflow.status}</span>
        </div>
        <SLABadge status={getBadgeStatus()} label={warning} />
      </div>

      {(workflow.blockedReason || workflow.awaitingMaterial) && (
        <div className="mt-2 text-xs bg-gray-950 p-2 rounded border border-gray-800/60 text-gray-400">
          {workflow.blockedReason && <p><span className="text-red-400 font-semibold mr-1">Bloqueio:</span>{workflow.blockedReason}</p>}
          {workflow.awaitingMaterial && <p><span className="text-yellow-500 font-semibold mr-1">Aviso:</span>Aguardando material</p>}
        </div>
      )}
    </div>
  );
}
