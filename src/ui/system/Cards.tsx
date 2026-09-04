import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { ChevronRight } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'cinematic';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

/**
 * Card: Canonical Golden V12 Dark Industrial Graphite Card.
 * Default: #363638 with border-white/5, rounded-[20px]
 * Elevated / Cinematic: #3A3A3C with border-white/10, rounded-[24px]
 */
export const Card = memo(function Card({ 
  children, 
  variant = 'default',
  padding = 'md', 
  className = '',
  onClick,
  ...props 
}: CardProps) {
  const isClickable = !!onClick;

  const paddings = {
    none: "p-0",
    sm: "p-4",      // 16px
    md: "p-6",      // 24px (Standard Protocol)
    lg: "p-8",      // 32px
    xl: "p-12",     // 48px
  };

  const variants = {
    default: "bg-[#363638] border border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.12)] rounded-[20px]",
    elevated: "bg-[#3A3A3C] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.16)] rounded-[24px]",
    glass: "bg-[#363638]/90 backdrop-blur-xl border border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.12)] rounded-[20px]",
    cinematic: "bg-[#3A3A3C] border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.24)] rounded-[24px]",
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative text-white transition-all duration-200",
        variants[variant],
        paddings[padding],
        isClickable && "cursor-pointer active:scale-[0.98] hover:border-white/15",
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex flex-col w-full h-full">
        {children}
      </div>
    </div>
  );
});

export const CardHeader = memo(function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5 border-b border-white/5 flex items-center justify-between gap-3", className)} {...props}>
      {children}
    </div>
  );
});

export const CardFooter = memo(function CardFooter({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
});

export const CardLabel = memo(function CardLabel({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span className={cn("text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase select-none", className)}>
      {label}
    </span>
  );
});

/**
 * ValueCard: Single-purpose card for executive metrics.
 */
export const ValueCard = memo(function ValueCard({ label, value, icon, trend, className = '' }: { label: string, value: ReactNode, icon?: ReactNode, trend?: ReactNode, className?: string }) {
  return (
    <Card variant="default" padding="md" className={cn("gap-2", className)}>
      <div className="flex items-center justify-between">
        <CardLabel label={label} />
        {icon && <div className="text-[#8E8E93]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold tracking-tight text-white num">{value}</span>
        {trend && <div className="text-[11px] font-medium">{trend}</div>}
      </div>
    </Card>
  );
});

/**
 * ValueBlock: Specialized small card for dashboard-like grids.
 */
export const ValueBlock = memo(function ValueBlock({ 
  label, 
  value, 
  icon, 
  variant = 'default',
  compact = false
}: { 
  label: string, 
  value: ReactNode, 
  icon?: ReactNode, 
  variant?: 'default' | 'danger' | 'success' | 'warning',
  compact?: boolean
}) {
  const variantStyles = {
    default: "border-white/5 text-white",
    danger:  "border-[#FF453A]/30 text-[#FF453A]",
    success: "border-[#30D158]/30 text-[#30D158]",
    warning: "border-[#FFD60A]/30 text-[#FFD60A]",
  };

  return (
    <div className={cn(
      "flex flex-col gap-0.5 p-4 rounded-[16px] bg-[#363638] border transition-all active:scale-95", 
      variantStyles[variant]
    )}>
      {/* 1. Value dominates */}
      <div className="text-2xl font-black tracking-tight num text-white flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {value}
      </div>
      
      {/* 2. Label is secondary */}
      <div className="text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] mt-1">
        {label}
      </div>
    </div>
  );
});

/**
 * InteractiveRow: Highly scannable list item with left/right slots.
 */
export const InteractiveRow = memo(function InteractiveRow({ 
  children, 
  onClick, 
  className = '', 
  hasChevron = false,
  leftSlot,
  rightSlot
}: { 
  children: ReactNode, 
  onClick?: () => void, 
  className?: string, 
  hasChevron?: boolean,
  leftSlot?: ReactNode,
  rightSlot?: ReactNode
}) {
  const isClickable = !!onClick;
  return (
    <div 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-4 w-full px-5 py-4 border-t border-white/5 first:border-t-0 transition-colors select-none", 
        isClickable ? "cursor-pointer active:bg-white/[0.06] hover:bg-white/[0.03]" : "cursor-default", 
        className
      )}
    >
      {leftSlot && <div className="shrink-0 flex items-center">{leftSlot}</div>}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
      {(rightSlot || (isClickable && hasChevron)) && (
        <div className="shrink-0 flex items-center ml-auto">
          {rightSlot || <ChevronRight size={15} className="text-[#8E8E93]" />}
        </div>
      )}
    </div>
  );
});

export const SurfaceCard = Card;

