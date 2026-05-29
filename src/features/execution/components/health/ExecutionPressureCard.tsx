import React from 'react';
import { cn } from '../../../../utils/ui';

interface ExecutionPressureCardProps {
  readonly slaMinutesRemaining: number;
  readonly isBlocked: boolean;
  readonly hasPendingMaterial: boolean;
}

/**
 * ExecutionPressureCard: Operational health and urgency indicator.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ExecutionPressureCard: React.FC<ExecutionPressureCardProps> = ({ slaMinutesRemaining, isBlocked, hasPendingMaterial }) => {
  const isCritical = slaMinutesRemaining < 30 || isBlocked;
  
  return (
    <div className={cn(
      "p-card rounded-[var(--radius-card)] border mb-lg shadow-[var(--shadow-soft)] transition-all",
      isCritical 
        ? 'bg-[var(--accent-red)]/5 border-[var(--accent-red)]/20' 
        : 'bg-[var(--bg-surface)] border var(--border-soft)'
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-ui-xs text-[var(--text-muted)] opacity-60">Status de Operação</h3>
        {isCritical && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-red)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-red)]" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-md">
        <div className="flex-1">
          <div className={cn(
            "text-h2 font-bold num tracking-tighter",
            slaMinutesRemaining < 0 ? 'text-[var(--accent-red)]' : 'text-[var(--text-primary)]'
          )}>
            {Math.abs(slaMinutesRemaining)}m
          </div>
          <div className="text-ui-xs text-[var(--text-muted)] opacity-40">
            {slaMinutesRemaining < 0 ? 'SLA EXCEDIDO' : 'TEMPO DISPONÍVEL'}
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          {isBlocked && (
            <div className="bg-[var(--accent-red)]/20 text-[var(--accent-red)] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Bloqueado
            </div>
          )}

          {hasPendingMaterial && (
            <div className="bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Material Pendente
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
