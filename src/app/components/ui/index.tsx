import { useEffect, useRef, memo, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { 
  ChevronRight, 
  ChevronLeft,
  MoreHorizontal, 
  Search, 
  Plus
} from "lucide-react";
import { CompactActionMenu, type CompactActionItem } from '../CompactActionMenu';
import { MobileActionMenu } from './MobileActionMenu';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea';
import { PageShell } from '../PageShell';
import { cn } from '../../../utils/ui';

export { ERPLoader } from '../../../ui/system';
export { KpiCard } from './KpiCard';
export { Sparkline } from './Sparkline';
import { SurfaceCard, type SurfaceCardProps } from './SurfaceCard';

type Tone = 'default' | 'brand' | 'success' | 'danger' | 'muted';

/**
 * PageTitle: Premium Operational Header.
 * Refactored for TOKEN-FIRST architecture (Executive OS V5).
 */
export function PageTitle({ 
  eyebrow, 
  title, 
  subtitle, 
  action,
  onBack
}: { 
  eyebrow?: string; 
  title: string; 
  subtitle?: string; 
  action?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="mb-12 flex flex-col gap-lg">
      {onBack && (
        <button 
          onClick={onBack} 
          className="flex w-fit items-center gap-sm text-ui-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" /> VOLTAR
        </button>
      )}
      <div className="flex items-end justify-between gap-lg">
        <div className="flex flex-col items-start min-w-0">
          {eyebrow && <p className="mb-1 text-ui-xs text-[var(--accent-gold)]">{eyebrow}</p>}
          <h1 className="text-h1 text-[var(--text-primary)] truncate w-full">{title}</h1>
          {subtitle && <p className="mt-2 text-ui-sm text-[var(--text-secondary)] leading-relaxed max-w-[90%]">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 mb-1">{action}</div>}
      </div>
    </div>
  );
}

/**
 * SectionLabel: Operational Divider.
 * Refactored for TOKEN-FIRST architecture.
 */
export function SectionLabel({ 
  children, 
  action,
  className = ''
}: { 
  children: ReactNode; 
  action?: ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("mb-6 mt-12 flex items-center justify-between", className)}>
      <h2 className="text-ui-xs text-[var(--text-muted)]">{children}</h2>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Button: Tactile action primitive.
 * Refactored for TOKEN-FIRST architecture.
 */
export function Button({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = "min-h-[52px] rounded-[var(--radius-button)] px-shell text-ui-base font-bold transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-sm";
  
  const variantClasses = {
    primary: "bg-[var(--accent-gold)] text-black shadow-[var(--shadow-button)] hover:brightness-105",
    secondary: "bg-[var(--bg-surface-glass)] border var(--border-soft) text-[var(--text-primary)] hover:bg-white/[0.07]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    danger: "bg-[var(--accent-red)]/15 text-[var(--accent-red)] hover:bg-[var(--accent-red)]/25",
  };
  
  return (
    <button 
      className={cn(baseClasses, variantClasses[variant], className)} 
      type="button" 
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { children: ReactNode }) {
  const { children, className = '', ...rest } = props;
  return <Button variant="primary" className={className} {...rest}>{children}</Button>;
}

export function SecondaryButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { children: ReactNode }) {
  const { children, className = '', ...rest } = props;
  return <Button variant="secondary" className={className} {...rest}>{children}</Button>;
}

export function DangerButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { children: ReactNode }) {
  const { children, className = '', ...rest } = props;
  return <Button variant="danger" className={className} {...rest}>{children}</Button>;
}

export { PipelineCard } from './PipelineCard';
export { SurfaceCard };

/**
 * Surface/Card: Legacy aliases, now powered by SurfaceCard.
 */
export function Surface(props: SurfaceCardProps) { return <SurfaceCard {...props} />; }
export function Card(props: SurfaceCardProps) { return <SurfaceCard {...props} />; }

/**
 * StatusPill: Premium status badge.
 * Refactored for TOKEN-FIRST architecture.
 */
export const StatusPill = memo(function StatusPill({ 
  status,
  className
}: { 
  status: string;
  className?: string;
}) {
  const normalized = (status ?? '').toLowerCase().replace(' ', '_').replace('em_execucao', 'execucao');
  
  const map: Record<string, string> = {
    iniciado:   "bg-white/10 text-[var(--text-secondary)]",
    enviado:    "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]",
    aprovado:   "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border var(--border-soft)",
    autorizado: "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border var(--border-soft)",
    execucao:   "bg-[var(--accent-gold)] text-black shadow-[var(--shadow-cinematic)]",
    finalizado: "bg-white/15 text-[var(--text-primary)]",
    arquivado:  "bg-white/10 text-[var(--text-muted)]",
    cancelado:  "bg-[var(--accent-red)]/20 text-[var(--accent-red)] border var(--border-soft)",
    recusado:   "bg-[var(--accent-red)]/20 text-[var(--accent-red)] border var(--border-soft)",
  };

  const labels: Record<string, string> = {
    iniciado: "Iniciado", 
    enviado: "Enviado", 
    aprovado: "Aprovado",
    autorizado: "Autorizado",
    execucao: "Em execução", 
    finalizado: "Finalizado", 
    arquivado: "Arquivado",
    cancelado: "Cancelado",
    recusado: "Recusado"
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all", map[normalized] || map.iniciado, className)}>
      {labels[normalized] || labelize(status)}
    </span>
  );
});

function labelize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ');
}

/**
 * ListCard: Premium container for operational lists.
 */
export function ListCard({ 
  title, 
  children, 
  action, 
  className = '',
  ...props
}: { 
  title?: string; 
  children: ReactNode; 
  action?: ReactNode; 
  className?: string;
} & HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn("w-full flex flex-col", className)} {...props}>
      {(title || action) && (
        <header className="flex items-center justify-between mb-4 px-1">
          <div>{title && <h3 className="text-ui-xs text-[var(--text-muted)]">{title}</h3>}</div>
          {action && <div>{action}</div>}
        </header>
      )}
      <div className="flex flex-col gap-sm">
        {children}
      </div>
    </div>
  );
}

/**
 * ListItem: Premium Operational Row.
 */
export const ListItem = memo(function ListItem({
  title,
  context,
  value,
  status,
  action,
  onClick,
  className = '',
}: {
  title: ReactNode;
  context?: ReactNode;
  value?: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <article 
      className={cn(
        "flex items-center gap-md py-4 px-shell transition-all duration-200 rounded-[var(--radius-button)] bg-white/[0.03] border var(--border-subtle) group", 
        onClick && "cursor-pointer hover:bg-white/[0.06] hover:translate-x-0.5 active:scale-[0.99]", 
        className
      )}
      onClick={onClick}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-sm">
          <strong className="truncate text-ui-md text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">{title}</strong>
          {value && <div className="num text-ui-md font-bold text-[var(--text-primary)]">{value}</div>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-sm">
          {context && <p className="truncate text-ui-sm text-[var(--text-secondary)] font-medium">{context}</p>}
          {status && <div className="shrink-0">{status}</div>}
        </div>
      </div>
      {(action || onClick) && (
        <div className="flex items-center gap-sm ml-1 opacity-40 group-hover:opacity-100 transition-opacity">
          {action}
          {onClick && <ChevronRight className="h-4 w-4" />}
        </div>
      )}
    </article>
  );
});

/**
 * EditorialMetric: Ultra-minimal inline metric.
 */
export function EditorialMetric({ label, value, color, compact = false }: { label: string; value: ReactNode; color?: string; compact?: boolean }) {
  return (
    <div>
      <p className="text-ui-xs text-[var(--text-secondary)] mb-2">{label}</p>
      <p className={cn("num font-bold text-[var(--text-primary)] tracking-tight", compact ? "text-h3" : "text-h2")} style={{ color }}>{value}</p>
    </div>
  );
}

/**
 * MetricCard: Cinematic KPI card.
 */
export const MetricCard = memo(function MetricCard({
  label,
  value,
  featured = false,
  className = '',
  color,
}: {
  label: string;
  value: ReactNode;
  featured?: boolean;
  className?: string;
  color?: string;
}) {
  return (
    <div 
      className={cn(
        "p-card rounded-[var(--radius-card)] flex flex-col justify-between transition-all duration-500",
        featured 
          ? "bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold)]/80 text-black shadow-[var(--shadow-cinematic)] scale-[1.02]" 
          : "bg-[var(--surface-gradient)] border var(--border-soft) shadow-[var(--shadow-soft)]",
        className
      )}
    >
      <p className={cn("text-ui-xs", featured ? "text-black/60" : "text-[var(--text-muted)]")}>{label}</p>
      <p className={cn("num font-bold tracking-tighter mt-4", featured ? "text-h2" : "text-h3")} style={{ color: featured ? undefined : color }}>{value}</p>
    </div>
  );
});

export const Badge = memo(function Badge({ children, tone = 'default', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  const tones = {
    default: "bg-white/10 text-[var(--text-secondary)]",
    brand: "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]",
    success: "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]",
    danger: "bg-[var(--accent-red)]/20 text-[var(--accent-red)]",
    muted: "bg-white/5 text-[var(--text-muted)]",
  };
  return <span className={cn("inline-flex items-center rounded-lg px-2.5 py-0.5 text-ui-xs border border-transparent", tones[tone], className)}>{children}</span>;
});

/**
 * ContextBanner: Action-oriented info banner.
 */
export function ContextBanner({
  title,
  meta,
  icon,
  actionLabel,
  onAction,
  className = '',
}: {
  title: string;
  meta: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-md p-card rounded-[var(--radius-card)] bg-white/[0.04] border var(--border-soft) shadow-[var(--shadow-soft)]", className)}>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ui-md font-bold leading-tight text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-ui-sm text-[var(--text-secondary)] leading-relaxed font-medium opacity-80">{meta}</p>
        {actionLabel && (
          <button className="mt-4 text-ui-xs text-[var(--accent-gold)] font-bold" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      {!actionLabel && <ChevronRight className="mt-3 h-4 w-4 text-[var(--text-muted)] opacity-30" />}
    </div>
  );
}

/**
 * MonetaryValue: currency formatting utility.
 */
export const MoneyValue = memo(function MoneyValue({ value, compact = false }: { value: number; compact?: boolean }) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);

  return <span className="num">{formatted}</span>;
});

/**
 * Standard Aferix Layout Helpers
 */
export function PageHeader(props: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode; onBack?: () => void }) { return <PageTitle {...props} />; }
export function SectionHeader(props: { children: ReactNode; action?: ReactNode; className?: string }) { return <SectionLabel {...props} />; }
export function StatusBadge(props: { status: string; className?: string }) { return <StatusPill {...props} />; }
export function BackButton({ label = 'Voltar', onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button className="flex items-center gap-sm text-ui-sm font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]" onClick={onClick}>
      <ChevronLeft className="h-4 w-4" /> {label.toUpperCase()}
    </button>
  );
}

export function FilterChips<T extends string>({
  items,
  active,
  onChange,
  className = '',
  ariaLabel = 'Filtros',
  disabled = false,
}: {
  items: Array<{ id: T; label: string }>;
  active: T | T[];
  onChange: (active: T[]) => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const selected = Array.isArray(active) ? active : [active];

  return (
    <div className={cn("flex gap-sm overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)} role="group" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            "whitespace-nowrap rounded-full border px-5 py-2 text-ui-sm font-bold transition-all",
            selected.includes(item.id) 
              ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black shadow-[var(--shadow-cinematic)]" 
              : "border-white/[0.05] bg-white/[0.04] text-[var(--text-secondary)] hover:bg-white/[0.08]"
          )}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            if (selected.includes(item.id)) {
              onChange(selected.filter((id) => id !== item.id));
            } else {
              onChange([...selected, item.id]);
            }
          }}
          aria-pressed={selected.includes(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function AferixTabs<T extends string>({
  items,
  activeId,
  onChange,
  className = "",
}: {
  items: Array<{ id: T; label: string }>;
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1 p-1 bg-white/[0.03] rounded-xl border var(--border-subtle) w-fit", className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeId === item.id}
          className={cn(
            "px-6 py-2.5 rounded-lg text-ui-sm font-bold transition-all duration-300",
            activeId === item.id 
              ? "bg-[var(--accent-gold)] text-black shadow-[var(--shadow-soft)] scale-[1.02]" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]"
          )}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/**
 * QueueEmptyState: Discrete empty context.
 */
export function QueueEmptyState({ 
  title, 
  meta,
  icon, 
  action, 
  className = '' 
}: { 
  title: string; 
  meta?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("p-12 text-center flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-dashed var(--border-soft) bg-white/[0.01]", className)}>
      {icon && <div className="text-4xl mb-2 opacity-20">{icon}</div>}
      <strong className="text-ui-md font-bold tracking-tight text-[var(--text-primary)]">{title}</strong>
      {meta && <p className="text-ui-sm text-[var(--text-muted)] leading-relaxed max-w-[240px] font-medium opacity-60">{meta}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * ActionMenu: Adaptive responsive menu.
 */
export function ActionMenu({
  items,
  label,
  align = 'right',
}: {
  items: CompactActionItem[];
  label?: string;
  align?: 'left' | 'right';
}) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  if (isMobile) {
    return <MobileActionMenu items={items} label={label} />;
  }
  return <CompactActionMenu items={items} label={label} align={align} />;
}

/**
 * Forms: Premium Operational Inputs
 */
export function Select({
  label,
  value,
  onChange,
  children,
  className = '',
  disabled = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="block mb-2 text-ui-xs text-[var(--text-muted)]">{label}</span>}
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          disabled={disabled}
          className="w-full bg-white/[0.04] border var(--border-subtle) rounded-[var(--radius-button)] px-4 py-4 text-ui-base font-semibold appearance-none focus:outline-none focus:border-[var(--accent-gold)]/40 transition-all shadow-inset"
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-[var(--text-muted)]">
          <MoreHorizontal className="h-4 w-4" />
        </div>
      </div>
    </label>
  );
}

export function Input({
  label,
  className = '',
  ...props
}: {
  label?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="block mb-2 text-ui-xs text-[var(--text-muted)]">{label}</span>}
      <input {...props} className="w-full bg-white/[0.04] border var(--border-subtle) rounded-[var(--radius-button)] px-4 py-4 text-ui-base font-semibold focus:outline-none focus:border-[var(--accent-gold)]/40 transition-all shadow-inset text-[var(--text-primary)]" />
    </label>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  label,
  rows = 1,
  className = '',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextArea(ref, value);

  return (
    <label className={cn("block", className)}>
      {label && <span className="block mb-2 text-ui-xs text-[var(--text-muted)]">{label}</span>}
      <textarea
        ref={ref}
        className="w-full bg-white/[0.04] border var(--border-subtle) rounded-[var(--radius-button)] px-4 py-4 text-ui-base font-semibold focus:outline-none focus:border-[var(--accent-gold)]/40 transition-all shadow-inset leading-relaxed text-[var(--text-primary)]"
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </label>
  );
}

export function MonetaryInput({
  value,
  onChange,
  placeholder,
  label,
  className = '',
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}) {
  const displayValue = value === 0 ? '' : new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = Number(rawValue) / 100;
    onChange(numericValue);
  }

  return (
    <label className={cn("block", className)}>
      {label && <span className="block mb-2 text-ui-xs text-[var(--text-muted)]">{label}</span>}
      <div className="flex items-center bg-white/[0.04] border var(--border-subtle) rounded-[var(--radius-button)] px-4 py-4 shadow-inset focus-within:border-[var(--accent-gold)]/40 transition-all">
        <span className="text-[var(--text-muted)] mr-2 text-ui-sm font-bold tracking-tight">R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder || '0,00'}
          onChange={handleChange}
          disabled={disabled}
          className="w-full num font-bold text-[var(--text-primary)] text-ui-md focus:outline-none bg-transparent"
        />
      </div>
    </label>
  );
}

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  tone = 'brand',
}: {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  tone?: Tone;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="aferix-modal-overlay p-shell" onClick={onClose}>
      <div className="bg-[var(--bg-surface)] border var(--border-soft) rounded-[var(--radius-modal)] w-full max-w-[440px] shadow-card overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <header className="px-shell pt-10 pb-6">
          <h2 className="text-h3 text-[var(--text-primary)]">{title}</h2>
        </header>
        <div className="px-shell py-2 text-[var(--text-secondary)]">
          {children}
        </div>
        <footer className="p-shell flex flex-col gap-sm pb-10">
          {onConfirm && (
            <button 
              onClick={onConfirm}
              className={cn(
                "w-full h-16 rounded-[var(--radius-button)] text-ui-base font-bold transition-all active:scale-[0.98] shadow-button",
                tone === 'danger' ? "bg-[var(--accent-red)] text-white" : "bg-[var(--accent-gold)] text-black"
              )}
            >
              {confirmLabel.toUpperCase()}
            </button>
          )}
          <button onClick={onClose} className="w-full h-12 text-ui-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest">{cancelLabel}</button>
        </footer>
      </div>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex flex-1 items-center gap-md rounded-[var(--radius-button)] border var(--border-subtle) bg-white/[0.04] px-shell py-4 focus-within:border-[var(--accent-gold)]/40 transition-all shadow-inset", className)}>
      <Search className="h-5 w-5 text-[var(--text-muted)]" />
      <input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} 
        disabled={disabled}
        className="w-full bg-transparent text-ui-base font-semibold placeholder:text-[var(--text-muted)]/40 focus:outline-none text-[var(--text-primary)]" 
      />
    </div>
  );
}

export const FAB = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="fixed grid place-items-center rounded-full bg-[var(--accent-gold)] text-black shadow-[var(--shadow-button)] z-toast active:scale-[0.9] transition-all hover:scale-[1.05]"
    style={{ 
      bottom: 'var(--fab-bottom)', 
      right: 'var(--fab-right)', 
      height: 'var(--control-h-lg)', 
      width: 'var(--control-h-lg)' 
    }}
    aria-label={label}
  >
    <Plus className="h-8 w-8" strokeWidth={2.5} />
  </button>
);

export function SectionTitle(props: { children: ReactNode; action?: ReactNode; className?: string }) { return <SectionLabel {...props} />; }

export { PageShell };
export { ConfirmModal } from './ConfirmModal';
