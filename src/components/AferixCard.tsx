import React from 'react';
import { cn } from '../utils/ui';

interface AferixCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'a' | 'b' | 'c';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * AferixCard: INDUSTRIAL GRAPHITE PREMIUM standard.
 * Type A: Highlight (Mission context)
 * Type B: Standard Card (Layer 2)
 * Type C: Elevated Surface (Layer 3)
 */
export const AferixCard: React.FC<AferixCardProps> = ({ 
  variant = 'b', 
  padding = 'md',
  className, 
  children, 
  ...props 
}) => {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const variants = {
    a: "bg-surface-secondary border-border-primary shadow-lg",
    b: "bg-surface-primary border-border-primary shadow-md",
    c: "bg-background-secondary border-border-secondary shadow-sm"
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-[14px] border transition-all duration-300",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {/* Industrial subtle hairline highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.03] pointer-events-none" />
      
      {children}
    </div>
  );
};
