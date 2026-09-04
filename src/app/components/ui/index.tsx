import { useEffect, useRef, memo, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronRight, 
  ChevronLeft,
  MoreHorizontal, 
  Search, 
  Plus,
  ChevronDown,
  X as CloseIcon
} from "lucide-react";
import { CompactActionMenu, type CompactActionItem } from '../CompactActionMenu';
import { MobileActionMenu } from './MobileActionMenu';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea';
import { PageShell } from '../PageShell';
import { cn } from '../../../utils/ui';

export { 
  ERPLoader,
  AppHeader as PageTitle,
  AppHeader as PageHeader,
  SectionLabel,
  SurfaceCard,
  SurfaceCard as Card,
  SurfaceCard as Surface,
  SemanticBadge as Badge
} from '../../../ui/system';

export { 
  MetricCard, 
  SectionTitle, 
  SearchInput 
} from '../../../ui/primitives';

export { KpiCard } from './KpiCard';
export { Sparkline } from './Sparkline';
import { SurfaceCard, type SurfaceCardProps } from './SurfaceCard';

type Tone = 'default' | 'brand' | 'success' | 'danger' | 'muted' | 'blue' | 'green' | 'orange' | 'gold';

/**
 * Button: Tactile Golden V12 Action Primitive.
 */
export function Button({
  children,
  variant = 'secondary',
  className = '',
  tone,
  ...props
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  tone?: Tone;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = "min-h-[48px] font-bold transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 select-none relative disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const effectiveVariant = tone === 'danger' ? 'danger' : variant;

  const variantClasses = {
    primary: "min-h-[56px] h-14 py-3.5 px-6 bg-white text-[#2C2C2E] rounded-full text-[14px] uppercase tracking-[0.05em] shadow-lg hover:brightness-95",
    secondary: "min-h-[48px] h-12 py-3 px-5 bg-[#3A3A3C] text-white/90 border border-white/5 rounded-[14px] text-[13px] hover:border-white/15",
    ghost: "min-h-[48px] h-12 py-3 px-4 bg-transparent text-[#8E8E93] hover:text-white rounded-[14px] text-[13px]",
    danger: "min-h-[48px] h-12 py-3 px-5 bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/20 rounded-[14px] text-[13px] hover:bg-[#FF453A]/25",
  };
  
  return (
    <button 
      className={cn(baseClasses, variantClasses[effectiveVariant], className)} 
      type="button" 
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { children: ReactNode, tone?: Tone }) {
  const { children, className = '', tone, ...rest } = props;
  return <Button variant="primary" className={className} tone={tone} {...rest}>{children}</Button>;
}

export function SecondaryButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { children: ReactNode }) {
  const { children, className = '', ...rest } = props;
  return <Button variant="secondary" className={className} {...rest}>{children}</Button>;
}

export function DangerButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { children: ReactNode }) {
  const { children, className = '', ...rest } = props;
  return <Button variant="danger" className={className} {...rest}>{children}</Button>;
}

/**
 * AferixTabs: Executive Switcher aligned with V12 Dark Graphite.
 */
export function AferixTabs({ 
  items, 
  activeId, 
  onChange,
  className = ''
}: { 
  items: { id: string; label: string }[]; 
  activeId: string; 
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x", className)}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "h-11 px-5 rounded-[12px] text-[12px] font-bold uppercase tracking-wider transition-all whitespace-nowrap snap-start border active:scale-95 cursor-pointer",
            activeId === item.id 
              ? "bg-white text-[#2C2C2E] border-white font-bold shadow-md" 
              : "bg-[#3A3A3C] text-[#8E8E93] border-white/5 hover:text-white hover:border-white/10"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export { PipelineCard } from './PipelineCard';
export { StatusPill, StatusPill as StatusBadge } from '../../../ui/system';

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
    <button 
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "13px 20px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "none",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        transition: "background 0.12s ease",
      }}
      className={cn(
        onClick && "hover:bg-white/[0.02] active:bg-white/[0.04]",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <strong style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</strong>
        </div>
        {context && <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.6 }}>{context}</p>}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
        {value && <span className="num text-[13px] font-bold text-white">{value}</span>}
        {status && <div className="scale-75 origin-right">{status}</div>}
      </div>

      {(action || onClick) && (
        <div className="flex items-center gap-2 ml-1 opacity-20 shrink-0">
          {action}
          {onClick && <ChevronRight size={13} />}
        </div>
      )}
    </button>
  );
});

/**
 * EditorialMetric: Ultra-minimal inline metric.
 */
export function EditorialMetric({ label, value, color, compact = false }: { label: string; value: ReactNode; color?: string; compact?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[9px] font-bold tracking-widest text-[var(--text-muted)] mb-2 uppercase">{label}</p>
      <p className={cn("num font-bold text-[var(--text-primary)] tracking-tight", compact ? "text-h3" : "text-h2")} style={{ color }}>{value}</p>
    </div>
  );
}

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
    <div className={cn("flex items-start gap-5 p-6 rounded-[var(--radius-card)] bg-white/[0.02] border border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)]", className)}>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border border-[var(--accent-gold)]/20">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold leading-tight text-[var(--text-primary)]">{title}</p>
        <p className="mt-1.5 text-[12.5px] text-[var(--text-secondary)] leading-relaxed font-medium opacity-60">{meta}</p>
        {actionLabel && (
          <button className="mt-4 text-[11px] font-black font-mono text-[var(--accent-gold)] uppercase tracking-widest" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      {!actionLabel && <ChevronRight className="mt-4 h-4 w-4 text-[var(--text-tertiary)] opacity-40" />}
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
            "whitespace-nowrap rounded-full border min-h-[42px] px-6 text-ui-sm font-bold transition-all flex items-center justify-center active:scale-[0.97]",
            selected.includes(item.id) 
              ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black shadow-[var(--shadow-primary)]" 
              : "border-white/[0.05] bg-white/[0.04] text-[var(--text-secondary)] hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)]"
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

/**
 * QueueEmptyState: Clean empty state aligned with V12 Dark Graphite.
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
    <div className={cn("p-8 text-center flex flex-col items-center justify-center gap-3 rounded-[20px] border border-white/5 bg-[#363638]", className)}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] mb-1">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-xs">
        <span className="text-[15px] font-bold text-white">{title}</span>
        {meta && <p className="text-[13px] text-[#8E8E93] leading-relaxed font-medium">{meta}</p>}
      </div>
      {action && <div className="mt-2 w-full max-w-xs">{action}</div>}
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
 * Refactored for absolute Physical Environment consistency (Phase 4H).
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
    <label className={cn("block group", className)}>
      {label && <span className="block mb-3 text-[9.5px] font-black font-mono text-[var(--text-secondary)] uppercase tracking-[0.25em] ml-1 opacity-70">{label}</span>}
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          disabled={disabled}
          className="w-full min-h-[44px] bg-[var(--bg-surface)] border border-white/[0.06] rounded-[8px] px-6 py-5 text-[15px] font-semibold appearance-none focus:outline-none focus:border-[var(--accent-gold)]/40 focus:ring-4 focus:ring-[var(--accent-gold)]/5 transition-all text-[var(--text-primary)] disabled:opacity-50"
        >
          {children}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)] group-focus-within:text-[var(--accent-gold)] transition-colors">
          <ChevronDown className="h-4 w-4" strokeWidth={3} />
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
    <label className={cn("block group", className)}>
      {label && <span className="block mb-3 text-[9.5px] font-black font-mono text-[var(--text-secondary)] uppercase tracking-[0.25em] ml-1 opacity-70">{label}</span>}
      <input 
        {...props} 
        className="w-full min-h-[44px] bg-[var(--bg-surface)] border border-white/[0.06] rounded-[8px] px-6 py-5 text-[15px] font-semibold appearance-none focus:outline-none focus:border-[var(--accent-gold)]/40 focus:ring-4 focus:ring-[var(--accent-gold)]/5 transition-all text-[var(--text-primary)] disabled:opacity-50 placeholder:text-[var(--text-tertiary)] placeholder:font-medium" 
      />
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
    <label className={cn("block group", className)}>
      {label && <span className="block mb-3 text-[9.5px] font-black font-mono text-[var(--text-secondary)] uppercase tracking-[0.25em] ml-1 opacity-70">{label}</span>}
      <textarea
        ref={ref}
        className="w-full bg-[var(--bg-surface)] border border-white/[0.06] rounded-[8px] px-6 py-5 text-[15px] font-semibold focus:outline-none focus:border-[var(--accent-gold)]/40 focus:ring-4 focus:ring-[var(--accent-gold)]/5 transition-all leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:font-medium min-h-[120px] resize-none disabled:opacity-50"
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
    <label className={cn("block group", className)}>
      {label && <span className="block mb-3 text-[9.5px] font-black font-mono text-[var(--text-secondary)] uppercase tracking-[0.25em] ml-1 opacity-70">{label}</span>}
      <div className="flex items-center bg-[var(--bg-surface)] border border-white/[0.06] rounded-[8px] px-6 py-5 focus-within:border-[var(--accent-gold)]/40 focus-within:ring-4 focus-within:ring-[var(--accent-gold)]/5 transition-all">
        <span className="text-[var(--text-tertiary)] mr-4 text-[12px] font-bold tracking-widest font-mono group-focus-within:text-[var(--accent-gold)] transition-colors">R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder || '0,00'}
          onChange={handleChange}
          disabled={disabled}
          className="w-full font-mono text-[20px] font-black text-[var(--text-primary)] focus:outline-none bg-transparent placeholder:text-white/5"
        />
      </div>
    </label>
  );
}

/**
 * Modal: Adaptive Command Drawer / BottomSheet.
 * Aligned with Golden V12 Dark Industrial Graphite (#2C2C2E, rounded-t-[28px], border-white/10).
 */
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
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-[#2C2C2E] border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[28px] shadow-[0_-12px_40px_rgba(0,0,0,0.5)]",
          "w-full max-w-[430px] overflow-hidden relative flex flex-col p-6 pb-10 sm:pb-6",
          "animate-in slide-in-from-bottom duration-300"
        )}
        style={{ maxHeight: "90vh" }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Mobile Pull Bar */}
        <div className="sm:hidden flex justify-center pb-2">
           <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-[16px] font-bold text-white tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="text-[#8E8E93] hover:text-white p-1 text-sm font-bold cursor-pointer"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>
        
        <div className="py-4 text-[#C7C7CC] flex-1 overflow-y-auto scrollbar-none">
          {children}
        </div>
        
        <footer 
          className="pt-4 flex flex-col sm:flex-row-reverse gap-3 border-t border-white/5"
        >
          {onConfirm && (
            <PrimaryButton 
              onClick={onConfirm}
              tone={tone}
              className="w-full"
            >
              {confirmLabel}
            </PrimaryButton>
          )}
          <SecondaryButton 
            onClick={onClose} 
            className="w-full"
          >
            {cancelLabel}
          </SecondaryButton>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export const FAB = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="fixed grid place-items-center rounded-full bg-[var(--accent-gold)] text-black shadow-[var(--shadow-primary)] z-toast active:scale-[0.9] transition-all hover:scale-[1.05]"
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

export { PageShell };
export { ConfirmModal } from './ConfirmModal';
