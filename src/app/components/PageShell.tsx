import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <main className={`relative min-h-screen w-full overflow-x-hidden ${className}`.trim()}>
      {/* Cinematic Background (Unified DNA) */}
      <div className="screen-atmosphere">
        <div className="atmosphere-vignette" />
      </div>

      {/* Content Container (Standard Executive Insets) */}
      <div className="relative z-10 p-6 md:p-8 pb-32">
        {children}
      </div>
    </main>
  );
}
