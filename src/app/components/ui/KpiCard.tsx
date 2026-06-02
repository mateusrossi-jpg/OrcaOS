import { memo, type ReactNode } from 'react';
import { Sparkline } from './Sparkline';
import { cn } from '../../../utils/ui';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  color?: string;
  trend?: number[];
  className?: string;
  onClick?: () => void;
}

/**
 * KpiCard: High-density KPI card with sparkline support.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const KpiCard = memo(function KpiCard({ 
  label, 
  value, 
  color = "var(--accent-gold)", 
  trend, 
  className,
  onClick
}: KpiCardProps) {
  const isTouchActive = onClick ? "active:scale-[0.98] active:brightness-110 transition-all duration-300" : "";
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-6 relative overflow-hidden bg-[var(--surface-gradient-soft)] border var(--border-soft) rounded-[8px] shadow-[var(--shadow-soft)] flex flex-col justify-between transition-all duration-300", 
        isTouchActive,
        className
      )}
    >
      <div className="relative z-10">
        <p className="text-[var(--fs-xs)] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] opacity-60 mb-2">
          {label}
        </p>
        
        <p className="num text-[var(--fs-xl)] font-bold leading-tight text-[var(--text-primary)]" style={{ color }}>
          {value}
        </p>
      </div>
      
      {trend && trend.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-10 opacity-5 pointer-events-none">
          <Sparkline 
            data={trend} 
            stroke={color} 
            fill="transparent" 
            height={40} 
          />
        </div>
      )}
    </div>
  );
});
