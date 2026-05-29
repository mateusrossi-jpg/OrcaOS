import React, { memo, type ReactNode, type ElementType } from 'react';
import { cn } from '../../utils/ui';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

/**
 * Aferix OS Typography: Unified semantic hierarchy.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */

export const Title = memo(function Title({ children, as: Component = 'h2', className = '', ...props }: TypographyProps) {
  return <Component className={cn("text-[var(--fs-2xl)] font-bold leading-tight tracking-tight text-[var(--text-primary)]", className)} {...props}>{children}</Component>;
});

export const Subtitle = memo(function Subtitle({ children, as: Component = 'p', className = '', ...props }: TypographyProps) {
  return <Component className={cn("text-[var(--fs-base)] font-semibold text-[var(--text-primary)]", className)} {...props}>{children}</Component>;
});

export const Body = memo(function Body({ children, as: Component = 'p', className = '', ...props }: TypographyProps) {
  return <Component className={cn("text-[var(--fs-sm)] font-semibold text-[var(--text-primary)]", className)} {...props}>{children}</Component>;
});

export const Heading = memo(function Heading({ children, as: Component = 'h1', className = '', ...props }: TypographyProps) {
  return <Component className={cn("text-[var(--fs-3xl)] font-bold leading-none text-[var(--text-primary)] num", className)} {...props}>{children}</Component>;
});

export const Label = memo(function Label({ children, as: Component = 'span', className = '', ...props }: TypographyProps) {
  return <Component className={cn("text-[var(--fs-xs)] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]", className)} {...props}>{children}</Component>;
});

export const Small = memo(function Small({ children, as: Component = 'small', className = '', ...props }: TypographyProps) {
  return <Component className={cn("text-[var(--fs-sm)] text-[var(--text-muted)] font-medium", className)} {...props}>{children}</Component>;
});
