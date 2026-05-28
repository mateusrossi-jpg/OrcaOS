import React from 'react';
import { useBudgetHistory, type HistoryFilter } from '../hooks/useBudgetHistory';
import { calculateBudget } from '../domain/aferixFinanceEngine';
import {
  PageShell,
  PageHeader,
  Surface,
  StatusPill,
  MoneyValue,
  FilterChips,
  QueueEmptyState,
  ActionMenu,
  SearchInput,
} from '../app/components/ui';

interface BudgetHistoryPageProps {
  onOpenBudget: (id: string) => void;
  onNewBudget: () => void;
}

/**
 * BudgetHistoryPage: A Agenda e Histórico do profissional.
 * Total paridade com o Design Spec: Foco em Data e Status.
 */
export const BudgetHistoryPage: React.FC<BudgetHistoryPageProps> = ({ onOpenBudget, onNewBudget: _onNewBudget }) => {
  const { budgets, totalCount, isLoading, filter, setFilter, deleteBudget } = useBudgetHistory();
  const [query, setQuery] = React.useState('');

  const FILTER_CHIPS = [
    { id: 'todos', label: 'Todos' },
    { id: 'andamento', label: 'Ativos' },
    { id: 'finalizados', label: 'Histórico' },
  ];

  const filteredBudgets = React.useMemo(() => {
    const normalized = query.toLowerCase().trim();
    let list = budgets;
    if (normalized) {
      list = list.filter(b => 
        (b.title?.toLowerCase() || '').includes(normalized) || 
        (b.clientName?.toLowerCase() || '').includes(normalized)
      );
    }
    return list;
  }, [budgets, query]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir este registro definitivamente?')) {
      await deleteBudget(id);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date).toUpperCase();
    } catch {
      return '--/--';
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader title="Agenda" sourceLabel="Carregando registros..." />
      </PageShell>
    );
  }

  return (
    <div className="aferix-agenda-container" style={{ maxWidth: '440px', margin: '0 auto' }}>
      <PageHeader 
        title="Agenda" 
        sourceLabel={`${totalCount} atendimentos registrados.`}
      />

      <Surface elevation={1} padding="sm" className="history-search-panel aferix-d-flex aferix-flex-column aferix-gap-xs">
        <SearchInput
          placeholder="Título ou cliente..."
          value={query}
          onChange={setQuery}
        />
        <div className="aferix-filter-chips-wrapper">
          <FilterChips
            items={FILTER_CHIPS}
            active={[filter]}
            onChange={(active) => setFilter((active[0] as HistoryFilter) || 'todos')}
            ariaLabel="Filtrar agenda"
          />
        </div>
      </Surface>

      <div className="aferix-d-flex aferix-flex-column aferix-gap-md aferix-mt-lg">
        {filteredBudgets.length === 0 ? (
          <QueueEmptyState
            title={query ? "Sem resultados" : "Vazio"}
            meta={query ? "Tente outros termos." : "Seu histórico aparecerá aqui."}
          />
        ) : (
          filteredBudgets.map((budget) => {
            const totals = calculateBudget(budget);
            return (
              <Surface 
                key={budget.id} 
                elevation={1} 
                padding="md" 
                className="agenda-operational-card clickable"
                onClick={() => onOpenBudget(budget.id)}
              >
                <div className="aferix-d-flex aferix-gap-md aferix-align-center">
                  {/* Data Badge */}
                  <div className="agenda-date-badge aferix-d-flex aferix-flex-column aferix-align-center">
                    <span className="date-day">{formatDate(budget.updatedAt).split(' ')[0]}</span>
                    <span className="date-month">{formatDate(budget.updatedAt).split(' ')[1]?.replace('.', '')}</span>
                  </div>

                  {/* Body Content */}
                  <div className="agenda-card-body" style={{ flex: 1, minWidth: 0 }}>
                    <div className="aferix-d-flex aferix-justify-between aferix-align-center aferix-mb-xs">
                      <StatusPill status={budget.status} />
                      <strong className="tabular-nums" style={{ color: 'var(--brand-primary)', fontSize: '13px' }}>
                        <MoneyValue value={totals.totalComercial} compact />
                      </strong>
                    </div>
                    <strong className="aferix-d-block aferix-font-sm aferix-truncate" style={{ color: 'var(--text-primary)' }}>
                      {budget.title || 'Sem título'}
                    </strong>
                    <small className="aferix-text-muted aferix-d-block aferix-truncate">{budget.clientName || 'Cliente Avulso'}</small>
                  </div>

                  {/* Actions */}
                  <ActionMenu
                    label="…"
                    items={[
                      { id: 'open', label: 'Ver Detalhes', onSelect: () => onOpenBudget(budget.id) },
                      { id: 'delete', label: 'Excluir', tone: 'danger', onSelect: () => handleDelete(budget.id) },
                    ]}
                  />
                </div>
              </Surface>
            )
          })
        )}
      </div>

      <style>{`
        .agenda-date-badge {
          background: var(--bg-active);
          border-radius: var(--radius-sm);
          min-width: 44px;
          height: 48px;
          justify-content: center;
          border: 1px solid var(--border-soft);
        }
        .date-day {
          font-size: 16px;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1;
        }
        .date-month {
          font-size: 10px;
          font-weight: 800;
          color: var(--brand-primary);
          text-transform: uppercase;
        }
        .agenda-operational-card {
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .agenda-operational-card:hover {
          border-color: var(--brand-primary);
        }
        .agenda-operational-card:active {
          transform: scale(0.98);
        }
        .aferix-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};
