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

/**
 * SectionLabel: High-fidelity DM Mono label for section identifying.
 */
export const SectionLabel = memo(function SectionLabel({ children, className = '', ...props }: TypographyProps) {
  return (
    <p
      className={cn(
        "font-mono text-[9.5px] font-bold tracking-[0.18em] text-[var(--text-secondary)] uppercase select-none m-0",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

/**
 * Heading: Page-level authoritative title.
 */
export const Heading = memo(function Heading({ children, as: Component = 'h1', className = '', ...props }: TypographyProps) {
  return (
    <Component 
      className={cn(
        "text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)]", 
        className
      )} 
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * Title: Section-level title.
 */
export const Title = memo(function Title({ children, as: Component = 'h2', className = '', ...props }: TypographyProps) {
  return (
    <Component 
      className={cn(
        "text-[24px] font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)]", 
        className
      )} 
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * Subtitle: Descriptive text for headings/titles.
 */
export const Subtitle = memo(function Subtitle({ children, as: Component = 'p', className = '', ...props }: TypographyProps) {
  return (
    <Component 
      className={cn(
        "text-[14px] font-medium leading-relaxed text-[var(--text-secondary)]", 
        className
      )} 
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * Eyebrow: Gold label above titles for category/context.
 */
export const Eyebrow = memo(function Eyebrow({ children, className = '', ...props }: TypographyProps) {
  return (
    <span 
      className={cn(
        "font-mono text-[11px] font-bold tracking-[0.15em] text-[var(--accent-gold)] uppercase block mb-2", 
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
});

/**
 * Label: Monospaced metadata label.
 */
export const Label = memo(function Label({ children, as: Component = 'span', className = '', ...props }: TypographyProps) {
  return (
    <Component 
      className={cn(
        "font-mono text-[9.5px] font-bold tracking-[0.18em] text-[var(--text-secondary)] uppercase select-none", 
        className
      )} 
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * Body: Standard UI text.
 */
export const Body = memo(function Body({ children, as: Component = 'p', className = '', ...props }: TypographyProps) {
  return (
    <Component 
      className={cn(
        "text-[15px] font-medium text-[var(--text-primary)] leading-normal", 
        className
      )} 
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * Value: High-authority numeric display.
 */
export const Value = memo(function Value({ children, className = '', ...props }: TypographyProps) {
  return (
    <span 
      className={cn(
        "num font-bold tracking-tight text-[var(--text-primary)]", 
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
});
