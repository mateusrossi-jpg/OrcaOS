import React from 'react';

export interface TimelineEvent {
  readonly id: string;
  readonly type: 'ARRIVAL' | 'START' | 'PAUSE' | 'MATERIAL' | 'PHOTO' | 'FINISH' | 'BLOCK';
  readonly timestamp: string;
  readonly description: string;
}

interface ExecutionTimelineProps {
  readonly events: readonly TimelineEvent[];
}

/**
 * ExecutionTimeline
 * Append-only visualization of operational events in the field.
 * Consumer-only, virtualized-ready, projection-driven.
 */
export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return <div className="text-sm text-text-muted text-center py-6">Nenhuma atividade registrada ainda.</div>;
  }

  return (
    <div className="relative pl-4 border-l-2 border-surface-700 space-y-4 my-6">
      {events.map((evt) => (
        <div key={evt.id} className="relative">
          <div className={`absolute -left-[21px] w-3 h-3 rounded-full mt-1 ${
            evt.type === 'BLOCK' ? 'bg-red-500' :
            evt.type === 'START' || evt.type === 'ARRIVAL' ? 'bg-green-500' :
            evt.type === 'PAUSE' ? 'bg-orange-500' : 'bg-surface-500'
          }`} />
          <div className="bg-surface-800/50 rounded-lg p-3 border border-surface-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-text-secondary">{evt.type}</span>
              <span className="text-xs font-mono text-text-muted">{new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <p className="text-sm text-text-primary">{evt.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
