import React from 'react';
import { useBudgetHistory, type HistoryFilter } from '../hooks/useBudgetHistory';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import {
  PageShell,
  PageHeader,
  PanelCard,
  ListCard,
  ListItem,
  StatusBadge,
  MoneyValue,
  PrimaryButton,
  FilterChips,
  QueueEmptyState,
} from '../app/components/ui';

interface BudgetHistoryPageProps {
  onOpenBudget: (id: string) => void;
  onNewBudget: () => void;
}

export const BudgetHistoryPage: React.FC<BudgetHistoryPageProps> = ({ onOpenBudget, onNewBudget }) => {
  const { budgets, totalCount, isLoading, filter, setFilter, deleteBudget } = useBudgetHistory();

  const FILTER_CHIPS = [
    { id: 'todos', label: 'Todos' },
    { id: 'andamento', label: 'Em andamento' },
    { id: 'finalizados', label: 'Finalizados' },
  ];

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      await deleteBudget(id);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="Histórico" />
        <div className="empty-state-card">
          <strong>Carregando histórico...</strong>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className="aferix-history-screen">
      <PageHeader 
        title="Histórico" 
        sourceLabel={`${totalCount} orçamentos`}
        action={
          <PrimaryButton onClick={onNewBudget}>
            + Novo
          </PrimaryButton>
        }
      />

      <PanelCard className="history-filter-area aferix-mb-lg">
        <FilterChips
          items={FILTER_CHIPS}
          active={[filter]}
          onChange={(active) => setFilter((active[0] as HistoryFilter) || 'todos')}
          ariaLabel="Filtrar orçamentos"
        />
      </PanelCard>

      {budgets.length === 0 ? (
        <QueueEmptyState
          title="Nenhum orçamento"
          meta={filter === 'todos' ? "Crie seu primeiro orçamento para começar." : "Nenhum orçamento encontrado para este filtro."}
          action={filter === 'todos' ? <PrimaryButton onClick={onNewBudget}>Criar orçamento</PrimaryButton> : null}
        />
      ) : (
        <ListCard>
          {budgets.map((budget) => (
            <ListItem
              key={budget.id}
              onClick={() => onOpenBudget(budget.id)}
              title={budget.title || 'Sem título'}
              context={budget.clientName || 'Cliente não informado'}
              status={<StatusBadge status={budget.status} />}
              value={<MoneyValue value={calculateBudget(budget).totalComercial} compact />}
              action={
                <button 
                  className="ghost-action aferix-p-sm" 
                  onClick={(e) => handleDelete(e, budget.id)}
                  title="Excluir"
                >
                  Excluir
                </button>
              }
            />
          ))}
        </ListCard>
      )}
    </PageShell>
  );
};
