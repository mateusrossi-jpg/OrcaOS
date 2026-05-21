import { useMemo, useState } from 'react';
import { PageHeader, PageShell, Button, EmptyState, Select } from '../components/ui';
import { loadSavedBudgets, type SavedBudgetRecord } from '../../features/budgets/storage/savedBudgetsStorage';
import { calculateBudgetTotal } from '../../core/pricing/budget';
import type { Budget } from '../../core/types/business';

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function statusLabel(status: SavedBudgetRecord['status']): string {
  const labels: Record<SavedBudgetRecord['status'], string> = {
    iniciado: 'Orçamento iniciado',
    em_revisao: 'Em revisão',
    enviado: 'Enviado ao cliente',
    autorizado: 'Autorizado',
    em_execucao: 'Em execução',
    finalizado: 'Finalizado',
    recusado: 'Recusado',
    cancelado: 'Cancelado',
    draft: 'Orçamento iniciado',
    sent: 'Enviado ao cliente',
    approved: 'Autorizado',
    rejected: 'Recusado',
    expired: 'Recusado',
    cancelled: 'Cancelado',
  };
  return labels[status];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function budgetTotal(record: SavedBudgetRecord): number {
  const budget: Budget = {
    id: record.id,
    title: record.title,
    status: record.status,
    discount: record.discount,
    travelCost: record.travelCost,
    additionalFees: record.additionalFees,
    items: record.items,
  };
  try {
    return calculateBudgetTotal(budget);
  } catch {
    return 0;
  }
}

export function BudgetHistoryScreen({
  onOpenBudget,
  onNewBudget,
}: {
  onOpenBudget: (budgetId: string) => void;
  onNewBudget: () => void;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const budgets = useMemo(() => loadSavedBudgets(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return budgets.filter((record) => {
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesText = !q || [record.title, record.clientName, statusLabel(record.status), money(budgetTotal(record))]
        .join(' ')
        .toLowerCase()
        .includes(q);
      return matchesStatus && matchesText;
    });
  }, [budgets, query, statusFilter]);

  return (
    <PageShell className="wide-screen">
      <PageHeader
        title="Histórico de Orçamentos"
        description="Consulte, filtre e reabra orçamentos salvos."
        action={<Button variant="primary" className="full-page-cta" onClick={onNewBudget}>Novo orçamento</Button>}
      />

      <div className="aferix-panel-card" style={{ display: 'grid', gap: 12 }}>
        <input
          value={query}
          placeholder="Buscar por cliente, título ou valor..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select label="Filtrar por status" value={statusFilter} onChange={setStatusFilter}>
          <option value="all">Todos</option>
          <option value="iniciado">Orçamento iniciado</option>
          <option value="em_revisao">Em revisão</option>
          <option value="enviado">Enviado ao cliente</option>
          <option value="autorizado">Autorizado</option>
          <option value="em_execucao">Em execução</option>
          <option value="finalizado">Finalizado</option>
          <option value="recusado">Recusado</option>
          <option value="cancelado">Cancelado</option>
        </Select>
      </div>

      <section className="aferix-panel-card">
        <div className="continuous-list">
          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhum orçamento encontrado"
              description="Ajuste os filtros ou crie um novo orçamento."
            />
          ) : (
            filtered.map((record) => (
              <article className="continuous-list-item" key={record.id}>
                <div className="client-col">
                  <strong>{record.title || 'Orçamento sem título'}</strong>
                  <small>{record.clientName || 'Cliente final'} · {statusLabel(record.status)} · {formatDate(record.updatedAt)}</small>
                </div>
                <div className="value-col">
                  <strong>{money(budgetTotal(record))}</strong>
                </div>
                <div className="finance-record-actions">
                  <Button variant="secondary" className="compact-row-action" onClick={() => onOpenBudget(record.id)}>Abrir</Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </PageShell>
  );
}
