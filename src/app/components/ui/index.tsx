import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea';

type Tone = 'default' | 'brand' | 'success' | 'danger' | 'muted';

export function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`app-screen page-shell ${className}`.trim()}>{children}</section>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="screen-header page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}

export function SectionHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: ReactNode }) {
  return (
    <header className="section-header">
      <div>
        {eyebrow && <span className="orca-kicker">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </header>
  );
}

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
  const variantClass = variant === 'primary' ? 'primary-action' : variant === 'danger' ? 'danger-action' : 'ghost-action';
  return <button className={`${variantClass} ui-button ${className}`.trim()} type="button" {...props}>{children}</button>;
}

export function MetricCard({
  label,
  value,
  helper,
  trend,
  tone = 'default',
  featured = false,
}: {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  trend?: ReactNode;
  tone?: Tone;
  featured?: boolean;
}) {
  return (
    <article className={`metric-card tone-${tone}${featured ? ' featured' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {(helper || trend) && <small>{helper ?? trend}</small>}
    </article>
  );
}

export function InfoCard({ title, description, action, className = '' }: { title: string; description?: string; action?: ReactNode; className?: string }) {
  return (
    <article className={`info-card ${className}`.trim()}>
      <div>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </div>
      {action}
    </article>
  );
}

export function NoticeBox({ title, children, tone = 'brand' }: { title: string; children: ReactNode; tone?: Tone }) {
  return (
    <aside className={`notice-box tone-${tone}`}>
      <strong>{title}</strong>
      <p>{children}</p>
    </aside>
  );
}

export function MoneyValue({ value, tone = 'default', compact = false }: { value: number; tone?: Tone; compact?: boolean }) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(Number.isFinite(value) ? value : 0);

  return <span className={`money-value tone-${tone}${compact ? ' compact' : ''}`}>{formatted}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="empty-state-card compact-empty-state">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
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
  actionLabel,
  onAction,
  action,
}: {
  badge: string;
  title: string;
  subtitle: string;
  price?: string;
  description?: string;
  benefits?: string[];
  featured?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
}) {
  return (
    <article className={featured ? 'plan-card featured' : 'plan-card'}>
      <span className="plan-card-badge">{badge}</span>
      <div className="plan-card-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {price && <strong className="plan-card-price">{price}</strong>}
      {description && <small className="plan-card-description">{description}</small>}
      {benefits.length > 0 && (
        <ul>
          {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
        </ul>
      )}
      {action ?? (actionLabel && <Button variant={featured ? 'primary' : 'secondary'} onClick={onAction}>{actionLabel}</Button>)}
    </article>
  );
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
    <aside className="context-banner">
      {icon && <span className="context-banner-icon">{icon}</span>}
      <div className="context-banner-content">
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      {actionLabel && <Button className="context-banner-action" onClick={onAction}>{actionLabel}</Button>}
    </aside>
  );
}

export function AferixTabs<T extends string>({
  items,
  activeId,
  onChange,
  variant = 'underline',
}: {
  items: Array<{ id: T; label: string }>;
  activeId: T;
  onChange: (id: T) => void;
  variant?: 'underline' | 'pill';
}) {
  return (
    <div className={`aferix-tabs aferix-tabs-${variant}`} role="tablist">
      {items.map((item) => (
        <button
          aria-selected={activeId === item.id}
          className={activeId === item.id ? 'active' : ''}
          key={item.id}
          role="tab"
          type="button"
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
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
          <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
          {onConfirm && (
            <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
              {confirmLabel}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 1,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoResizeTextArea(ref.current, value);

  return (
    <textarea
      ref={ref}
      className={`aferix-textarea ${className}`.trim()}
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      style={{ overflow: 'hidden', resize: 'none' }}
    />
  );
}

export function MonetaryInput({
  value,
  onChange,
  placeholder,
  label,
  className = '',
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  className?: string;
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
    <label className={`budget-field monetary-input-field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <div className="monetary-input-wrapper">
        <span className="currency-prefix">R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          placeholder={placeholder || '0,00'}
          onChange={handleChange}
        />
      </div>
    </label>
  );
}
