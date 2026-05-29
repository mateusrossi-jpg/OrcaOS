import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';

interface SegmentedTabsProps<T extends string> {
  items: Array<{ id: T; label: string }>;
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

/**
 * SegmentedTabs: iOS-style high-polish switch.
 */
export function SegmentedTabs<T extends string>({
  items,
  activeId,
  onChange,
  className
}: SegmentedTabsProps<T>) {
  return (
    <div className={cn("flex gap-1 p-1 bg-white/[0.04] rounded-xl border var(--border-subtle) w-fit", className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeId === item.id}
          className={cn(
            "px-6 py-2 rounded-lg text-ui-xs font-black transition-all duration-300 tracking-wider",
            activeId === item.id 
              ? "bg-[var(--accent-gold)] text-black shadow-soft scale-[1.03] z-10" 
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]"
          )}
          onClick={() => onChange(item.id)}
        >
          {item.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/**
 * StatusPill: Authority-driven semantic badge.
 */
export const StatusPill = memo(({ 
  status, 
  className 
}: { 
  status: string; 
  className?: string;
}) => {
  const s = (status ?? '').toLowerCase().replace(' ', '_');
  
  const map: Record<string, string> = {
    iniciado:   "bg-white/10 text-[var(--text-secondary)]",
    enviado:    "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]",
    aprovado:   "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border var(--border-subtle)",
    autorizado: "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border var(--border-subtle)",
    execucao:   "bg-[var(--accent-gold)] text-black shadow-glow",
    finalizado: "bg-[var(--accent-green)]/15 text-[var(--accent-green)]",
    arquivado:  "bg-white/5 text-[var(--text-muted)] opacity-50",
    cancelado:  "bg-[var(--accent-red)]/15 text-[var(--accent-red)]",
    recusado:   "bg-[var(--accent-red)]/15 text-[var(--accent-red)]",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] rounded-md transition-all", 
      map[s] || map.iniciado, 
      className
    )}>
      {status}
    </span>
  );
});

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
