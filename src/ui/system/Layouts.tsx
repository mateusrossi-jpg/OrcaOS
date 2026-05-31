import React, { memo, type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { ChevronLeft } from 'lucide-react';
import { Heading, Eyebrow, Subtitle, Label } from './Typography';

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

interface ScreenContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

/**
 * ScreenContainer: Semantic wrapper for screen content.
 * Delegated master constraints and background to AppShell for global consistency.
 */
export const ScreenContainer = memo(function ScreenContainer({
  children,
  className = '',
  ...props
}: ScreenContainerProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col flex-1 w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

interface AppHeaderProps {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: ReactNode;
  onBack?: () => void;
  chips?: ReactNode;
  className?: string;
}

/**
 * AppHeader: Authoritative page header with DM Mono metadata.
 */
export const AppHeader = memo(function AppHeader({ 
  title, 
  eyebrow, 
  subtitle, 
  action, 
  onBack, 
  chips,
  className = ''
}: AppHeaderProps) {
  const today = new Date();
  const DAY = today.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase();
  const DATE_STR = today.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }).toUpperCase();

  return (
    <header className={cn("px-6 pt-12 pb-6 flex flex-col gap-6", className)}>
      {onBack && (
        <button 
          onClick={onBack} 
          className="flex items-center gap-1 text-[var(--text-muted)] hover:text-white transition-colors font-mono text-[9px] uppercase tracking-wider w-fit"
        >
          <ChevronLeft className="h-4 w-4 text-[var(--accent-gold)]" /> Voltar
        </button>
      )}

      <div className="flex justify-between items-center w-full min-h-[42px]">
        <div className="flex flex-col justify-center">
          {eyebrow ? (
            <Eyebrow>{eyebrow}</Eyebrow>
          ) : (
            <div className="flex items-center gap-2 mb-1.5">
              <Label className="!text-[9px] tracking-[0.22em]">{DAY}</Label>
              <span className="w-0.5 h-0.5 rounded-full bg-[#3C3C3C]" />
              <Label className="!text-[9px] tracking-[0.14em]">{DATE_STR}</Label>
            </div>
          )}
          <Heading>{title}</Heading>
          {subtitle && <Subtitle className="mt-2 max-w-[90%]">{subtitle}</Subtitle>}
        </div>
        {action && <div className="flex items-center">{action}</div>}
      </div>

      {chips && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5 mt-2">
           {chips}
        </div>
      )}
    </header>
  );
});

/**
 * Header: Standard sticky header for sub-pages.
 */
export const Header = memo(function Header({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 py-4 px-6 bg-[var(--bg-surface-glass)] backdrop-blur-xl border-b var(--border-subtle)", className)} {...props}>
      {children}
    </div>
  );
});

export const Content = memo(function Content({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-8 pb-40 custom-scrollbar", className)} {...props}>
      <div className="max-w-[440px] mx-auto">
        {children}
      </div>
    </div>
  );
});

/**
 * Stack: Vertical layout for related items.
 */
export const Stack = memo(function Stack({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      {children}
    </div>
  );
});

/**
 * Section: Vertical layout for independent blocks.
 */
export const Section = memo(function Section({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {children}
    </div>
  );
});

/**
 * Grid: 2-column grid for standard pairs.
 */
export const Grid = memo(function Grid({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)} {...props}>
      {children}
    </div>
  );
});

/**
 * ExecutiveGrid: High-density executive summary grid.
 * Optimized for scannability and technical authority.
 */
export const ExecutiveGrid = memo(function ExecutiveGrid({ children, className = '', ...props }: LayoutProps) {
  return (
    <div 
      className={cn(
        "grid grid-cols-2 gap-2.5", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
});

export const ExecutiveSummaryGrid = ExecutiveGrid;
