import { ReactNode } from 'react';
import { cn } from '../../utils/ui';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageShell: The global material container.
 * Enforces the cinematic atmosphere and vignette for all screens.
 */
export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <main className={cn("relative min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden", className)}>
      {/* 1. ATMOSPHERIC VIGNETTE (THE SOUP) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[var(--surface-vignette)]" />

      {/* 2. CONTENT CONTAINER (Standard Executive Insets) */}
      <div className="relative z-10 mx-auto w-full max-w-[440px] flex flex-col p-shell pb-6">
        {children}
      </div>
    </main>
  );
}
