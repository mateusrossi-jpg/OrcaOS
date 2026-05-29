import React, { type ReactNode } from 'react';
import { cn } from '../../utils/ui';
import { AppScreen } from '../primitives/AppScreen';

interface LayoutBaseProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * ExecutiveDashboardLayout: Cinematic, atmospheric, and spacious.
 * Used for Home and high-level summaries.
 */
export const ExecutiveDashboardLayout = ({ children, header, footer, className }: LayoutBaseProps) => (
  <AppScreen isCinematic className={cn("gap-4 pb-32", className)}>
    {header && <div className="animate-in fade-in duration-500">{header}</div>}
    <main className="flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-700">
      {children}
    </main>
    {footer && <div className="fixed bottom-10 left-6 right-6 z-50">{footer}</div>}
  </AppScreen>
);

/**
 * OperationalFlowLayout: Tighter rhythm, focused on scanning and task management.
 * Used for Pipelines and Board views.
 */
export const OperationalFlowLayout = ({ children, header, footer, className }: LayoutBaseProps) => (
  <AppScreen className={cn("gap-32 pb-40", className)}>
    {header && <div className="sticky top-0 z-20 bg-vignette-80 backdrop-blur-xl py-4 -mx-shell px-shell border-b">{header}</div>}
    <main className="flex flex-col gap-24">
      {children}
    </main>
    {footer && <div className="fixed bottom-0 left-0 right-0 z-30">{footer}</div>}
  </AppScreen>
);

/**
 * FinancialInsightLayout: Institutional calm, numerical precision, and ledger rhythm.
 * Used for Finance and Audits.
 */
export const FinancialInsightLayout = ({ children, header, footer, className }: LayoutBaseProps) => (
  <AppScreen className={cn("gap-24 pb-32", className)}>
    {header && <div className="mb-4">{header}</div>}
    <main className="flex flex-col gap-16 num-optimized">
      {children}
    </main>
    {footer && <div className="mt-auto pt-12">{footer}</div>}
  </AppScreen>
);

/**
 * TimelineLayout: Temporal ergonomics for schedules and event streams.
 */
export const TimelineLayout = ({ children, header, className }: LayoutBaseProps) => (
  <AppScreen className={cn("gap-32 pb-32", className)}>
    {header && <div className="mb-8">{header}</div>}
    <main className="relative border-l ml-4 pl-8 flex flex-col gap-40">
      {children}
    </main>
  </AppScreen>
);

/**
 * FormFlowLayout: Focused sectioning for multi-stage inputs.
 */
export const FormFlowLayout = ({ children, header, footer, className }: LayoutBaseProps) => (
  <AppScreen className={cn("gap-48 pb-48", className)}>
    {header && <div className="mb-2">{header}</div>}
    <main className="flex flex-col gap-32">
      {children}
    </main>
    {footer && <div className="fixed bottom-0 left-0 right-0 z-50">{footer}</div>}
  </AppScreen>
);

/**
 * SplitMetricLayout: Comparative dual-column metrics for BI.
 */
export const SplitMetricLayout = ({ children, className }: { children: ReactNode, className?: string }) => (
  <div className={cn("grid grid-cols-2 gap-16", className)}>
    {children}
  </div>
);

/**
 * DetailViewLayout: Vertical focus for single-entity auditing.
 */
export const DetailViewLayout = ({ children, header, className }: LayoutBaseProps) => (
  <AppScreen className={cn("gap-24", className)}>
    {header && <div className="mb-6">{header}</div>}
    <main className="flex flex-col gap-12">
      {children}
    </main>
  </AppScreen>
);

/**
 * CommandCenterLayout: Command-center density for field operations.
 */
export const CommandCenterLayout = ({ children, header, footer, className }: LayoutBaseProps) => (
  <AppScreen className={cn("gap-16 h-screen overflow-hidden", className)}>
    {header && <div className="shrink-0">{header}</div>}
    <main className="flex-1 overflow-y-auto flex flex-col gap-12 pb-40">
      {children}
    </main>
    {footer && <div className="shrink-0">{footer}</div>}
  </AppScreen>
);
