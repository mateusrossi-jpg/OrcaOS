import React, { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '../../../utils/ui';

export type PaddingSize = 'none' | 'sm' | 'md' | 'lg';

interface SurfaceCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padding?: PaddingSize;
}

/**
 * SurfaceCard: Primary architectural surface primitive.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-card', // Using standardized card padding utility
    lg: 'p-8 md:p-12',
  };

  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] bg-[var(--surface-gradient)] border var(--border-soft) shadow-[var(--shadow-soft)] transition-all duration-300",
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
};

export default SurfaceCard;
