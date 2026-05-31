import { memo } from 'react';
import { MoneyValue } from './index';
import { cn } from '../../../utils/ui';
import { ChevronRight } from 'lucide-react';

interface PipelineCardProps {
  title: string;
  clientName: string;
  status: string;
  value: number;
  margin?: number;
  onClick?: () => void;
  className?: string;
}

/**
 * PipelineCard: Premium Operational Card for budget lists.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const PipelineCard = memo(function PipelineCard({
  title,
  clientName,
  status,
  value,
  margin,
  onClick,
  className
}: PipelineCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group flex items-center p-card rounded-[var(--radius-card)] cursor-pointer transition-all duration-300 active:scale-[0.98]",
        "bg-[var(--surface-gradient)] border var(--border-soft) shadow-[var(--shadow-soft)] hover:bg-white/[0.08]",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-ui-xs text-[var(--text-muted)] opacity-60">{status.toUpperCase()}</span>
          <div className="num text-ui-md font-bold text-[var(--accent-gold)] tracking-tight">
            <MoneyValue value={value} compact />
          </div>
        </div>

        <h4 className="text-ui-md font-bold text-[var(--text-primary)] truncate mb-1 group-hover:text-[var(--accent-gold)] transition-colors">
          {title || 'Sem título'}
        </h4>
        <p className="text-ui-sm text-[var(--text-secondary)] truncate uppercase tracking-widest opacity-60">
          {clientName || 'Cliente Avulso'}
        </p>
        
        {margin !== undefined && (
          <div className="mt-4 flex items-center gap-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-40">MARGEM</span>
            <span className={cn(
              "num text-[9px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-widest bg-white/[0.04] text-white/40 border border-white/5",
              margin > 30 ? "bg-[var(--accent-green)]/15 text-[var(--accent-green)]" : "bg-white/5 text-[var(--text-muted)]"
            )}>
              {margin.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="ml-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
        <ChevronRight className="h-5 w-5 text-white" />
      </div>
    </div>
  );
});
