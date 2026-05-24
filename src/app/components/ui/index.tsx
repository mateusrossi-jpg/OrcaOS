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
  description, 
  eyebrow, 
  action, 
  className = '' 
}: { 
  title: string; 
  description?: string; 
  eyebrow?: string; 
  action?: ReactNode; 
  className?: string 
}) {
  return (
    <header className={`page-header screen-header ${className}`.trim()}>
      <div className="header-content">
        {eyebrow && <span className="aferix-kicker">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p className="header-description">{description}</p>}
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
 * PanelCard: Componente de card padronizado.
 */
export function PanelCard({ children, className = '', ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLElement>) {
  return <section className={`aferix-panel-card ${className}`.trim()} {...props}>{children}</section>;
}

/**
 * ListCard: Especialização de PanelCard para listas.
 */
export function ListCard({ 
  title, 
  subtitle, 
  children, 
  action, 
  className = '',
  ...props
}: { 
  title?: string; 
  subtitle?: string; 
  children: ReactNode; 
  action?: ReactNode; 
  className?: string;
} & HTMLAttributes<HTMLElement>) {
  return (
    <PanelCard className={`list-card ${className}`.trim()} {...props}>
      {(title || action) && (
        <header className="card-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action && <div className="card-header-action">{action}</div>}
        </header>
      )}
      <div className="continuous-list">
        {children}
      </div>
    </PanelCard>
  );
}

/**
 * ListItem: Item de lista compacto e padronizado.
 */
export const ListItem = memo(function ListItem({
  title,
  subtitle,
  value,
  status,
  action,
  onClick,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  status?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <article 
      className={`continuous-list-item ${onClick ? 'clickable-row' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      <div className="client-col">
        <strong>{title}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <div className="value-col">
        {status && <div className="status-wrapper">{status}</div>}
        {value && <div className="value-wrapper">{value}</div>}
        {action && <div className="action-wrapper">{action}</div>}
      </div>
    </article>
  );
});

/**
 * MetricCard: Card de métrica padronizado.
 */
export const MetricCard = memo(function MetricCard({
  label,
  value,
  helper,
  trend,
  tone = 'default',
  featured = false,
  className = '',
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  trend?: ReactNode;
  tone?: Tone;
  featured?: boolean;
  className?: string;
}) {
  return (
    <article className={`metric-card tone-${tone}${featured ? ' featured' : ''} ${className}`.trim()}>
      <span>{label}</span>
      <strong>{value}</strong>
      {(helper || trend) && <small>{helper ?? trend}</small>}
    </article>
  );
});

/**
 * StatusBadge: Badge de status com suporte a ícones de cadeado.
 */
export const StatusBadge = memo(function StatusBadge({
  status,
  children,
  tone = 'default',
}: {
  status?: string;
  children?: ReactNode;
  tone?: Tone;
}) {
  if (children) return <Badge tone={tone}>{children}</Badge>;

  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'finalizado') 
    return <Badge tone="success">🔒 Finalizado</Badge>;
  if (normalized === 'cancelado') 
    return <Badge tone="danger">🔒 Cancelado</Badge>;
  if (normalized === 'recusado') 
    return <Badge tone="danger">🔒 Recusado</Badge>;
  if (normalized === 'em_revisao') 
    return <Badge tone="brand">● Em revisão</Badge>;
  if (normalized === 'enviado') 
    return <Badge tone="brand">● Enviado</Badge>;
  if (normalized === 'autorizado') 
    return <Badge tone="success">● Autorizado</Badge>;
  if (normalized === 'em_execucao') 
    return <Badge tone="success">● Em execução</Badge>;
  if (normalized === 'iniciado') 
    return <Badge tone="default">● Iniciado</Badge>;
  
  return <Badge tone="muted">● {status || 'Status'}</Badge>;
});

export const Badge = memo(function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`aferix-badge tone-${tone}`}>{children}</span>;
});

/**
 * EmptyState: Estado vazio discreto e centralizado.
 */
export function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  className = '' 
}: { 
  title: string; 
  description?: string; 
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`premium-empty-state ${className}`.trim()}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

/**
 * Outros componentes auxiliares padronizados.
 */
export function BackButton({ 
  label = 'Voltar', 
  onClick, 
  to 
}: { 
  label?: string; 
  onClick?: () => void; 
  to?: string; 
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
  helper,
  disabled = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  helper?: string;
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
      {helper && <small>{helper}</small>}
    </label>
  );
}

export function Input({
  label,
  className = '',
  helper,
  ...props
}: {
  label?: string;
  helper?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`aferix-input-field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <input {...props} />
      {helper && <small>{helper}</small>}
    </label>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  label,
  helper,
  rows = 1,
  className = '',
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  helper?: string;
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
      {helper && <small>{helper}</small>}
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
  description,
  action,
  className = '' 
}: { 
  title: string; 
  eyebrow?: string; 
  description?: string;
  action?: ReactNode;
  className?: string 
}) {
  return (
    <header className={`section-title ${className}`.trim()}>
      <div className="section-title-main">
        {eyebrow && <span className="aferix-kicker">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action && <div className="section-title-action">{action}</div>}
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
  subtitle,
  price,
  description,
  benefits = [],
  featured = false,
  action,
  className = '',
}: {
  badge: string;
  title: string;
  subtitle: string;
  price?: string;
  description?: string;
  benefits?: string[];
  featured?: boolean;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <PanelCard className={`plan-card ${featured ? 'featured' : ''} ${className}`.trim()}>
      {badge && <Badge tone={featured ? 'brand' : 'default'}>{badge}</Badge>}
      <header className="plan-card-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      {price && <strong className="plan-card-price">{price}</strong>}
      {description && <p className="plan-card-description">{description}</p>}
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
      {action && <div className="plan-card-action">{action}</div>}
    </PanelCard>
  );
}

// Componentes legados ou renomeados para compatibilidade
export function SectionHeader(props: { title: string; eyebrow?: string; className?: string }) {
  return <SectionTitle {...props} />;
}

export function InfoCard({ title, description, action, className = '' }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <PanelCard className={`info-card ${className}`.trim()}>
      <div className="info-card-content">
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </div>
      {action && <div className="info-card-action">{action}</div>}
    </PanelCard>
  );
}

export function PremiumCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <PanelCard className={`premium-card ${className}`.trim()}>{children}</PanelCard>;
}

export function ContextBanner({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <aside className="context-banner aferix-panel-card">
      {icon && <span className="context-banner-icon">{icon}</span>}
      <div className="context-banner-content">
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      {actionLabel && <Button className="context-banner-action" onClick={onAction}>{actionLabel}</Button>}
    </aside>
  );
}


export { PageShell };
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
