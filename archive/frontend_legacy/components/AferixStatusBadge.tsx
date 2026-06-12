import React from 'react';
import { cn } from '../utils/ui';

interface AferixStatusBadgeProps {
  label: string;
  tone?: 'brand' | 'success' | 'danger' | 'info' | 'neutral';
  className?: string;
  icon?: React.ReactNode;
}

/**
 * AferixStatusBadge: Standardized status indicators.
 */
export const AferixStatusBadge: React.FC<AferixStatusBadgeProps> = ({ 
  label, 
  tone = 'neutral', 
  className,
  icon
}) => {
  const tones = {
    brand: "text-[var(--accent-gold)] bg-[var(--accent-gold)]/15 border-transparent",
    success: "text-[var(--accent-green)] bg-[var(--accent-green)]/15 border-transparent",
    danger: "text-[var(--accent-red)] bg-[var(--accent-red)]/15 border-transparent",
    info: "text-[var(--accent-blue)] bg-[var(--accent-blue)]/15 border-transparent",
    neutral: "text-white/50 bg-white/10 border-transparent"
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.2 px-2.5 py-0.8 rounded-[6px] text-[10px] font-bold uppercase tracking-tight",
      tones[tone],
      className
    )}>
      {icon}
      {label}
    </div>
  );
};
