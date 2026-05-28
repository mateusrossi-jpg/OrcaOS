import React from 'react';
import { Budget } from '../../../domain/budget';
import { calculateBudget } from '../../../domain/aferixFinanceEngine';
import { formatCurrencyBRL, formatPercent } from '../../../utils/formatters';
import { operationalFacade } from '../../workflow/operationalFacade';
import { 
  Surface, 
  MoneyValue, 
  Badge, 
  SectionTitle, 
  Button, 
  ListCard, 
  ContextBanner 
} from '../../../app/components/ui';

interface BudgetSummaryViewProps {
  budget: Budget;
  onArchived?: () => void;
}

export const BudgetSummaryView: React.FC<BudgetSummaryViewProps> = ({ budget, onArchived }) => {
  const result = calculateBudget(budget);
  const isProfitable = result.lucroBruto > 0;
  
  const handleArchive = async () => {
    if (window.confirm('Deseja arquivar este orçamento? Ele sairá da sua lista de ativos.')) {
      await operationalFacade.archiveBudget(budget.id);
      onArchived?.();
    }
  };

  return (
    <div className="aferix-budget-summary-view aferix-d-flex aferix-flex-column aferix-gap-lg">
      <header className="aferix-text-center aferix-mb-md">
        <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--brand-primary)' }}>Missão Cumprida!</h2>
        <p className="aferix-text-muted">Veja o resumo do resultado alcançado neste projeto.</p>
      </header>

      {/* 1. Card Financeiro de Alto Impacto */}
      <Surface elevation={2} padding="lg" className="aferix-highlight-profit-card">
        <div className="aferix-d-flex aferix-justify-between aferix-align-start">
          <div className="aferix-d-flex aferix-flex-column">
            <span className="aferix-font-xs aferix-text-muted" style={{ fontWeight: 800, letterSpacing: '0.05em' }}>LUCRO LÍQUIDO REAL</span>
            <strong style={{ fontSize: '32px', color: isProfitable ? 'var(--status-success)' : 'var(--status-danger)' }}>
              {formatCurrencyBRL(result.lucroBruto)}
            </strong>
          </div>
          <Badge tone={isProfitable ? 'success' : 'danger'}>
            {formatPercent(result.marginPercent)}
          </Badge>
        </div>

        <div className="aferix-divider aferix-my-md" style={{ height: '1px', background: 'var(--border-soft)' }} />

        <div className="aferix-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <span className="aferix-d-block aferix-font-xs aferix-text-muted">FATURAMENTO</span>
            <strong className="aferix-font-md">{formatCurrencyBRL(result.totalComercial)}</strong>
          </div>
          <div>
            <span className="aferix-d-block aferix-font-xs aferix-text-muted">CUSTO TOTAL</span>
            <strong className="aferix-font-md" style={{ color: 'var(--status-danger)' }}>{formatCurrencyBRL(result.totalCost)}</strong>
          </div>
        </div>
      </Surface>

      {/* 2. Resumo Operacional */}
      <div className="aferix-operational-recap">
        <SectionTitle title="Resumo do Serviço" />
        <ListCard>
          {(budget.items || []).slice(0, 5).map((item) => (
            <div key={item.id} className="aferix-p-md aferix-d-flex aferix-justify-between aferix-align-center" style={{ borderBottom: '1px solid var(--border-dim)' }}>
              <div className="aferix-d-flex aferix-flex-column">
                <span className="aferix-font-sm" style={{ fontWeight: 600 }}>{item.description}</span>
                <small className="aferix-text-muted">{item.quantity} un x {formatCurrencyBRL(item.unitPrice)}</small>
              </div>
              <MoneyValue value={item.quantity * item.unitPrice} compact />
            </div>
          ))}
          {budget.items.length > 5 && (
            <div className="aferix-p-sm aferix-text-center">
              <small className="aferix-text-muted">e mais {budget.items.length - 5} itens...</small>
            </div>
          )}
        </ListCard>
      </div>

      {/* 3. Notas Finais */}
      {(budget.commercialNotes || budget.notes) && (
        <Surface elevation={1} padding="md">
          <SectionTitle title="Notas de Encerramento" />
          {budget.commercialNotes && (
            <div className="aferix-mb-sm">
              <span className="aferix-d-block aferix-font-xs aferix-text-muted">PROPOSTA</span>
              <p className="aferix-font-sm" style={{ margin: 0 }}>{budget.commercialNotes}</p>
            </div>
          )}
          {budget.notes && (
            <div>
              <span className="aferix-d-block aferix-font-xs aferix-text-muted">DIÁRIO DE OBRA</span>
              <p className="aferix-font-sm" style={{ margin: 0 }}>{budget.notes}</p>
            </div>
          )}
        </Surface>
      )}

      {/* 4. Ação Final */}
      <div className="aferix-mt-xl">
        <ContextBanner
          title="Tudo certo com este projeto?"
          meta="Ao arquivar, ele sairá da sua lista de operações ativas, mas continuará disponível no Histórico Total."
          icon="📦"
        />
        <Button 
          variant="secondary" 
          onClick={handleArchive}
          className="aferix-w-full aferix-mt-md"
          style={{ minHeight: '52px', fontWeight: 800 }}
        >
          Arquivar Orçamento
        </Button>
      </div>
    </div>
  );
};
