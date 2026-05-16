import type { ReactNode } from 'react';

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

export function MetricCard({
  label,
  value,
  trend,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  trend?: string;
  tone?: Tone;
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {trend && <small>{trend}</small>}
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

export function MoneyValue({ value, tone = 'default' }: { value: number; tone?: Tone }) {
  const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(value) ? value : 0);
  return <span className={`money-value tone-${tone}`}>{formatted}</span>;
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
  benefits,
  action,
  featured = false,
}: {
  badge: string;
  title: string;
  subtitle: string;
  price?: string;
  description?: string;
  benefits: string[];
  action?: ReactNode;
  featured?: boolean;
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
      <ul>
        {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
      </ul>
      {action}
    </article>
  );
}
