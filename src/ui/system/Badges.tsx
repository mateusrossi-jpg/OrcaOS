import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: 'healthy' | 'warning' | 'critical' | 'info' | 'muted';
  className?: string;
}

/**
 * Aferix V5 Badge: High-polish semantic indicator.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const Badge = memo(function Badge({ 
  children, 
  tone = 'info', 
  className = '',
  ...props 
}: BadgeProps) {
  const tones = {
    healthy:  "bg-[var(--accent-green)]/15 text-[var(--accent-green)] border-[var(--accent-green)]/20",
    warning:  "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border-[var(--accent-gold)]/20",
    critical: "bg-[var(--accent-red)]/15 text-[var(--accent-red)] border-[var(--accent-red)]/20",
    info:     "bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] border-[var(--accent-blue)]/20",
    muted:    "bg-white/5 text-[var(--text-muted)] border-white/5",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-[var(--fs-xs)] font-bold uppercase tracking-wider border",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

export const StatusDot = memo(function StatusDot({ tone = 'healthy', className = '' }: { tone?: 'healthy' | 'warning' | 'critical' | 'info', className?: string }) {
  const tones = {
    healthy:  "bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]",
    warning:  "bg-[var(--accent-gold)] shadow-[0_0_8px_var(--accent-gold)]",
    critical: "bg-[var(--accent-red)] shadow-[0_0_8px_var(--accent-red)]",
    info:     "bg-[var(--accent-blue)] shadow-[0_0_8px_var(--accent-blue)]",
  };

  return (
    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", tones[tone], className)} />
  );
});
