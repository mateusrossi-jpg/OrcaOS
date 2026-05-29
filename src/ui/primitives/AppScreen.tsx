import React, { type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { ChevronLeft } from 'lucide-react';

interface AppScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  isCinematic?: boolean;
}

/**
 * AppScreen: The definitive context for Aferix operations.
 * Provides the cinematic atmosphere, vignette, and standardized margins.
 */
export const AppScreen = ({ children, className, isCinematic = false, ...props }: AppScreenProps) => (
  <div 
    className={cn(
      "relative min-h-full w-full flex flex-col p-shell overflow-x-hidden",
      isCinematic && "bg-vignette", // Uses system vignette token
      className
    )}
    {...props}
  >
    <div className="mx-auto w-full max-w-[440px] flex flex-col flex-1">
      {children}
    </div>
  </div>
);

interface AppHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: ReactNode;
  onBack?: () => void;
  className?: string;
}

/**
 * AppHeader: Executive authority at the top of the screen.
 */
export const AppHeader = ({ 
  title, 
  eyebrow, 
  subtitle, 
  action, 
  onBack,
  className 
}: AppHeaderProps) => (
  <header className={cn("mb-12 flex flex-col gap-lg animate-in fade-in slide-in-from-top-2 duration-500", className)}>
    {onBack && (
      <button 
        onClick={onBack}
        className="flex w-fit items-center gap-sm text-ui-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" /> VOLTAR
      </button>
    )}
    <div className="flex items-end justify-between gap-lg">
      <div className="flex flex-col items-start min-w-0">
        {eyebrow && <span className="mb-1 text-ui-xs text-[var(--accent-gold)] font-black tracking-[0.2em]">{eyebrow.toUpperCase()}</span>}
        <h1 className="text-h1 text-[var(--text-primary)] truncate w-full tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-ui-sm text-[var(--text-secondary)] leading-relaxed opacity-80 max-w-[90%]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 mb-1">{action}</div>}
    </div>
  </header>
);
