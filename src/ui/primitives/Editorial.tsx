import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';

/**
 * FinancialValue:Authority-driven authority-driven financial display.
 */
export const FinancialValue = memo(({ value, compact = false, className }: { value: number; compact?: boolean; className?: string }) => {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);

  return <span className={cn("num font-bold", className)}>{formatted}</span>;
});

/**
 * SectionTitle: Editorial divider for logical grouping.
 */
export const SectionTitle = memo(({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) => (
  <div className={cn("mb-6 mt-12 flex items-center justify-between animate-in fade-in duration-700", className)}>
    <h2 className="text-ui-xs text-[var(--text-muted)] font-black tracking-[0.2em]">{String(children).toUpperCase()}</h2>
    {action && <div className="shrink-0">{action}</div>}
  </div>
));
