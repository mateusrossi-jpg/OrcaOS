import React from 'react';
import { QueueWorkflowInput } from '../../../core/workflow/queueEngine';
import { TechnicianCard } from './TechnicianCard';

interface TechnicianQueueProps {
  title: string;
  workflows: QueueWorkflowInput[];
  accentColor?: string;
  onCardClick?: (id: string) => void;
}

export function TechnicianQueue({ title, workflows, accentColor = 'bg-gray-700', onCardClick }: TechnicianQueueProps) {
  return (
    <div className="flex flex-col min-w-[300px] w-[300px] sm:min-w-[350px] sm:w-[350px] h-full bg-gray-950/50 rounded-xl border border-gray-800/60 overflow-hidden">
      <div className="p-3 border-b border-gray-800/60 bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${accentColor}`} />
          <h3 className="font-semibold text-gray-200 text-sm">{title}</h3>
        </div>
        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full font-medium">
          {workflows.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
        {workflows.map(wf => (
          <TechnicianCard 
            key={wf.id} 
            workflow={wf} 
            onClick={onCardClick}
          />
        ))}
        {workflows.length === 0 && (
          <div className="text-center p-4 text-gray-600 text-sm border border-dashed border-gray-800 rounded-lg m-2">
            Fila vazia
          </div>
        )}
      </div>
    </div>
  );
}
