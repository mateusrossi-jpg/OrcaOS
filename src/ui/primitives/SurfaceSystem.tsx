import React, { memo, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '../../utils/ui';

export type PaddingSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface SurfaceCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padding?: PaddingSize;
  variant?: 'default' | 'elevated' | 'cinematic';
  as?: React.ElementType;
}

/**
 * SurfaceCard: The fundamental physical container of Golden V12.
 * Solid Graphite: Layered depth, subtle borders, and atmospheric elevation.
 */
export const SurfaceCard = memo(({ 
  children, 
  padding = 'md', 
  variant = 'default',
  className, 
  as: Component = 'section',
  ...props 
}: SurfaceCardProps) => {
  const paddingMap: Record<PaddingSize, string> = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const variantMap = {
    default: 'bg-[#363638] border border-white/5 rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
    elevated: 'bg-[#3A3A3C] border border-white/10 rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.16)]',
    cinematic: 'bg-[#3A3A3C] border border-white/10 rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.16)]',
  };

  return (
    <Component
      className={cn(
        "text-white transition-all duration-200 relative",
        variantMap[variant] || variantMap.default,
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  featured?: boolean;
  color?: string;
  trend?: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * MetricCard: Clean V12 financial/operational data metric card.
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
    variant={featured ? 'elevated' : 'default'}
    className={cn(
      "flex flex-col justify-between transition-all duration-200",
      featured 
        ? "bg-[#3A3A3C] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.16)]" 
        : "hover:border-white/10",
      onClick && "cursor-pointer active:scale-[0.98]",
      className
    )}
    padding="md"
  >
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
        {label}
      </span>
      
      <div 
        className="num font-bold tracking-tight text-white text-2xl mt-3"
        style={{ color: color || undefined }}
      >
        {value}
      </div>
    </div>
    
    {trend && (
      <div className="mt-4 flex items-center gap-2 text-[12px] text-[#8E8E93]">
        {trend}
      </div>
    )}
  </SurfaceCard>
));

export const Surface = SurfaceCard;
