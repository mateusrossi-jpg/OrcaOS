import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { ChevronRight } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'cinematic';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

/**
 * Aferix OS V5 Card: Primary architectural surface.
 * Aligned with AFERIX VISUAL PROTOCOL (Phase 4).
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
    xl: "p-12",     // 48px (Section standard)
  };

  const variants = {
    default: "bg-gradient-to-b from-[#0c0f16]/95 to-[#05070a]/98 border border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_4px_24px_rgba(0,0,0,0.5)]",
    elevated: "bg-gradient-to-b from-[#141924]/98 to-[#0a0d14]/99 border border-white/[0.12] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_12px_40px_rgba(0,0,0,0.7)]",
    glass: "bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]",
    cinematic: "bg-gradient-to-b from-[#0e131d]/98 to-[#06080e]/99 border border-white/[0.08] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_16px_56px_rgba(0,0,0,0.85)]",
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border transition-all duration-300",
        variants[variant],
        paddings[padding],
        isClickable && "cursor-pointer active:scale-[0.98] active:bg-white/[0.04] hover:bg-white/[0.02]",
        className
      )}
      {...props}
    >
      {variant === 'cinematic' && (
        <>
          <div
            className="absolute -top-[100px] -right-[100px] w-[320px] h-[320px] rounded-full pointer-events-none select-none opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(212,169,78,0.08) 0%, transparent 62%)' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-[80px] pointer-events-none select-none"
            style={{ background: 'linear-gradient(to top, rgba(212,169,78,0.02), transparent)' }}
          />
        </>
      )}
      {/* Glossy top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none z-10" />
      {/* Solid glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col w-full h-full">
        {children}
      </div>
    </div>
  );
});

export const CardHeader = memo(function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5 border-b border-white/[0.07] flex items-center justify-between gap-3", className)} {...props}>
      {children}
    </div>
  );
});

export const CardFooter = memo(function CardFooter({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 bg-white/[0.02] border-t border-white/[0.07] flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
});

export const CardLabel = memo(function CardLabel({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span className={cn("font-mono text-[9.5px] font-bold tracking-[0.18em] text-[var(--text-tertiary)] uppercase select-none", className)}>
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
        {icon && <div className="text-[var(--text-muted)]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] num">{value}</span>
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
  variant = 'default' 
}: { 
  label: string, 
  value: ReactNode, 
  icon?: ReactNode, 
  variant?: 'default' | 'danger' | 'success' | 'warning' 
}) {
  const variantStyles = {
    default: "border-white/5",
    danger:  "border-[var(--accent-red)]/30",
    success: "border-[var(--accent-green)]/30",
    warning: "border-[var(--accent-gold)]/30",
  };

  const textStyles = {
    default: "text-white",
    danger:  "text-[var(--accent-red)]",
    success: "text-[var(--accent-green)]",
    warning: "text-[var(--accent-gold)]",
  };

  // Rule 5: Zero states must look valid. If value is exactly 0 or "0" or "0%", we should handle it gracefully, but fundamentally we rely on the styling.
  
  return (
    <div className={cn(
      "flex flex-col gap-0.5 p-4 rounded-2xl bg-[#111111] border transition-all active:scale-95", 
      variantStyles[variant]
    )}>
      {/* 1. Value dominates (Top position, huge font) */}
      <div className="text-2xl font-black tracking-tight num text-white flex items-center gap-2">
        {icon && <span className={textStyles[variant]}>{icon}</span>}
        {value}
      </div>
      
      {/* 2. Label is secondary (Bottom position, clear contrast AA minimum) */}
      <div className={cn(
        "text-[10px] uppercase font-bold tracking-widest opacity-70 mt-1",
        textStyles[variant] === 'text-white' ? 'text-white/70' : textStyles[variant]
      )}>
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
        "flex items-center gap-5 w-full px-6 py-[20px] border-t border-white/[0.05] first:border-t-0 transition-colors select-none", 
        isClickable ? "cursor-pointer active:bg-white/[0.06] hover:bg-white/[0.04]" : "cursor-default", 
        className
      )}
    >
      {leftSlot && <div className="shrink-0 flex items-center">{leftSlot}</div>}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
      {(rightSlot || (isClickable && hasChevron)) && (
        <div className="shrink-0 flex items-center ml-auto">
          {rightSlot || <ChevronRight size={13} className="text-[var(--text-tertiary)]" />}
        </div>
      )}
    </div>
  );
});

export const SurfaceCard = Card;
