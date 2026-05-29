import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Aferix OS V5 Card: Primary architectural surface.
 * Refactored for TOKEN-FIRST architecture.
 */
export const Card = memo(function Card({ 
  children, 
  padding = 'md', 
  className = '',
  ...props 
}: CardProps) {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-12",
  };

  return (
    <div 
      className={cn(
        "rounded-[var(--radius-card)] bg-[var(--surface-gradient)] border var(--border-soft) shadow-[var(--shadow-soft)] transition-all duration-300",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardHeader = memo(function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5 border-b var(--border-subtle) flex items-center justify-between gap-md", className)} {...props}>
      {children}
    </div>
  );
});

export const CardFooter = memo(function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 bg-white/5 border-t var(--border-subtle) flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
});

export const CardLabel = memo(function CardLabel({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span className={cn("text-[var(--fs-xs)] uppercase font-bold tracking-[0.15em] text-[var(--text-muted)]", className)}>{label}</span>
  );
});
