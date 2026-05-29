import React, { memo, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '../../utils/ui';

interface SurfaceCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

/**
 * SurfaceCard: The fundamental physical unit of the Aferix OS.
 * Layered dark glass, atmospheric shadows, and 24px-32px radii.
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
        "rounded-[var(--radius-card)] bg-[var(--surface-gradient)] border var(--border-soft) shadow-[var(--shadow-soft)] transition-all duration-300",
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
        ? "bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold)]/80 text-black shadow-[var(--shadow-cinematic)] scale-[1.02]" 
        : "hover:brightness-110",
      onClick && "cursor-pointer active:scale-[0.98]",
      className
    )}
    padding="md"
  >
    <div className="flex flex-col gap-xs">
      <span className={cn(
        "text-ui-xs font-bold uppercase tracking-[0.15em]",
        featured ? "text-black/60" : "text-[var(--text-muted)]"
      )}>
        {label}
      </span>
      
      <div className={cn(
        "num font-bold tracking-tighter",
        featured ? "text-h1 mt-6" : "text-h2 mt-4"
      )} style={{ color: featured ? undefined : color }}>
        {value}
      </div>
    </div>
    
    {trend && (
      <div className={cn("mt-4 flex items-center gap-sm", featured ? "text-black/70" : "opacity-80")}>
        {trend}
      </div>
    )}
  </SurfaceCard>
));
