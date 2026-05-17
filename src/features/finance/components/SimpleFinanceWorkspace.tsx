import { useMemo, useState } from 'react';
import { calculatePercentAmount, calculateServiceProfit } from '../../../core/finance/serviceProfit';
import { calculateBudgetTotal } from '../../../core/pricing/budget';
import type { Budget } from '../../../core/types/business';
import { loadSavedBudgets, type SavedBudgetRecord } from '../../budgets/storage/savedBudgetsStorage';
import {
  deleteSimpleFinanceRecord,
  loadSimpleFinanceRecords,
  saveSimpleFinanceRecord,
  type SimpleFinanceRecord,
} from '../storage/simpleFinanceStorage';
import { MetricCard, MoneyValue } from '../../../app/components/ui';
import './SimpleFinanceWorkspace.css';

interface FinanceDraft {
  id: string | null;
  title: string;
  clientName: string;
  status: SimpleFinanceRecord['status'];
  receivedAmount: string;
  materialCost: string;
  travelCost: string;
  cardFeePercent: string;
  cardFee: string;
  estimatedTaxPercent: string;
  estimatedTax: string;
  otherCosts: string;
  sourceBudgetId: string;
}

const emptyDraft: FinanceDraft = {
  id: null,
  title: '',
  clientName: '',
  status: 'realized',
  receivedAmount: '0',
  materialCost: '0',
  travelCost: '0',
  cardFeePercent: '0',
  cardFee: '0',
  estimatedTaxPercent: '0',
  estimatedTax: '0',
  otherCosts: '0',
  sourceBudgetId: '',
};

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const FINANCE_VISIBLE_LIMIT = 5;

function parseAmount(value: string): number {
  const parsed = Number(value.replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number): string {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function savedBudgetTotal(record: SavedBudgetRecord): number {
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

function recordToDraft(record: SimpleFinanceRecord): FinanceDraft {
  return {
    id: record.id,
    title: record.title,
    clientName: record.clientName,
    status: record.status,
    receivedAmount: String(record.receivedAmount),
    materialCost: String(record.materialCost),
    travelCost: String(record.travelCost),
    cardFeePercent: '0',
    cardFee: String(record.cardFee),
    estimatedTaxPercent: '0',
    estimatedTax: String(record.estimatedTax),
    otherCosts: String(record.otherCosts),
    sourceBudgetId: record.sourceBudgetId ?? '',
  };
}

export function SimpleFinanceWorkspace() {
  const [draft, setDraft] = useState<FinanceDraft>(emptyDraft);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [records, setRecords] = useState<SimpleFinanceRecord[]>(() => loadSimpleFinanceRecords());
  const [recordSearch, setRecordSearch] = useState('');
  const savedBudgets = useMemo(() => loadSavedBudgets(), []);
  const approvedBudgets = savedBudgets.filter((budget) => budget.status === 'approved');
  const filteredRecords = useMemo(() => {
    const normalizedSearch = recordSearch.trim().toLowerCase();
    if (!normalizedSearch) return [];
    return records.filter((record) => [record.title, record.clientName, record.status === 'forecast' ? 'Previsto' : 'Recebido', money(record.receivedAmount)].join(' ').toLowerCase().includes(normalizedSearch));
  }, [recordSearch, records]);
  const visibleRecords = filteredRecords.slice(0, FINANCE_VISIBLE_LIMIT);
  const hiddenRecordCount = Math.max(filteredRecords.length - visibleRecords.length, 0);

  const result = useMemo(() => calculateServiceProfit({
    receivedAmount: parseAmount(draft.receivedAmount),
    materialCost: parseAmount(draft.materialCost),
    travelCost: parseAmount(draft.travelCost),
    cardFee: parseAmount(draft.cardFee),
    estimatedTax: parseAmount(draft.estimatedTax),
    otherCosts: parseAmount(draft.otherCosts),
  }), [draft.cardFee, draft.estimatedTax, draft.materialCost, draft.otherCosts, draft.receivedAmount, draft.travelCost]);

  const monthSummary = useMemo(() => {
    return records.reduce((summary, record) => {
      const profit = calculateServiceProfit(record);
      const isRealized = record.status === 'realized';
      return {
        forecast: summary.forecast + (isRealized ? 0 : profit.receivedAmount),
        realized: summary.realized + (isRealized ? profit.receivedAmount : 0),
        net: summary.net + (isRealized ? profit.netProfit : 0),
        directCosts: summary.directCosts + (isRealized ? profit.directCosts : 0),
      };
    }, { forecast: 0, realized: 0, net: 0, directCosts: 0 });
  }, [records]);

  function updateDraft<K extends keyof FinanceDraft>(key: K, value: FinanceDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyPercent(kind: 'card' | 'tax') {
    const received = parseAmount(draft.receivedAmount);
    if (kind === 'card') {
      updateDraft('cardFee', String(calculatePercentAmount(received, parseAmount(draft.cardFeePercent)).toFixed(2)));
      return;
    }
    updateDraft('estimatedTax', String(calculatePercentAmount(received, parseAmount(draft.estimatedTaxPercent)).toFixed(2)));
  }

  function useBudget(recordId: string) {
    const budget = approvedBudgets.find((item) => item.id === recordId);
    if (!budget) return;
    const materialCost = budget.items.filter((item) => item.category === 'material').reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    setDraft((current) => ({
      ...current,
      title: budget.title,
      clientName: budget.clientName,
      status: 'forecast',
      receivedAmount: String(savedBudgetTotal(budget)),
      materialCost: String(materialCost),
      travelCost: String(budget.travelCost),
      sourceBudgetId: budget.id,
    }));
  }

  function saveRecord() {
    const saved = saveSimpleFinanceRecord({
      id: draft.id,
      title: draft.title.trim() || 'Serviço sem título',
      clientName: draft.clientName.trim(),
      status: draft.status,
      receivedAmount: parseAmount(draft.receivedAmount),
      materialCost: parseAmount(draft.materialCost),
      travelCost: parseAmount(draft.travelCost),
      cardFee: parseAmount(draft.cardFee),
      estimatedTax: parseAmount(draft.estimatedTax),
      otherCosts: parseAmount(draft.otherCosts),
      sourceBudgetId: draft.sourceBudgetId || undefined,
    });
    if (!saved) return;
    setRecords(loadSimpleFinanceRecords());
    setDraft(emptyDraft);
    setShowEntryForm(false);
  }

  function editRecord(record: SimpleFinanceRecord) {
    setDraft(recordToDraft(record));
    setShowEntryForm(true);
  }

  function removeRecord(id: string) {
    setRecords(deleteSimpleFinanceRecord(id));
    if (draft.id === id) setDraft(emptyDraft);
  }

  return (
    <section className="simple-finance-workspace">
      <div className="dashboard-finance-tiles">
        <MetricCard label="Receita prevista" value={<MoneyValue value={monthSummary.forecast} />} />
        <MetricCard label="Receita realizada" value={<MoneyValue value={monthSummary.realized} tone="success" />} tone="success" />
        <MetricCard label="Custos diretos" value={<MoneyValue value={monthSummary.directCosts} tone="danger" />} tone="danger" />
        <MetricCard label="Lucro líquido" value={<MoneyValue value={monthSummary.net} tone={monthSummary.net >= 0 ? 'success' : 'danger'} />} tone={monthSummary.net >= 0 ? 'success' : 'danger'} />
      </div>

      {showEntryForm && <div className="aferix-panel-card finance-entry-panel">
        <header>
          <div>
            <h2>{draft.id ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          </div>
          <button className="ghost-action" type="button" onClick={() => { setDraft(emptyDraft); setShowEntryForm(false); }}>Fechar</button>
        </header>

        <div className="finance-entry-layout">
          <div className="finance-entry-main">
            {approvedBudgets.length > 0 && (
              <label className="finance-field finance-source-field">
                <span>Preencher a partir de orçamento aprovado</span>
                <select value={draft.sourceBudgetId} onChange={(event) => useBudget(event.target.value)}>
                  <option value="">Selecionar orçamento aprovado</option>
                  {approvedBudgets.map((budget) => <option key={budget.id} value={budget.id}>{budget.title} · {money(savedBudgetTotal(budget))}</option>)}
                </select>
              </label>
            )}

            <div className="professional-profile-grid finance-form-grid">
              <label className="budget-field wide"><span>Serviço</span><input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></label>
              <label className="budget-field"><span>Cliente</span><input value={draft.clientName} onChange={(event) => updateDraft('clientName', event.target.value)} /></label>
              <label className="budget-field"><span>Status</span><select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as SimpleFinanceRecord['status'])}><option value="forecast">Previsto</option><option value="realized">Recebido</option></select></label>
              <label className="budget-field"><span>Recebido</span><input inputMode="decimal" value={draft.receivedAmount} onChange={(event) => updateDraft('receivedAmount', event.target.value)} /></label>
              <label className="budget-field"><span>Material</span><input inputMode="decimal" value={draft.materialCost} onChange={(event) => updateDraft('materialCost', event.target.value)} /></label>
              <label className="budget-field"><span>Deslocamento</span><input inputMode="decimal" value={draft.travelCost} onChange={(event) => updateDraft('travelCost', event.target.value)} /></label>
              <label className="budget-field"><span>Outros</span><input inputMode="decimal" value={draft.otherCosts} onChange={(event) => updateDraft('otherCosts', event.target.value)} /></label>
            </div>

            <div className="finance-entry-actions">
              <button className="ghost-action" type="button" onClick={saveRecord}>{draft.id ? 'Atualizar' : 'Salvar'}</button>
            </div>
          </div>

          <aside className="finance-live-summary">
            <div className="dashboard-finance-tiles finance-live-grid">
              <MetricCard label="Lucro líquido" value={<MoneyValue value={result.netProfit} tone={result.netProfit >= 0 ? 'success' : 'danger'} />} tone={result.netProfit >= 0 ? 'success' : 'danger'} />
              <MetricCard label="Margem" value={`${result.netMarginPercent.toFixed(1)}%`} tone={result.netMarginPercent >= 0 ? 'success' : 'danger'} />
            </div>
          </aside>
        </div>
      </div>}

      <div className="aferix-panel-card">
        <header>
          <div>
            <h2>Histórico</h2>
            <p>Lançamentos financeiros registrados neste dispositivo.</p>
          </div>
          <button className="ghost-action" type="button" onClick={() => { setDraft(emptyDraft); setShowEntryForm(true); }}>Novo lançamento</button>
        </header>
        <label className="finance-field finance-search-field"><span>Buscar lançamento</span><input value={recordSearch} placeholder="Serviço, cliente, status ou valor" onChange={(event) => setRecordSearch(event.target.value)} /></label>
        <div className="continuous-list">
          {records.length === 0 ? <div className="continuous-list-empty">Nenhum lançamento registrado.</div> : !recordSearch.trim() ? <div className="continuous-list-empty">Pesquise para listar os registros.</div> : visibleRecords.length === 0 ? <div className="continuous-list-empty">Nenhum resultado.</div> : visibleRecords.map((record) => {
            const profit = calculateServiceProfit(record);
            return (
              <article className="continuous-list-item" key={record.id}>
                <div className="client-col">
                  <strong>{record.title}</strong>
                  <small>{record.clientName || 'Cliente final'} · {record.status === 'forecast' ? 'Previsto' : 'Recebido'}</small>
                </div>
                <div className="value-col">{money(profit.netProfit)}</div>
                <div className="finance-record-actions">
                  <button className="ghost-action compact-row-action" type="button" onClick={() => editRecord(record)}>Editar</button>
                  <button className="ghost-action compact-row-action danger-row-action" type="button" onClick={() => removeRecord(record.id)}>Remover</button>
                </div>
              </article>
            );
          })}
          {hiddenRecordCount > 0 && <div className="continuous-list-empty">+{hiddenRecordCount} registros.</div>}
        </div>
      </div>
    </section>
  );
}
