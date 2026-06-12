import React from 'react';
import { cn } from '../utils/ui';

interface AferixButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'p0' | 'p1' | 'p2' | 'danger';
  fullWidth?: boolean;
}

/**
 * AferixButton: INDUSTRIAL GRAPHITE PREMIUM standard.
 * P0: Primary (Gold)
 * P1: Secondary (Elevated Graphite)
 * P2: Ghost
 */
export const AferixButton: React.FC<AferixButtonProps> = ({ 
  variant = 'p1', 
  fullWidth = false, 
  className, 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-[14px] font-bold text-[14px] tracking-tight transition-all duration-200 active:scale-[0.96] min-h-[56px] px-8 py-4 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    p0: "bg-accent-primary text-black hover:bg-accent-hover shadow-md font-black",
    p1: "bg-surface-secondary border border-border-primary text-white hover:bg-surface-tertiary shadow-sm",
    p2: "bg-transparent text-info hover:bg-info/10",
    danger: "bg-danger text-white shadow-md hover:brightness-105"
  };

  return (
    <button 
      className={cn(
        baseStyles, 
        variants[variant], 
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
