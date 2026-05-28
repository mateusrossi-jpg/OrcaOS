import React, { memo, type ReactNode } from 'react';
import { Surface, MoneyValue, Badge } from './index';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  featured?: boolean;
  className?: string;
}

/**
 * KpiCard: Componente de alto impacto para métricas operacionais e financeiras.
 * Implements AFERIX_DESIGN_SPEC.md - Section 4.5
 */
export const KpiCard = memo(function KpiCard({
  label,
  value,
  trend,
  featured = false,
  className = '',
}: KpiCardProps) {
  return (
    <Surface 
      elevation={featured ? 2 : 1} 
      padding="lg" 
      className={`aferix-kpi-card ${featured ? 'featured' : ''} ${className}`.trim()}
    >
      <header className="kpi-header">
        <span className="kpi-label">{label}</span>
      </header>
      
      <main className="kpi-body">
        <div className="kpi-value">
          {typeof value === 'number' ? <MoneyValue value={value} /> : value}
        </div>
      </main>

      {trend && (
        <footer className="kpi-footer">
          <Badge tone={trend.isPositive ? 'success' : 'danger'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </Badge>
          {trend.label && <span className="trend-label">{trend.label}</span>}
        </footer>
      )}

      <style>{`
        .aferix-kpi-card {
          display: flex;
          flex-direction: column;
          gap: var(--sz-sm);
          min-height: 120px;
          justify-content: space-between;
          transition: transform 0.2s ease;
        }

        .aferix-kpi-card:active {
          transform: scale(0.98);
        }

        .kpi-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .kpi-value {
          font-size: 28px;
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .featured .kpi-value {
          color: var(--brand-primary);
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          gap: var(--sz-sm);
          margin-top: var(--sz-xs);
        }

        .trend-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }
      `}</style>
    </Surface>
  );
});
