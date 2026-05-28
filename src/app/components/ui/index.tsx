import { useEffect, useRef, memo, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { CompactActionMenu, type CompactActionItem } from '../CompactActionMenu';
import { MobileActionMenu } from './MobileActionMenu';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea';
import { PageShell } from '../PageShell';

type Tone = 'default' | 'brand' | 'success' | 'danger' | 'muted';

/**
 * PageHeader: título principal da tela, descrição e ação primária.
 */
export function PageHeader({ 
  title, 
  sourceLabel, 
  action, 
  className = '' 
}: { 
  title: string; 
  sourceLabel?: string; 
  action?: ReactNode; 
  className?: string 
}) {
  return (
    <header className={`page-header screen-header ${className}`.trim()}>
      <div className="header-content">
        <h1>{title}</h1>
        {sourceLabel && <span className="page-header-caption">{sourceLabel}</span>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}

/**
 * Componente de botão base.
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
  const variantClass = 
    variant === 'primary' ? 'primary-action' : 
    variant === 'danger' ? 'danger-action' : 
    variant === 'secondary' ? 'secondary-action' :
    'ghost-action';
  return (
    <button 
      className={`${variantClass} ui-button ${className}`.trim()} 
      type="button" 
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { children: ReactNode }) {
  const { children, className = '', ...rest } = props;
  return <Button variant="primary" className={`full-page-cta ${className}`.trim()} {...rest}>{children}</Button>;
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
 * Surface: Componente de base para layout com suporte a elevação e padding semântico.
 */
export function Surface({ 
  children, 
  className = '', 
  elevation = 1, 
  padding = 'md',
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  elevation?: 0 | 1 | 2;
  padding?: 'none' | 'sm' | 'md' | 'lg';
} & HTMLAttributes<HTMLElement>) {
  const elevationClass = `elevation-${elevation}`;
  const paddingClass = padding !== 'none' ? `p-${padding}` : '';
  
  return (
    <section 
      className={`aferix-surface ${elevationClass} ${paddingClass} ${className}`.trim()} 
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * ListCard: Especialização de Surface para listas.
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
    <Surface elevation={1} padding="none" className={`list-card ${className}`.trim()} {...props}>
      {(title || action) && (
        <header className="card-header" style={{ padding: 'var(--sz-md)' }}>
          <div>
            {title && <h3>{title}</h3>}
          </div>
          {action && <div className="card-header-action">{action}</div>}
        </header>
      )}
      <div className="continuous-list">
        {children}
      </div>
    </Surface>
  );
}

/**
 * ListItem: Item de lista compacto e padronizado.
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
      className={`operational-card ${onClick ? 'clickable-row' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      <div className="operational-card-main">
        <div className="operational-card-left">
          <strong className="operational-card-title">{title}</strong>
          {context && <small className="operational-card-meta">{context}</small>}
        </div>
        
        {(value || action) && (
          <div className="operational-card-right">
            {value && <div className="operational-card-value">{value}</div>}
            {action && <div className="operational-card-action">{action}</div>}
          </div>
        )}
      </div>

      {status && (
        <div className="operational-card-status-row">
          {status}
        </div>
      )}
    </article>
  );
});

/**
 * MetricCard: Card de métrica secundário.
 */
export const MetricCard = memo(function MetricCard({
  label,
  value,
  tone = 'default',
  featured = false,
  className = '',
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Surface 
      elevation={featured ? 1 : 0} 
      padding="md" 
      className={`aferix-metric-card tone-${tone}${featured ? ' featured' : ''} ${className}`.trim()}
      style={{ background: featured ? 'var(--bg-surface)' : 'var(--bg-active)' }}
    >
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
    </Surface>
  );
});

/**
 * StatusBadge: Badge de status com suporte a ícones de cadeado.
 */
export const StatusBadge = memo(function StatusBadge({
  status,
  children,
  tone = 'default',
  syncStatus,
}: {
  status?: string;
  children?: ReactNode;
  tone?: Tone;
  syncStatus?: 'synced' | 'pending' | 'deleted';
}) {
  if (children) return <Badge tone={tone}>{children}</Badge>;

  const normalized = (status ?? '').toLowerCase().replace(' ', '_');
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1).replace('_', ' ');

  let icon = '●';
  if (['finalizado', 'cancelado', 'recusado', 'arquivado'].includes(normalized)) {
    icon = '🔒';
  }

  return (
    <div className="aferix-status-group aferix-d-flex aferix-align-center aferix-gap-xs">
      <Badge 
        tone={tone} 
        className={`status-badge status-${normalized}`}
      >
        {icon} {label}
      </Badge>
      {syncStatus === 'synced' && <span title="Sincronizado na Nuvem" style={{ fontSize: '14px', color: 'var(--aferix-success)', opacity: 0.8 }}>☁️</span>}
      {syncStatus === 'pending' && <span title="Aguardando Sincronismo" style={{ fontSize: '14px', color: 'var(--aferix-warning)', opacity: 0.6 }}>☁️</span>}
    </div>
  );
});

export const Badge = memo(function Badge({ children, tone = 'default', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={`aferix-badge tone-${tone} ${className}`.trim()}>{children}</span>;
});

/**
 * StatusPill: Versão premium e compacta do status do orçamento.
 * Implements AFERIX_DESIGN_SPEC.md - Section 4.3
 */
export const StatusPill = memo(function StatusPill({ 
  status 
}: { 
  status: string 
}) {
  const normalized = (status ?? '').toLowerCase().replace(' ', '_');
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1).replace('_', ' ');

  let tone: Tone = 'default';
  if (normalized === 'finalizado') tone = 'success';
  if (['em_execucao', 'autorizado', 'enviado'].includes(normalized)) tone = 'brand';
  if (['cancelado', 'recusado'].includes(normalized)) tone = 'danger';

  return (
    <span className={`aferix-status-pill tone-${tone}`}>
      {label}
    </span>
  );
});

/**
 * QueueEmptyState: Estado vazio discreto e centralizado.
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
    <div className={`premium-empty-state ${className}`.trim()}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <strong>{title}</strong>
      {meta && <small className="empty-state-meta">{meta}</small>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

/**
 * Outros componentes auxiliares padronizados.
 */
export function BackButton({ 
  label = 'Voltar', 
  onClick 
}: { 
  label?: string; 
  onClick?: () => void; 
}) {
  return (
    <button 
      className="aferix-back-button-card" 
      type="button" 
      onClick={onClick}
    >
      <span className="back-icon">‹</span>
      <span className="back-label">{label}</span>
    </button>
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
    <div className={`search-input-wrapper ${className}`.trim()}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="aferix-search-input"
        disabled={disabled}
      />
    </div>
  );
}

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
    <div className={`filter-chips ${className}`.trim()} role="group" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`filter-chip ${selected.includes(item.id) ? 'active' : ''}`}
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

export function Select({
  label,
  value,
  onChange,
  children,
  className = '',
  operationalHint,
  disabled = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  operationalHint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`aferix-select-field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <div className="select-wrapper">
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          {children}
        </select>
      </div>
      {operationalHint && <small>{operationalHint}</small>}
    </label>
  );
}

export function Input({
  label,
  className = '',
  operationalHint,
  ...props
}: {
  label?: string;
  operationalHint?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`aferix-input-field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <input {...props} />
      {operationalHint && <small>{operationalHint}</small>}
    </label>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  label,
  operationalHint,
  rows = 1,
  className = '',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  operationalHint?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextArea(ref, value);

  return (
    <label className={`aferix-input-field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <textarea
        ref={ref}
        className="aferix-textarea"
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {operationalHint && <small>{operationalHint}</small>}
    </label>
  );
}

export const MoneyValue = memo(function MoneyValue({ value, tone = 'default', compact = false }: { value: number; tone?: Tone; compact?: boolean }) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);

  return <span className={`money-value tone-${tone}${compact ? ' compact' : ''}`}>{formatted}</span>;
});

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
    <label className={`monetary-input-field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <div className="monetary-input-wrapper">
        <span className="currency-prefix">R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder || '0,00'}
          onChange={handleChange}
          disabled={disabled}
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

    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="aferix-modal-overlay" onClick={onClose}>
      <div className="aferix-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="aferix-modal-header">
          <h2>{title}</h2>
        </header>
        <div className="aferix-modal-body">
          {children}
        </div>
        <footer className="aferix-modal-footer">
          <SecondaryButton onClick={onClose}>{cancelLabel}</SecondaryButton>
          {onConfirm && (
            <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}

export function SectionTitle({ 
  title, 
  eyebrow,
  action,
  className = '' 
}: { 
  title: string; 
  eyebrow?: string;
  action?: ReactNode;
  className?: string 
}) {
  return (
    <header className={`aferix-section-header ${className}`.trim()}>
      <div className="aferix-d-flex aferix-flex-column">
        {eyebrow && <span className="aferix-eyebrow">{eyebrow}</span>}
        <h3 className="aferix-h3">{title}</h3>
      </div>
      {action && <div className="aferix-action-slot">{action}</div>}
    </header>
  );
}

export function FAB({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="aferix-fab" type="button" onClick={onClick} aria-label={label}>
      {label}
    </button>
  );
}

export function PlanCard({
  badge,
  title,
  price,
  benefits = [],
  featured = false,
  action,
  className = '',
}: {
  badge: string;
  title: string;
  price?: string;
  benefits?: string[];
  featured?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Surface elevation={1} padding="md" className={`plan-card ${featured ? 'featured' : ''} ${className}`.trim()}>
      {badge && <Badge tone={featured ? 'brand' : 'default'}>{badge}</Badge>}
      <header className="plan-card-heading">
        <h2>{title}</h2>
      </header>
      {price && <strong className="plan-card-price">{price}</strong>}
      <div className="plan-card-benefits">
      {benefits.length > 0 && (
        <ul>
          {benefits.map((benefit) => (
            <li key={benefit}>
              <span className="benefit-check">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      )}
      </div>
      {action && <div className="plan-card-action">{action}</div>}
    </Surface>
  );
}

// Componentes legados ou renomeados para compatibilidade
export function SectionHeader(props: { title: string; eyebrow?: string; className?: string }) {
  return <SectionTitle {...props} />;
}

export function MetricPanel({ title, meta, action, className = '' }: { title: string; meta?: string; action?: ReactNode; className?: string }) {
  return (
    <Surface elevation={1} padding="md" className={`info-card ${className}`.trim()}>
      <div className="info-card-content">
        <strong>{title}</strong>
        {meta && <small>{meta}</small>}
      </div>
      {action && <div className="info-card-action">{action}</div>}
    </Surface>
  );
}

export function PremiumCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <Surface elevation={1} padding="md" className={`premium-card ${className}`.trim()}>{children}</Surface>;
}

export function ContextBanner({
  title,
  meta,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  meta: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <aside className="context-banner aferix-surface elevation-1 p-md">
      {icon && <span className="context-banner-icon">{icon}</span>}
      <div className="context-banner-content">
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      {actionLabel && <Button className="context-banner-action" onClick={onAction}>{actionLabel}</Button>}
    </aside>
  );
}


export { PageShell };
export { KpiCard } from './KpiCard';
export { ConfirmModal } from './ConfirmModal';

export function AferixTabs<T extends string>({
  items,
  activeId,
  onChange,
  variant = "pill",
  className = "",
}: {
  items: Array<{ id: T; label: string }>;
  activeId: T;
  onChange: (id: T) => void;
  variant?: "pill" | "line";
  className?: string;
}) {
  return (
    <div className={`aferix-tabs aferix-tabs-${variant} ${className}`.trim()} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeId === item.id}
          className={activeId === item.id ? "active" : ""}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
