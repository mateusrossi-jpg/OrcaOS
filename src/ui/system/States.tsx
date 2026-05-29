import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * ERPLoader: Executive system loading state.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ERPLoader = memo(function ERPLoader({ message, className = '' }: { message?: string, className?: string }) {
  return (
    <div className={cn("w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-lg", className)}>
      <div className="relative h-12 w-12">
        <Loader2 className="h-12 w-12 text-[var(--accent-gold)] animate-spin" />
      </div>
      {message && <span className="text-ui-xs text-[var(--accent-gold)] opacity-60 animate-pulse">{message}</span>}
    </div>
  );
});

/**
 * ERPEmptyState: Discrete placeholder for empty contexts.
 */
export const ERPEmptyState = memo(function ERPEmptyState({ title, description, icon, action, className = '' }: { title: string, description?: string, icon?: ReactNode, action?: ReactNode, className?: string }) {
  return (
    <div className={cn("w-full py-20 px-shell flex flex-col items-center justify-center gap-md text-center", className)}>
      {icon && <div className="text-[var(--text-muted)] opacity-20 mb-2">{icon}</div>}
      <h3 className="text-ui-md text-[var(--text-primary)]">{title}</h3>
      {description && <p className="text-ui-sm text-[var(--text-muted)] max-w-xs leading-relaxed opacity-60">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
});

/**
 * ERPErrorState: High-polish error recovery surface.
 */
export const ERPErrorState = memo(function ERPErrorState({ title = 'Erro no Sistema', error, onRetry, className = '' }: { title?: string, error?: Error | string | null, onRetry?: () => void, className?: string }) {
  return (
    <div className={cn("w-full py-12 px-shell flex flex-col items-center justify-center gap-lg bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 rounded-[var(--radius-card)] text-center", className)}>
      <div className="h-12 w-12 rounded-full bg-[var(--accent-red)]/10 flex items-center justify-center text-[var(--accent-red)]">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-ui-md text-[var(--accent-red)] font-bold">{title}</h3>
        {error && <p className="text-ui-sm text-[var(--accent-red)] opacity-60 mt-2 max-w-md leading-relaxed">{typeof error === 'string' ? error : error.message}</p>}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="h-12 px-8 bg-[var(--accent-red)]/10 hover:bg-[var(--accent-red)]/20 text-[var(--accent-red)] text-ui-sm font-bold rounded-[var(--radius-button)] transition-all border border-[var(--accent-red)]/20 active:scale-[0.95]">
          TENTAR NOVAMENTE
        </button>
      )}
    </div>
  );
});
