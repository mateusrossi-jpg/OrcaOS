import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * ERPLoader: Executive system loading state.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const ERPLoader = memo(function ERPLoader({ message, className = '' }: { message?: string, className?: string }) {
  return (
    <div className={cn("w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-6", className)}>
      <div className="relative h-12 w-12">
        <Loader2 className="h-12 w-12 text-[var(--accent-gold)] animate-spin" />
      </div>
      {message && <span className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-[var(--accent-gold)] opacity-60 animate-pulse uppercase">{message}</span>}
    </div>
  );
});

/**
 * ERPEmptyState: Discrete placeholder for empty contexts.
 * Refactored for monumental technical authority (Phase 4H).
 */
export const ERPEmptyState = memo(function ERPEmptyState({ title, description, icon, action, className = '' }: { title: string, description?: string, icon?: ReactNode, action?: ReactNode, className?: string }) {
  return (
    <div className={cn("w-full py-32 px-10 flex flex-col items-center justify-center gap-6 text-center animate-in fade-in duration-700", className)}>
      {icon && <div className="text-[var(--text-muted)] opacity-10 mb-6 scale-150">{icon}</div>}
      <h3 className="font-mono text-[10px] font-black tracking-[0.4em] text-[var(--text-tertiary)] uppercase">{title}</h3>
      {description && <p className="text-[13px] font-medium text-[var(--text-secondary)] max-w-[260px] leading-relaxed opacity-40">{description}</p>}
      {action && <div className="mt-8 w-full max-w-[240px]">{action}</div>}
    </div>
  );
});

/**
 * ERPErrorState: High-polish error recovery surface.
 */
export const ERPErrorState = memo(function ERPErrorState({ title = 'Erro no Sistema', error, onRetry, className = '' }: { title?: string, error?: Error | string | null, onRetry?: () => void, className?: string }) {
  return (
    <div className={cn("w-full py-12 px-6 flex flex-col items-center justify-center gap-6 bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20 rounded-[var(--radius-card)] text-center", className)}>
      <div className="h-12 w-12 rounded-full bg-[var(--accent-red)]/10 flex items-center justify-center text-[var(--accent-red)]">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[var(--accent-red)]">{title}</h3>
        {error && <p className="text-sm font-medium text-[var(--accent-red)] opacity-60 mt-2 max-w-md leading-relaxed">{typeof error === 'string' ? error : error.message}</p>}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="h-12 px-8 bg-[var(--accent-red)]/10 hover:bg-[var(--accent-red)]/20 text-[var(--accent-red)] text-sm font-bold rounded-[var(--radius-button)] transition-all border border-[var(--accent-red)]/20 active:scale-[0.95]">
          TENTAR NOVAMENTE
        </button>
      )}
    </div>
  );
});

/**
 * ERPSkeleton: High-polish pulse placeholder for layout skeleton transitions.
 */
export const ERPSkeleton = memo(function ERPSkeleton({ 
  variant = 'card', 
  className = '' 
}: { 
  variant?: 'card' | 'title' | 'line' | 'circle' | 'list', 
  className?: string 
}) {
  if (variant === 'circle') {
    return <div className={cn("animate-pulse bg-white/[0.04] rounded-full shrink-0", className)} />;
  }
  if (variant === 'title') {
    return <div className={cn("animate-pulse bg-white/[0.04] h-6 rounded-lg w-1/3", className)} />;
  }
  if (variant === 'line') {
    return <div className={cn("animate-pulse bg-white/[0.04] h-4 rounded-md w-full", className)} />;
  }
  if (variant === 'list') {
    return (
      <div className={cn("flex flex-col gap-sm w-full", className)}>
        <ERPSkeleton variant="card" className="h-20" />
        <ERPSkeleton variant="card" className="h-20" />
        <ERPSkeleton variant="card" className="h-20" />
      </div>
    );
  }
  // Default card variant
  return (
    <div className={cn("animate-pulse bg-white/[0.03] border var(--border-soft) rounded-[var(--radius-card)] w-full relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
  );
});
