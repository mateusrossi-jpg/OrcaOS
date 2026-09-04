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
        "relative flex flex-col min-h-[100dvh] w-full page-fade-in",
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

  const safeTop = "pt-[calc(env(safe-area-inset-top)+12px)]"; 
  const headingClass = "text-[var(--fs-xl)] font-black leading-tight tracking-tight text-white";

  return (
    <header className={cn(`w-full ${safeTop} px-6 pb-2 flex flex-col gap-1 border-b border-white/[0.05] bg-[#050505]/45 backdrop-blur-md sticky top-0 z-40`, className)}>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[var(--text-muted)] hover:text-white transition-all font-mono text-[10px] uppercase tracking-[0.2em] w-fit mb-0.5 -ml-2 -mt-1 p-2 pr-4 rounded-xl active:bg-white/[0.04] active:scale-[0.98]"
        >
          <ChevronLeft className="h-4 w-4 text-[var(--accent-gold)]" /> Voltar
        </button>
      )}

      <div className="flex justify-between items-center w-full min-h-[38px]">
        <div className="flex flex-col justify-center">
          {eyebrow ? (
            <Eyebrow>{eyebrow}</Eyebrow>
          ) : (
            <div className="flex items-center gap-1.5 mb-1">
              <Label className="!text-[9px] tracking-[0.22em] text-[var(--accent-gold)] font-semibold">{DAY}</Label>
              <span className="w-0.5 h-0.5 rounded-full bg-[var(--text-tertiary)]" />
              <Label className="!text-[9px] tracking-[0.14em] text-[var(--text-muted)]">{DATE_STR}</Label>
            </div>
          )}
          <Heading className={headingClass}>{title}</Heading>
          {subtitle && <Subtitle className="mt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed max-w-[90%]">{subtitle}</Subtitle>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      {chips && (
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-0.5 mt-1">
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
  // Consistent sub‑page header: same height and safe‑area handling as AppHeader
  const headerHeight = "min-h-[56px]";
  const safeTop = "pt-[calc(env(safe-area-inset-top)+6px)]";
  return (
    <div className={cn(`${headerHeight} ${safeTop} flex items-center justify-between gap-4 py-2 px-5 bg-[var(--bg-surface-glass)] backdrop-blur-xl border-b var(--border-subtle)`, className)} {...props}>
      {children}
    </div>
  );
});

export const Content = memo(function Content({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={cn("flex flex-col px-6 py-8 pb-40", className)} {...props}>
      <div className="max-w-[440px] mx-auto w-full">
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
 * Standardized 24px (px-6) internal spacing and robust gap (V7 P2).
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
