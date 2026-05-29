import React, { memo, type ReactNode, type HTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/ui';
import { TrendingUp, AlertCircle, Check, ChevronRight, Inbox, CloudUpload, WifiOff } from 'lucide-react';
import { MoneyValue } from '../../app/components/ui';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: React.ElementType;
  interactive?: boolean;
}

/**
 * TYPE A (Attention Card): High priority, maximum visual weight.
 */
export const TypeACard = memo(({
  children,
  padding = 'md',
  className,
  as: Component = 'section',
  interactive = true,
  ...props
}: CardProps & { tone?: 'gold' | 'red' }) => {
  return (
    <Component
      className={cn(
        "card-type-a transition-all",
        props.tone === 'red' && "tone-red",
        interactive && "active-press cursor-pointer",
        padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * TYPE B (Operational Card): Medium visual weight.
 */
export const TypeBCard = memo(({
  children,
  padding = 'md',
  className,
  as: Component = 'section',
  interactive = true,
  ...props
}: CardProps) => {
  return (
    <Component
      className={cn(
        "card transition-all",
        interactive && "hover:bg-white-4 active-press cursor-pointer",
        padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * TYPE C (Information Card): Minimal visual weight.
 */
export const TypeCCard = memo(({
  children,
  padding = 'md',
  className,
  as: Component = 'section',
  interactive = false,
  ...props
}: CardProps) => {
  return (
    <Component
      className={cn(
        "card transition-all shadow-none bg-transparent border-white-5",
        interactive && "hover:bg-white-8 active-press cursor-pointer",
        padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : 'p-5',
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
});

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * P0 Button: Primary CTA.
 */
export const P0Button = memo(({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "h-12 px-6 rounded-lg bg-[var(--accent-gold)] text-black font-bold text-ui-base tracking-tight shadow-button transition-all active-press flex items-center justify-center gap-2 shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

/**
 * P1 Button: Secondary CTA.
 */
export const P1Button = memo(({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "h-10 px-5 rounded-lg border border-white-10 text-[var(--text-primary)] font-bold text-ui-sm tracking-tight transition-all active-press flex items-center justify-center gap-2 shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

/**
 * P2 Button: Utility or tertiary action.
 */
export const P2Button = memo(({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        "h-9 px-4 rounded-lg bg-transparent text-[var(--text-muted)] font-bold text-ui-xs tracking-widest transition-all active-press flex items-center justify-center gap-1 shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

/**
 * CARD TYPE A (Attention): High priority, maximum visual weight.
 */
export const CardTypeA = memo(({
  children,
  padding = 'md',
  className,
  as: Component = 'section',
  tone = 'gold',
  interactive = true,
  ...props
}: CardProps & { tone?: 'gold' | 'red' }) => {
  return (
    <Component
      className={cn(
        "card transition-all",
        tone === 'red' && "border-[var(--accent-red)]",
        tone === 'gold' && "border-[var(--accent-gold)]",
        interactive && "active-press cursor-pointer",
        padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : 'p-5',
        className
      )}
      {...props}
    >
      <div className="relative z-10 pl-1">
        {children}
      </div>
    </Component>
  );
});

/**
 * CARD TYPE B (Operational): Medium visual weight.
 */
export const CardTypeB = memo(({
  children,
  padding = 'md',
  className,
  as: Component = 'section',
  interactive = true,
  ...props
}: CardProps) => {
  return (
    <Component
      className={cn(
        "card transition-all",
        interactive && "hover:bg-white-4 active-press cursor-pointer",
        padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : 'p-5',
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
});

/**
 * CARD TYPE C (Information): Minimal visual weight.
 */
export const CardTypeC = memo(({
  children,
  padding = 'md',
  className,
  as: Component = 'section',
  interactive = false,
  ...props
}: CardProps) => {
  return (
    <Component
      className={cn(
        "card transition-all",
        interactive && "hover:bg-white-6 active-press cursor-pointer",
        padding === 'none' ? 'p-0' : padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : 'p-5',
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
});

interface ExecutiveKPIProps {
  profit: number;
  margin: number;
  monthlyGoal: number;
  monthlyGoalProgress: number;
}

/**
 * ExecutiveKPI: Compact authority hero for monthly result.
 */
export const ExecutiveKPI = memo(({ profit, margin, monthlyGoal, monthlyGoalProgress }: ExecutiveKPIProps) => {
  return (
    <section className="card glow-gold relative overflow-hidden p-4 flex flex-col gap-1-5 min-h-[110px]">
      <div className="flex items-center justify-between">
        <span className="text-ui-xs text-muted-foreground font-black tracking-widest flex items-center gap-1.5">
          <span className="w-1 h-1 bg-[var(--accent-gold)] rounded-full shadow-[0_0_8px_var(--accent-gold)]" />
          LUCRO DO MÊS
        </span>
        <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-wider">MAIO / 2026</span>
      </div>

      <div className="flex items-center justify-between">
         <div className="text-hero text-[oklch(0.82_0.14_155)] leading-tight">
           <MoneyValue value={profit} />
         </div>
         <div className="h-8 w-16 opacity-40">
           <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
             <path d="M0 35 Q 25 10, 50 25 T 100 5" fill="none" stroke="oklch(0.82 0.14 155)" strokeWidth="3" />
           </svg>
         </div>
      </div>

      <div className="flex items-center gap-3 border-t border-white-5 pt-2 mt-1">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-[oklch(0.82_0.14_155)]" />
          <span className="text-ui-xs font-black text-[oklch(0.82_0.14_155)]">+{profit > 0 ? '18,4%' : '0%'} <span className="opacity-60 font-medium lowercase tracking-normal">vs anterior</span></span>
        </div>
        <div className="h-3 w-px bg-white-10" />
        <span className="text-ui-xs text-muted-foreground font-black tracking-widest">
          META: <span className="text-[var(--text-primary)]">{monthlyGoalProgress}%</span>
        </span>
      </div>
    </section>
  );
});

interface AttentionCardProps {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  actionLabel: string;
  onClick: () => void;
}

/**
 * AttentionCard: Highly visible P0 Alert Card with clear borders, contrast, and action trigger.
 */
export const AttentionCard = memo(({ id, title, subtitle, type, actionLabel, onClick }: AttentionCardProps) => {
  return (
    <section 
      className="card mt-4 flex items-start gap-3 p-4 active-press cursor-pointer"
      onClick={onClick}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[rgba(212,163,89,0.1)] text-primary border border-white-10">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ui-base font-semibold leading-tight">{title}</p>
        <p className="text-ui-sm mt-1 text-muted-foreground truncate">{subtitle}</p>
      </div>
      <ChevronRight className="mt-2 h-4 w-4 text-muted-foreground" />
    </section>
  );
});

interface OpportunityCardProps {
  id: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  onClick: () => void;
}

/**
 * OpportunityCard: Commercial focus card for P1 Opportunity Stack.
 */
export const OpportunityCard = memo(({ id, title, subtitle, actionLabel, onClick }: OpportunityCardProps) => {
  return (
    <section 
      className="card flex items-center justify-between gap-3 p-4 active-press cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-lg bg-white-5 border border-white-10 flex items-center justify-center text-[var(--accent-gold)] shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex flex-col">
          <strong className="block text-ui-base font-semibold text-[var(--text-primary)] truncate leading-tight">
            {title}
          </strong>
          <span className="text-ui-sm text-muted-foreground mt-1 truncate">
            {subtitle}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
    </section>
  );
});

interface SyncBadgeProps {
  syncState: 'offline' | 'pending' | 'synced';
  pendingSyncCount: number;
  onRefresh?: () => void;
}

/**
 * SyncBadge: Connection & sync state HUD indicator with real-time cues.
 */
export const SyncBadge = memo(({ syncState, pendingSyncCount, onRefresh }: SyncBadgeProps) => {
  if (syncState === 'offline') {
    return (
      <div 
        onClick={onRefresh}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white-5 border border-white-10 text-[var(--accent-red)] text-ui-xs font-bold cursor-pointer"
      >
        <WifiOff className="h-3.5 w-3.5" />
        <span>OFFLINE</span>
      </div>
    );
  }
  if (syncState === 'pending') {
    return (
      <div 
        onClick={onRefresh}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white-5 border border-white-10 text-[var(--accent-gold)] text-ui-xs font-bold cursor-pointer"
      >
        <CloudUpload className="h-3.5 w-3.5 animate-pulse" />
        <span>{pendingSyncCount}</span>
      </div>
    );
  }
  return (
    <div 
      onClick={onRefresh}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white-3 border border-white-5 text-[var(--accent-green)] text-ui-xs font-bold cursor-pointer"
    >
      <Check className="h-3.5 w-3.5" />
      <span>SYNC</span>
    </div>
  );
});

interface SectionHeaderProps {
  title: string;
  count?: number;
  countLabel?: string;
  action?: ReactNode;
}

/**
 * SectionHeader: Reference Section Label with action support.
 */
export const SectionHeader = memo(({ title, action }: SectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center px-1 mb-3">
      <h3 className="text-ui-xs text-muted-foreground font-semibold uppercase tracking-[0.18em]">
        {title}
      </h3>
      {action && (
        <div className="text-[11px] font-medium text-primary uppercase tracking-wider cursor-pointer">
          {action}
        </div>
      )}
    </div>
  );
});

interface EmptyStateCardProps {
  type: 'attention' | 'opportunity';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyStateCard: Elegant and helpful illustration alternative to empty content.
 */
export const EmptyStateCard = memo(({ type, title, description, actionLabel, onAction }: EmptyStateCardProps) => {
  const isAttention = type === 'attention';

  return (
    <section className="card py-10 flex flex-col items-center gap-3 border-dashed border-white-10 opacity-60">
      <div className={cn(
        "h-12 w-12 rounded-full flex items-center justify-center border border-white-10 bg-white-3"
      )}>
        {isAttention ? (
          <Check className="h-5 w-5 text-[var(--accent-green)]" />
        ) : (
          <Inbox className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <span className="text-ui-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">
        {title}
      </span>
      <p className="text-ui-xs text-muted-foreground text-center max-w-[240px] leading-relaxed">
        {description}
      </p>
    </section>
  );
});

/**
 * OperationalStatusPill: Compact semantic badge for operational states.
 */
export const OperationalStatusPill = memo(({ status }: { status: string }) => {
  const normalizedStatus = status.toLowerCase();
  
  let styles = "bg-white-5 text-muted-foreground border-white-10";
  let label = status.toUpperCase();

  if (normalizedStatus === 'approved' || normalizedStatus === 'autorizado' || normalizedStatus === 'concluído' || normalizedStatus === 'done') {
    styles = "bg-[oklch(0.82_0.14_155/0.1)] text-[oklch(0.82_0.14_155)] border-[oklch(0.82_0.14_155/0.2)]";
  } else if (normalizedStatus === 'pending' || normalizedStatus === 'enviado' || normalizedStatus === 'aguardando') {
    styles = "bg-[rgba(212,163,89,0.1)] text-[var(--accent-gold)] border-[rgba(212,163,89,0.2)]";
  } else if (normalizedStatus === 'viewed' || normalizedStatus === 'visualizado') {
    styles = "bg-[oklch(0.7_0.13_250/0.1)] text-[oklch(0.7_0.13_250)] border-[oklch(0.7_0.13_250/0.2)]";
  } else if (normalizedStatus === 'rejected' || normalizedStatus === 'recusado' || normalizedStatus === 'cancelado') {
    styles = "bg-[rgba(239,68,68,0.1)] text-[var(--accent-red)] border-[rgba(239,68,68,0.2)]";
  } else if (normalizedStatus === 'in-progress' || normalizedStatus === 'em execução') {
    styles = "bg-[oklch(0.82_0.14_155/0.1)] text-[oklch(0.82_0.14_155)] border-[oklch(0.82_0.14_155/0.2)] animate-pulse";
  }

  return (
    <span className={cn("px-2 py-0.5 rounded-full border text-[9px] font-black tracking-widest", styles)}>
      {label}
    </span>
  );
});

export function KpiItem({ 
  label, 
  value, 
  color, 
  isPercent, 
  isCurrency,
  description 
}: { 
  label: string; 
  value: number; 
  color: string; 
  isPercent?: boolean;
  isCurrency?: boolean;
  description?: string;
}) {
  const hasValue = value > 0;
  
  return (
    <section className="card p-3-5 flex flex-col gap-1 min-h-[95px] justify-between">
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
      
      <div className="flex flex-col gap-1">
        <p className="num text-lg font-black leading-none" style={{ color }}>
          {!hasValue && !isPercent && !isCurrency ? '0' : 
           isPercent ? `${value.toFixed(1).replace(".",",")}%` : 
           isCurrency ? <MoneyValue value={value} /> : value}
        </p>
        
        {description && (
          <p className="text-[8.5px] font-bold text-muted-foreground opacity-60 uppercase tracking-wide leading-tight">
            {description}
          </p>
        )}
      </div>

      {hasValue && (
        <div className="mt-1 h-1 w-full opacity-30 relative overflow-hidden rounded-full bg-white-5">
           <div className="absolute inset-y-0 left-0 bg-white-10" style={{ width: '40%', backgroundColor: color }} />
        </div>
      )}
    </section>
  );
}
