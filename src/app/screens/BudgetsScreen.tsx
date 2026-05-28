import React from 'react';
import { useBudgetHistory } from '../../hooks/useBudgetHistory';
import { calculateBudget } from '../../domain/aferixFinanceEngine';
import { 
  PageShell, 
  PageHeader, 
  Surface, 
  StatusPill, 
  MoneyValue,
  QueueEmptyState,
  PrimaryButton
} from '../components/ui';
import type { Budget } from '../../domain/budget';

interface BudgetsScreenProps {
  onSelectBudget: (budget: Budget) => void;
  onNewBudget: () => void;
}

/**
 * BudgetsScreen: O Pipeline de Orçamentos Ativos.
 * Total paridade visual com o Design Spec (Section 4.3).
 */
export function BudgetsScreen({ onSelectBudget, onNewBudget }: BudgetsScreenProps) {
  const { budgets, isLoading } = useBudgetHistory();

  // Operação foca apenas em itens que ainda não foram concluídos/cancelados
  const activeBudgets = (budgets || []).filter(b => 
    !['finalizado', 'arquivado', 'cancelado', 'recusado'].includes(b.status)
  );

  if (isLoading) {
    return <PageShell><PageHeader title="Operação" sourceLabel="Carregando pipeline..." /></PageShell>;
  }

  return (
    <div className="aferix-pipeline-container" style={{ maxWidth: '440px', margin: '0 auto' }}>
      <PageHeader 
        title="Operação" 
        sourceLabel="Pipeline de serviços ativos"
        action={
          <PrimaryButton onClick={onNewBudget} style={{ borderRadius: 'var(--radius-pill)', padding: '0 var(--sz-lg)' }}>
            + Novo
          </PrimaryButton>
        }
      />

      <div className="aferix-d-flex aferix-flex-column aferix-gap-md aferix-mt-lg">
        {activeBudgets.length === 0 ? (
          <QueueEmptyState 
            title="Pipeline Vazio" 
            meta="Inicie um novo orçamento para vê-lo aparecer aqui." 
          />
        ) : (
          activeBudgets.map(budget => {
            const totals = calculateBudget(budget);
            return (
              <Surface 
                key={budget.id} 
                elevation={1} 
                padding="md" 
                className="budget-pipeline-card clickable"
                onClick={() => onSelectBudget(budget)}
              >
                <header className="aferix-d-flex aferix-justify-between aferix-align-start aferix-mb-sm">
                  <StatusPill status={budget.status} />
                  <strong className="tabular-nums" style={{ color: 'var(--brand-primary)' }}>
                    <MoneyValue value={totals.totalComercial} compact />
                  </strong>
                </header>
                <div className="budget-card-body">
                  <strong className="aferix-d-block aferix-font-md" style={{ letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                    {budget.title || 'Sem título'}
                  </strong>
                  <small className="aferix-text-muted">{budget.clientName || 'Cliente Avulso'}</small>
                </div>
              </Surface>
            )
          })
        )}
      </div>

      <style>{`
        .budget-pipeline-card {
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .budget-pipeline-card:hover {
          border-color: var(--brand-primary);
        }
        .budget-pipeline-card:active {
          transform: scale(0.98);
        }
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
