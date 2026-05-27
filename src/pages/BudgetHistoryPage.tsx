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
  ActionMenu,
  SearchInput,
} from '../app/components/ui';

interface BudgetHistoryPageProps {
  onOpenBudget: (id: string) => void;
  onNewBudget: () => void;
}

export const BudgetHistoryPage: React.FC<BudgetHistoryPageProps> = ({ onOpenBudget, onNewBudget }) => {
  const { budgets, totalCount, isLoading, filter, setFilter, deleteBudget } = useBudgetHistory();
  const [query, setQuery] = React.useState('');

  const FILTER_CHIPS = [
    { id: 'todos', label: 'Todos' },
    { id: 'andamento', label: 'Em andamento' },
    { id: 'finalizados', label: 'Finalizados' },
  ];

  const filteredBudgets = React.useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return budgets;
    return budgets.filter(b => 
      (b.title?.toLowerCase() || '').includes(normalized) || 
      (b.clientName?.toLowerCase() || '').includes(normalized)
    );
  }, [budgets, query]);

  const handleDelete = async (id: string) => {
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
        sourceLabel={`${totalCount} orçamentos registrados.`}
      />

      <PanelCard className="history-search-panel aferix-d-flex aferix-flex-column aferix-gap-sm">
        <SearchInput
          placeholder="Buscar título ou cliente..."
          value={query}
          onChange={setQuery}
        />
        <div className="aferix-filter-chips-wrapper">
          <FilterChips
            items={FILTER_CHIPS}
            active={[filter]}
            onChange={(active) => setFilter((active[0] as HistoryFilter) || 'todos')}
            ariaLabel="Filtrar orçamentos"
          />
        </div>
      </PanelCard>

      {filteredBudgets.length === 0 ? (
        <QueueEmptyState
          title={query ? "Nenhum resultado encontrado" : "Histórico vazio"}
          meta={query ? "Tente buscar com outros termos." : "Seus orçamentos salvos e finalizados aparecerão aqui."}
          action={!query && filter === 'todos' ? <PrimaryButton onClick={onNewBudget}>Criar orçamento</PrimaryButton> : null}
        />
      ) : (
        <ListCard>
          {filteredBudgets.map((budget) => (
            <ListItem
              key={budget.id}
              onClick={() => onOpenBudget(budget.id)}
              title={budget.title || 'Sem título'}
              context={budget.clientName || 'Cliente não informado'}
              status={<StatusBadge status={budget.status} />}
              value={<MoneyValue value={calculateBudget(budget).totalComercial} compact />}
              action={
                <ActionMenu
                  label="Ações"
                  items={[
                    { id: 'open', label: 'Abrir Orçamento', onSelect: () => onOpenBudget(budget.id) },
                    { id: 'delete', label: 'Excluir', tone: 'danger', onSelect: () => handleDelete(budget.id) },
                  ]}
                />
              }
            />
          ))}
        </ListCard>
      )}
    </PageShell>
  );
};
