import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <main className={`aferix-page-shell ${className}`.trim()}>
      {children}
    </main>
  );
}
