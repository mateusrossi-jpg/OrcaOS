import React, { memo, type ReactNode, type HTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/ui';
import { TrendingUp, AlertCircle, Check, ChevronRight, Inbox, CloudUpload, WifiOff, Calendar, Clock, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { MoneyValue } from '../../app/components/ui';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: React.ElementType;
  interactive?: boolean;
}

/**
 * MISSION INSTRUMENT (V15 - Premium Protagonist)
 */
export const MissionInstrument = memo(({ 
  title, 
  description, 
  actionLabel, 
  buttonLabel,
  tone, 
  onClick 
}: { 
  title: string; 
  description: string; 
  actionLabel: string; 
  buttonLabel?: string;
  tone: 'gold' | 'red' | 'blue' | 'neutral';
  onClick?: () => void;
}) => (
  <section 
    className={cn(
      "surface-primary active-press flex flex-col gap-8",
      tone === 'red' && "tone-red"
    )}
    onClick={onClick}
  >
    <div className="flex flex-col gap-1-5 z-10">
      <span className="text-label">{actionLabel}</span>
      <h2 className="text-title">{title}</h2>
    </div>
    
    <button className="instrument-btn">
      {buttonLabel || (tone === 'red' ? 'Resolver Pendência' : 'Criar Proposta')}
    </button>
  </section>
));

/**
 * RESULT INSTRUMENT (V15 - Apple Wallet Style)
 */
export const ResultInstrument = memo(({ 
  profit, 
  monthlyGoalProgress, 
  interpretation, 
}: { 
  profit: number; 
  monthlyGoalProgress: number; 
  interpretation: string; 
}) => {
  return (
    <div className="surface-primary flex flex-col">
      <span className="text-label mb-5">RESULTADO DO MÊS</span>
      <p className="text-hero-value">
        <MoneyValue value={profit} />
      </p>
      <div className="flex flex-col mt-3">
        <p className="text-subtitle">Meta: {monthlyGoalProgress}%</p>
        {interpretation && <p className="text-label mt-1">{interpretation}</p>}
      </div>
    </div>
  );
});

/**
 * INSIGHTS INSTRUMENT (V15 - Sleek iOS Style List)
 */
export const InsightsInstrument = memo(({ insights }: { insights: { label: string; valueText: string; ctaLabel?: string; isEmpty?: boolean; onClick?: () => void }[] }) => (
  <div className="surface-inline flex flex-col my-2">
    {insights.map((item, idx) => (
      <div key={idx} 
        onClick={item.onClick}
        className="insight-row active-press"
      >
        <div className="flex flex-col min-w-0 w-full">
          <span className="text-label mb-1">{item.label}</span>
          <span className={item.isEmpty ? "text-subtitle" : "text-value"}>{item.valueText}</span>
          {item.isEmpty && item.ctaLabel && (
            <span className="text-value mt-3">→ {item.ctaLabel}</span>
          )}
        </div>
        {!item.isEmpty && (
          <svg className="w-5 h-5 opacity-40 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    ))}
  </div>
));

/**
 * STATUS INSTRUMENT (V15 - Minimal Indicator)
 */
export const StatusInstrument = memo(({ 
  level, 
  statusText, 
}: { 
  level: 'healthy' | 'attention' | 'critical'; 
  statusText: string; 
}) => (
  <div className="flex items-center gap-2-5 px-2">
    <div className={cn(
      "w-2 h-2 rounded-full",
      level === 'healthy' ? "healthy" :
      level === 'attention' ? "attention" : "critical"
    )} />
    <span className="text-subtitle">{statusText}</span>
  </div>
));

/**
 * UPCOMING INSTRUMENT (V15 - Secondary Clean Card)
 */
export const UpcomingInstrument = memo(({ title, client, date, relativeTime, onClick }: { title: string; client: string; date: string; relativeTime: string; onClick?: () => void }) => (
  <div 
    className="surface-primary active-press flex flex-col"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-6">
      <span className="text-label">PRÓXIMO COMPROMISSO</span>
      <span className="text-accent-gold text-subtitle">{relativeTime}</span>
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-subtitle mb-1">{date}</span>
      <p className="text-title truncate">{title}</p>
      <p className="text-label truncate mt-1">{client}</p>
    </div>
  </div>
));

/* --- BACKWARD COMPATIBILITY EXPORTS --- */

export interface LegacyCardProps extends CardProps {
  tone?: 'gold' | 'red' | 'neutral';
}

export const TypeACard = memo(({ children, className, ...props }: LegacyCardProps) => (
  <section className={cn("p-4 rounded-3xl bg-white-2 border border-white-5", className)} {...props}>{children}</section>
));

export const TypeBCard = memo(({ children, className, ...props }: LegacyCardProps) => (
  <section className={cn("p-4 rounded-3xl bg-white-2 border border-white-5", className)} {...props}>{children}</section>
));

export const TypeCCard = memo(({ children, className, ...props }: LegacyCardProps) => (
  <section className={cn("p-4 opacity-50", className)} {...props}>{children}</section>
));

export const P0Button = memo(({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("h-12 px-6 rounded-2xl bg-[var(--accent-gold)] text-black font-black", className)} {...props}>{children}</button>
));

export const P1Button = memo(({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("h-10 px-5 rounded-2xl border border-white-10 text-white font-bold", className)} {...props}>{children}</button>
));

export const P2Button = memo(({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("h-9 px-4 text-muted-foreground font-bold", className)} {...props}>{children}</button>
));

export const AferixStatusPill = memo(({ status }: { status: string }) => (
  <span className="text-[9px] font-black tracking-widest opacity-40 uppercase border border-white-10 px-2 py-0.5 rounded-full">{status}</span>
));

export const SyncHUD = memo(({ state, count, onRefresh }: { state: string; count: number; onRefresh: () => void }) => (
  <button onClick={onRefresh} className="h-8 px-3 rounded-full bg-white-5 text-[8px] font-black uppercase tracking-widest">{state === 'synced' ? 'Ready' : `Sync ${count}`}</button>
));
