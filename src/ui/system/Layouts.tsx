import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * Aferix OS Layouts: Structural primitives.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */

export const Header = memo(function Header({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-4 px-shell bg-[var(--bg-surface-glass)] backdrop-blur-xl border-b var(--border-subtle)", className)} {...props}>
      {children}
    </div>
  );
});

export const Content = memo(function Content({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-shell py-8 pb-40 custom-scrollbar", className)} {...props}>
      <div className="max-w-[440px] mx-auto">
        {children}
      </div>
    </div>
  );
});

export const Stack = memo(function Stack({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("flex flex-col gap-sm", className)} {...props}>
      {children}
    </div>
  );
});

export const Grid = memo(function Grid({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-md", className)} {...props}>
      {children}
    </div>
  );
});
