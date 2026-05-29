import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ExecutionHeaderProps {
  readonly clientName: string;
  readonly workOrderId: string;
  readonly status: string;
  readonly onBack: () => void;
}

/**
 * ExecutionHeader: Field-first operational header.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ExecutionHeader: React.FC<ExecutionHeaderProps> = ({ clientName, workOrderId, status, onBack }) => {
  return (
    <div className="sticky top-0 z-sticky bg-[var(--bg-surface-glass)] backdrop-blur-xl border-b var(--border-subtle) px-shell py-4 flex items-center justify-between">
      <div className="flex items-center gap-md">
        <button onClick={onBack} className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" aria-label="Voltar">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-h3 text-[var(--text-primary)] leading-tight truncate max-w-[200px]">
            {clientName}
          </h1>
          <div className="text-ui-xs text-[var(--text-muted)] flex items-center gap-sm mt-0.5">
            <span className="opacity-60">#{workOrderId.split('-')[0].toUpperCase()}</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[var(--accent-gold)] font-bold">{status.toUpperCase()}</span>
          </div>
        </div>
      </div>
      
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border var(--border-subtle) flex items-center justify-center transition-all active:scale-[0.95]">
        <span className="text-xl filter drop-shadow-glow">📍</span>
      </div>
    </div>
  );
};
