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

type Tone = 'default' | 'brand' | 'success' | 'danger' | 'muted';

/**
 * Button: Tactile action primitive.
 * Refactored for BICOLOR AUTHORITY & VISUAL CONTAINMENT (Phase 4H).
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
  const baseClasses = "min-h-[52px] rounded-[16px] px-shell text-[14px] font-bold transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-sm select-none relative overflow-visible";
  
  const effectiveVariant = tone === 'danger' ? 'danger' : variant;

  const variantClasses = {
    primary: "aferix-btn-primary hover:brightness-105 active:brightness-95",
    secondary: "aferix-btn-secondary hover:bg-white/[0.06] active:bg-white/[0.08]",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]",
    danger: "aferix-btn-danger hover:brightness-105 active:brightness-95",
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
          <div>{title && <h3 className="text-ui-xs text-[#505050]">{title}</h3>}</div>
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
      <p className={cn("num font-bold text-[#EFEFEF] tracking-tight", compact ? "text-h3" : "text-h2")} style={{ color }}>{value}</p>
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
    <div className={cn("flex items-start gap-5 p-6 rounded-[22px] bg-white/[0.02] border border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)]", className)}>
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
    <button className="flex items-center gap-sm text-ui-sm font-bold text-[#808080] transition-colors hover:text-[#EFEFEF]" onClick={onClick}>
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
              ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black shadow-[var(--shadow-primary)]" 
              : "border-white/[0.05] bg-white/[0.04] text-[#808080] hover:bg-white/[0.08]"
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
    <div className={cn("flex gap-1.5 p-1.5 bg-white/[0.03] rounded-[14px] border border-white/[0.06] w-fit", className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeId === item.id}
          className={cn(
            "px-6 py-2 rounded-[10px] text-[12px] font-bold transition-all duration-300",
            activeId === item.id 
              ? "bg-[var(--accent-gold)] text-black shadow-[var(--shadow-soft)]" 
              : "text-[#808080] hover:text-[#EFEFEF] hover:bg-white/[0.03]"
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
    <div className={cn("p-12 text-center flex flex-col items-center gap-4 rounded-[22px] border border-dashed border-white/[0.08] bg-white/[0.01]", className)}>
      {icon && <div className="mb-2 opacity-20">{icon}</div>}
      <strong className="text-[15px] font-bold tracking-tight text-[#EFEFEF]">{title}</strong>
      {meta && <p className="text-[13px] text-[#808080] leading-relaxed max-w-[240px] font-medium opacity-60">{meta}</p>}
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
 * Refactored for absolute Home DNA parity (Phase 4H).
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
      {label && <span className="block mb-2.5 text-[10px] font-bold font-mono text-[#3C3C3C] uppercase tracking-[0.2em] ml-1">{label}</span>}
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          disabled={disabled}
          className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[16px] px-5 py-4 text-[14.5px] font-semibold appearance-none focus:outline-none focus:border-[var(--accent-gold)]/30 focus:bg-white/[0.05] transition-all text-[#EFEFEF]"
        >
          {children}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-[#EFEFEF] group-focus-within:opacity-50 group-focus-within:text-[var(--accent-gold)] transition-all">
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
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
      {label && <span className="block mb-2.5 text-[10px] font-bold font-mono text-[#3C3C3C] uppercase tracking-[0.2em] ml-1">{label}</span>}
      <input 
        {...props} 
        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[16px] px-5 py-4 text-[14.5px] font-semibold focus:outline-none focus:border-[var(--accent-gold)]/30 focus:bg-white/[0.05] transition-all text-[#EFEFEF] placeholder:text-white/10" 
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
    <label className={cn("block", className)}>
      {label && <span className="block mb-2.5 text-[10px] font-bold font-mono text-[#3C3C3C] uppercase tracking-[0.2em] ml-1">{label}</span>}
      <textarea
        ref={ref}
        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[16px] px-5 py-4 text-[14.5px] font-semibold focus:outline-none focus:border-[var(--accent-gold)]/30 focus:bg-white/[0.05] transition-all leading-relaxed text-[#EFEFEF] placeholder:text-white/10 min-h-[100px] resize-none"
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
      {label && <span className="block mb-2.5 text-[10px] font-bold font-mono text-[#3C3C3C] uppercase tracking-[0.2em] ml-1">{label}</span>}
      <div className="flex items-center bg-white/[0.03] border border-white/[0.05] rounded-[16px] px-5 py-4 focus-within:border-[var(--accent-gold)]/30 focus-within:bg-white/[0.05] transition-all group">
        <span className="text-white/20 mr-3 text-[12px] font-bold tracking-tight font-mono group-focus-within:text-[var(--accent-gold)]/50 transition-colors">R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder || '0,00'}
          onChange={handleChange}
          disabled={disabled}
          className="w-full font-mono text-[18px] font-bold text-[#EFEFEF] focus:outline-none bg-transparent placeholder:text-white/5"
        />
      </div>
    </label>
  );
}

/**
 * Modal: Adaptive Command Drawer.
 * Refactored for absolute responsiveness & BICOLOR AUTHORITY (Phase 4H).
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
      className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4" 
      style={{ backgroundColor: "rgba(0,0,0,0.88)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }} 
      onClick={onClose}
    >
      <div 
        className={cn(
          "bg-[#0F0F0F] border border-white/[0.08] rounded-t-[32px] sm:rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,1)]",
          "w-full max-w-[430px] overflow-hidden relative flex flex-col",
          "animate-in fade-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 sm:zoom-in-95 duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
        )}
        style={{ maxHeight: "90vh" }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Cinematic Ambient Glow */}
        <div 
          className="absolute -top-[120px] -right-[120px] w-[300px] h-[300px] rounded-full pointer-events-none select-none opacity-40 z-0"
          style={{ background: 'radial-gradient(circle, rgba(var(--accent-gold-rgb),0.12) 0%, transparent 70%)' }}
        />

        {/* Mobile Pull Bar */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 relative z-10">
           <div className="w-12 h-1.5 rounded-full bg-white/[0.08]" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20 hover:text-white transition-colors z-20"
        >
          <CloseIcon size={16} />
        </button>

        <header className="px-8 pt-10 sm:pt-12 pb-6 text-center relative z-10">
           <span className="block mb-3 text-[9px] font-black font-mono text-[#4A4A4A] uppercase tracking-[0.35em]">COMANDO_OPERACIONAL</span>
           <h2 className="text-[24px] font-bold text-[#EFEFEF] tracking-tightest leading-tight">{title}</h2>
        </header>
        
        <div className="px-8 sm:px-10 py-2 text-[#808080] flex-1 overflow-y-auto scrollbar-none relative z-10 mb-2">
          {children}
        </div>
        
        <footer 
          className="p-8 sm:p-10 pt-6 flex flex-col gap-3 relative z-10 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F] to-transparent"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}
        >
          {onConfirm && (
            <PrimaryButton 
              onClick={onConfirm}
              tone={tone}
              className="w-full h-[60px] !rounded-[16px] !text-[12px] font-black uppercase tracking-[0.2em] shadow-[var(--shadow-primary)]"
            >
              {confirmLabel.toUpperCase()}
            </PrimaryButton>
          )}
          <DangerButton 
            onClick={onClose} 
            className="w-full h-[52px] !rounded-[14px] !text-[10px] font-bold uppercase tracking-[0.3em] font-mono"
          >
            {cancelLabel.toUpperCase()}
          </DangerButton>
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
