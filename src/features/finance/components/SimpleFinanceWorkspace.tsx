import { useMemo, useState } from 'react';
import { 
  MetricCard, 
  MoneyValue, 
  EmptyState, 
  Button, 
  BackButton, 
  ListCard, 
  ListItem, 
  SearchInput, 
  StatusBadge, 
  ActionMenu, 
  Input, 
  PrimaryButton,
  SecondaryButton, 
  PanelCard 
} from '../../../app/components/ui';
import { calculateServiceProfit } from '../../../core/finance/serviceProfit';
import { calculateBudgetTotal } from '../../../core/pricing/budget';
import type { Budget } from '../../../core/types/business';
import { loadSavedBudgets, type SavedBudgetRecord } from '../../budgets/storage/savedBudgetsStorage';
import { loadSimpleFinanceRecords, saveSimpleFinanceRecord, type SimpleFinanceRecord } from '../storage/simpleFinanceStorage';
import './SimpleFinanceWorkspace.css';

interface BudgetFinanceRow {
  budgetId: string;
  title: string;
  clientName: string;
  status: string;
  updatedAt: string;
  receivedAmount: number;
  materialCost: number;
  travelCost: number;
  otherCosts: number;
  cardFee: number;
  estimatedTax: number;
}

interface AdjustmentDraft {
  budgetId: string;
  title: string;
  clientName: string;
  receivedAmount: string;
  materialCost: string;
  travelCost: string;
  otherCosts: string;
  cardFee: string;
  estimatedTax: string;
}

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const FINANCE_VISIBLE_LIMIT = 5;

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function parseAmount(value: string): number {
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : 0;
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

export function SimpleFinanceWorkspace() {
  const [recordSearch, setRecordSearch] = useState('');
  const [editingDraft, setEditingDraft] = useState<AdjustmentDraft | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const [syncTick, setSyncTick] = useState(0);

  const finalizedBudgets = useMemo(
    () => loadSavedBudgets().filter((budget) => budget.status === 'finalizado'),
    [syncTick]
  );

  const adjustmentsByBudgetId = useMemo(() => {
    const map = new Map<string, SimpleFinanceRecord>();
    loadSimpleFinanceRecords().forEach((record) => {
      if (record.sourceBudgetId) map.set(record.sourceBudgetId, record);
    });
    return map;
  }, [syncTick]);

  const rows = useMemo<BudgetFinanceRow[]>(() => {
    return finalizedBudgets.map((budget) => {
      const adjustment = adjustmentsByBudgetId.get(budget.id);
      const baseMaterialCost = budget.materialCost || budget.items
        .filter((item) => item.category === 'material')
        .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
      const baseRow: BudgetFinanceRow = {
        budgetId: budget.id,
        title: budget.title,
        clientName: budget.clientName,
        status: budget.status,
        updatedAt: budget.updatedAt,
        receivedAmount: budgetTotal(budget),
        materialCost: baseMaterialCost,
        travelCost: budget.travelCost || 0,
        otherCosts: (budget.additionalFees || 0) + (budget.operationalCost || 0),
        cardFee: 0,
        estimatedTax: 0,
      };

      if (!adjustment) return baseRow;

      return {
        ...baseRow,
        receivedAmount: adjustment.receivedAmount,
        materialCost: adjustment.materialCost,
        travelCost: adjustment.travelCost,
        otherCosts: adjustment.otherCosts,
        cardFee: adjustment.cardFee,
        estimatedTax: adjustment.estimatedTax,
      };
    });
  }, [finalizedBudgets, adjustmentsByBudgetId]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = recordSearch.trim().toLowerCase();
    if (!normalizedSearch) return rows;
    return rows.filter((row) => [row.title, row.clientName, money(row.receivedAmount)].join(' ').toLowerCase().includes(normalizedSearch));
  }, [recordSearch, rows]);

  const visibleRows = showAllRows ? filteredRows : filteredRows.slice(0, FINANCE_VISIBLE_LIMIT);
  const hiddenRecordCount = Math.max(filteredRows.length - visibleRows.length, 0);

  const monthSummary = useMemo(() => {
    return rows.reduce((summary, row) => {
      const result = calculateServiceProfit(row);
      return {
        realized: summary.realized + result.receivedAmount,
        directCosts: summary.directCosts + result.directCosts,
        net: summary.net + result.netProfit,
      };
    }, { realized: 0, directCosts: 0, net: 0 });
  }, [rows]);

  function openAdjustment(row: BudgetFinanceRow) {
    setEditingDraft({
      budgetId: row.budgetId,
      title: row.title,
      clientName: row.clientName,
      receivedAmount: String(row.receivedAmount),
      materialCost: String(row.materialCost),
      travelCost: String(row.travelCost),
      otherCosts: String(row.otherCosts),
      cardFee: String(row.cardFee),
      estimatedTax: String(row.estimatedTax),
    });
  }

  function saveAdjustment() {
    if (!editingDraft) return;
    saveSimpleFinanceRecord({
      title: editingDraft.title,
      clientName: editingDraft.clientName,
      status: 'realized',
      receivedAmount: parseAmount(editingDraft.receivedAmount),
      materialCost: parseAmount(editingDraft.materialCost),
      travelCost: parseAmount(editingDraft.travelCost),
      cardFee: parseAmount(editingDraft.cardFee),
      estimatedTax: parseAmount(editingDraft.estimatedTax),
      otherCosts: parseAmount(editingDraft.otherCosts),
      sourceBudgetId: editingDraft.budgetId,
    });
    setEditingDraft(null);
    setSyncTick((value) => value + 1);
  }

  return (
    <section className="simple-finance-workspace">
      <div className="dashboard-finance-tiles">
        <MetricCard label="Receita realizada" value={<MoneyValue value={monthSummary.realized} tone="success" />} tone="success" />
        <MetricCard label="Custos diretos" value={<MoneyValue value={monthSummary.directCosts} tone="danger" />} tone="danger" />
        <MetricCard label="Lucro líquido" value={<MoneyValue value={monthSummary.net} tone={monthSummary.net >= 0 ? 'success' : 'danger'} />} tone={monthSummary.net >= 0 ? 'success' : 'danger'} />
      </div>

      {editingDraft && (
        <PanelCard className="finance-entry-panel">
          <BackButton onClick={() => setEditingDraft(null)} label="Voltar para resultados" />
          <header className="panel-list-header">
            <h2>Ajuste Financeiro do Orçamento</h2>
            <p>Refine valores reais de um orçamento finalizado.</p>
          </header>

          <div className="finance-form-grid finance-form-grid-spaced">
            <Input className="wide" label="Título" value={editingDraft.title} onChange={(event) => setEditingDraft((current) => current ? { ...current, title: event.target.value } : current)} />
            <Input label="Cliente" value={editingDraft.clientName} onChange={(event) => setEditingDraft((current) => current ? { ...current, clientName: event.target.value } : current)} />
            <Input label="Receita realizada" inputMode="decimal" value={editingDraft.receivedAmount} onChange={(event) => setEditingDraft((current) => current ? { ...current, receivedAmount: event.target.value } : current)} />
            <Input label="Custo material" inputMode="decimal" value={editingDraft.materialCost} onChange={(event) => setEditingDraft((current) => current ? { ...current, materialCost: event.target.value } : current)} />
            <Input label="Deslocamento" inputMode="decimal" value={editingDraft.travelCost} onChange={(event) => setEditingDraft((current) => current ? { ...current, travelCost: event.target.value } : current)} />
            <Input label="Outros custos" inputMode="decimal" value={editingDraft.otherCosts} onChange={(event) => setEditingDraft((current) => current ? { ...current, otherCosts: event.target.value } : current)} />
            <Input label="Taxa cartão" inputMode="decimal" value={editingDraft.cardFee} onChange={(event) => setEditingDraft((current) => current ? { ...current, cardFee: event.target.value } : current)} />
            <Input label="Imposto estimado" inputMode="decimal" value={editingDraft.estimatedTax} onChange={(event) => setEditingDraft((current) => current ? { ...current, estimatedTax: event.target.value } : current)} />
          </div>

          <div className="finance-entry-actions">
            <PrimaryButton className="finance-entry-submit" onClick={saveAdjustment}>Salvar ajuste</PrimaryButton>
          </div>
        </PanelCard>
      )}

      <PanelCard className="finance-results-panel">
        <header className="panel-list-header">
          <h2>Resultados de Orçamentos Finalizados</h2>
        </header>
        <SearchInput
          value={recordSearch}
          placeholder="Buscar orçamento por título, cliente ou valor..."
          onChange={(value) => { setRecordSearch(value); setShowAllRows(false); }}
        />
      </PanelCard>

      <ListCard>
        {rows.length === 0 ? (
          <EmptyState title="Nenhum orçamento finalizado" description="Quando um orçamento for finalizado, o resultado aparecerá aqui automaticamente." />
        ) : filteredRows.length === 0 ? (
          <EmptyState title="Nenhum resultado" description={`Nenhum orçamento encontrado para \"${recordSearch}\".`} />
        ) : (
          visibleRows.map((row) => {
            const profit = calculateServiceProfit(row);
            return (
              <ListItem 
                key={row.budgetId}
                title={row.title}
                subtitle={
                  <div className="finance-row-meta-grid">
                    <span>{row.clientName || 'Cliente final'} · {formatDate(row.updatedAt)}</span>
                    <StatusBadge status="finalizado" />
                  </div>
                }
                value={
                  <div className="finance-row-value-grid">
                    <strong>{money(profit.netProfit)}</strong>
                    <small>{profit.netMarginPercent.toFixed(0)}% margem</small>
                  </div>
                }
                action={
                  <div className="finance-row-status-inline">
                    <SecondaryButton onClick={() => openAdjustment(row)}>Abrir</SecondaryButton>
                    <ActionMenu
                      label="Ações do resultado"
                      items={[
                        { id: 'open', label: 'Abrir ajuste', onSelect: () => openAdjustment(row) },
                        { id: 'edit', label: 'Editar', onSelect: () => openAdjustment(row) },
                      ]}
                    />
                  </div>
                }
              />
            );
          })
        )}
        
        {filteredRows.length > FINANCE_VISIBLE_LIMIT && (
          <div className="finance-list-expand-wrap">
            <Button variant="ghost" className="density-toggle-cta" onClick={() => setShowAllRows((current) => !current)}>
              {showAllRows ? 'Ver menos' : `Ver mais (${hiddenRecordCount})`}
            </Button>
          </div>
        )}
      </ListCard>
    </section>
  );
}
