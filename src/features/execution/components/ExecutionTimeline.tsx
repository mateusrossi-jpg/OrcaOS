import React from 'react';
import { cn } from '../../../utils/ui';

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
 * ExecutionTimeline: Append-only ledger of field activities.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-ui-sm text-[var(--text-muted)] text-center py-12 opacity-40">
        Nenhuma atividade registrada ainda.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l var(--border-subtle) space-y-6 my-8 ml-2">
      {events.map((evt) => (
        <div key={evt.id} className="relative animate-in slide-in-from-left-2 duration-300">
          <div className={cn(
            "absolute -left-[31px] w-2.5 h-2.5 rounded-full mt-1.5 border-2 border-[var(--bg-primary)] z-10",
            evt.type === 'BLOCK' ? 'bg-[var(--accent-red)] shadow-[0_0_8px_var(--accent-red)]' :
            evt.type === 'START' || evt.type === 'ARRIVAL' ? 'bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]' :
            evt.type === 'PAUSE' ? 'bg-[var(--accent-gold)] shadow-[0_0_8px_var(--accent-gold)]' : 'bg-[var(--text-muted)]'
          )} />
          
          <div className="bg-[var(--bg-surface-glass)] rounded-[var(--radius-card)] p-shell border var(--border-subtle) shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between mb-2">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                evt.type === 'BLOCK' ? 'text-[var(--accent-red)]' :
                evt.type === 'START' || evt.type === 'ARRIVAL' ? 'text-[var(--accent-green)]' :
                evt.type === 'PAUSE' ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'
              )}>
                {evt.type}
              </span>
              <span className="num text-ui-xs text-[var(--text-muted)] opacity-40">
                {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <p className="text-ui-sm text-[var(--text-primary)] leading-relaxed">{evt.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
