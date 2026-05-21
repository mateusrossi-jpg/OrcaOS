import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { CompactActionMenu, type CompactActionItem } from '../CompactActionMenu';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea';

type Tone = 'default' | 'brand' | 'success' | 'danger' | 'muted';


export function PageHeader({ title, description, eyebrow, action, className = '' }: { title: string; description?: string; eyebrow?: string; action?: ReactNode; className?: string }) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div>
        {eyebrow && <span className="orca-kicker">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
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
  const variantClass = 
    variant === 'primary' ? 'primary-action' : 
    variant === 'danger' ? 'danger-action' : 
    variant === 'secondary' ? 'secondary-action' :
    'ghost-action';
  return <button className={`${variantClass} ui-button ${className}`.trim()} type="button" {...props}>{children}</button>;
}

export function Select({
  label,
  value,
  onChange,
  children,
  className = '',
  helper,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  helper?: string;
}) {
  return (
    <label className={`aferix-select-field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <div className="select-wrapper">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
      </div>
      {helper && <small>{helper}</small>}
    </label>
  );
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

export function EmptyState({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <p className="empty-state-message">{message}</p>
      {children}
    </div>
  );
}

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
  useAutoResizeTextArea(ref, value);

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


export function PremiumCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`aferix-panel-card premium-card ${className}`.trim()}>{children}</section>;
}

export function BackCard({ label = 'Voltar', onClick }: { label?: string; onClick?: () => void }) {
  return <BackButton label={label} onClick={onClick} />;
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
    <label className={`general-form-field aferix-input-field ${className}`.trim()}>
      {label && <span>{label}</span>}
      <input {...props} />
      {helper && <small>{helper}</small>}
    </label>
  );
}

export function StatCard({ label, value, helper }: { label: string; value: ReactNode; helper?: ReactNode }) {
  return <MetricCard label={label} value={value} helper={helper} />;
}

export function ListItem({
  title,
  subtitle,
  value,
  action,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <article className={`continuous-list-item ${className}`.trim()}>
      <div className="client-col">
        <strong>{title}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
      {(value || action) && (
        <div className="value-col">
          {value}
          {action}
        </div>
      )}
    </article>
  );
}

export function FAB({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="aferix-fab" type="button" onClick={onClick} aria-label={label}>
      {label}
    </button>
  );
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`aferix-badge tone-${tone}`}>{children}</span>;
}

export function SectionTitle({ title, eyebrow, className = '' }: { title: string; eyebrow?: string; className?: string }) {
  return (
    <header className={`section-title ${className}`.trim()}>
      {eyebrow && <span className="orca-kicker">{eyebrow}</span>}
      <h2>{title}</h2>
    </header>
  );
}

export function PanelCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`aferix-panel-card ${className}`.trim()}>{children}</section>;
}
// ListCard foi consolidado com PanelCard, que serve como um componente Card genérico.
// Todos os usos de ListCard devem ser atualizados para PanelCard.

export function DangerButton(props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & { children: ReactNode }) {
  const { children, className = '', ...rest } = props;
  return <Button variant="danger" className={className} {...rest}>{children}</Button>;
}

export function StatusBadge({
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
  if (normalized === 'finalizado') return <Badge tone="success">🔒 Finalizado</Badge>;
  if (normalized === 'cancelado') return <Badge tone="danger">🔒 Cancelado</Badge>;
  if (normalized === 'recusado') return <Badge tone="danger">🔒 Recusado</Badge>;
  if (normalized === 'em_revisao') return <Badge tone="brand">● Em revisão</Badge>;
  if (normalized === 'enviado') return <Badge tone="brand">● Enviado</Badge>;
  if (normalized === 'autorizado') return <Badge tone="success">● Autorizado</Badge>;
  if (normalized === 'em_execucao') return <Badge tone="success">● Em execução</Badge>;
  if (normalized === 'iniciado') return <Badge tone="default">● Iniciado</Badge>;
  return <Badge tone="muted">● {status || 'Status'}</Badge>;
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
  return <CompactActionMenu items={items} label={label} align={align} />;
}


export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}

// Interface para o componente FilterChips
interface FilterChipsProps<T extends string> {
  items: Array<{ id: T; label: string }>;
  active: T[]; // Altera para permitir múltiplos ativos
  onChange: (active: T[]) => void;
  className?: string;
  ariaLabel?: string;
}

export function FilterChips<T extends string>({
  items,
  active,
  onChange,
  className = '',
  ariaLabel = 'Filtros',
}: FilterChipsProps<T>) {
  return (
    <div className={`filter-chips ${className}`.trim()} role="group" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`filter-chip ${active.includes(item.id) ? 'active' : ''}`}
          onClick={() => {
            if (active.includes(item.id)) {
              onChange(active.filter((id) => id !== item.id));
            } else {
              onChange([...active, item.id]);
            }
          }}
          aria-pressed={active.includes(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
