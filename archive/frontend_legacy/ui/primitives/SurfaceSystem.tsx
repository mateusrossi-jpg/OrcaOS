import React, { memo, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '../../utils/ui';

interface SurfaceCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

/**
 * SurfaceCard: The fundamental physical unit of the Aferix OS.
 * Solid Graphite Glass: Layered depth, subtle borders, and atmospheric shadows.
 */
export const SurfaceCard = memo(({ 
  children, 
  padding = 'md', 
  className, 
  as: Component = 'section',
  ...props 
}: SurfaceCardProps) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-card',
    lg: 'p-8 md:p-12',
  };

  return (
    <Component
      className={cn(
        "rounded-[var(--radius-card)] bg-[var(--surface-gradient)] border var(--border-soft) shadow-[var(--shadow-soft)] transition-all duration-300 relative overflow-hidden",
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent before:pointer-events-none", // Glass shine
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

interface MetricCardProps {
  label: string;
  value: ReactNode;
  featured?: boolean;
  color?: string;
  trend?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * MetricCard: Cinematic financial data projection.
 */
export const MetricCard = memo(({
  label,
  value,
  featured = false,
  color,
  trend,
  className,
  onClick
}: MetricCardProps) => (
  <SurfaceCard 
    onClick={onClick}
    className={cn(
      "flex flex-col justify-between transition-all duration-500",
      featured 
        ? "bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold)]/80 text-black shadow-[var(--shadow-cinematic)] scale-[1.02] border-none before:hidden" 
        : "hover:brightness-110",
      onClick && "cursor-pointer active:scale-[0.98]",
      className
    )}
    padding="md"
  >
    <div className="flex flex-col gap-xs">
      <span className={cn(
        "text-ui-xs font-bold uppercase tracking-[0.2em]",
        featured ? "text-black/50" : "text-[var(--text-muted)] opacity-60"
      )}>
        {label}
      </span>
      
      <div className={cn(
        "num font-bold tracking-tighter leading-none",
        featured ? "text-h1 mt-6" : "text-h2 mt-4 text-[var(--text-primary)]"
      )} style={{ color: featured ? undefined : color }}>
        {value}
      </div>
    </div>
    
    {trend && (
      <div className={cn("mt-6 flex items-center gap-sm", featured ? "text-black/40" : "opacity-40")}>
        {trend}
      </div>
    )}
  </SurfaceCard>
));
