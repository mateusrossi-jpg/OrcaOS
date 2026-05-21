import { useEffect, useMemo, useState } from 'react';
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
import { MetricCard, MoneyValue, Button, Select, EmptyState, BackButton } from '../../../app/components/ui';
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
  forecastReceived: number;
  forecastMaterial: number;
  forecastTravel: number;
  forecastOther: number;
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
  forecastReceived: 0,
  forecastMaterial: 0,
  forecastTravel: 0,
  forecastOther: 0,
};

const moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const FINANCE_VISIBLE_LIMIT = 10;

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
    forecastReceived: record.receivedAmount,
    forecastMaterial: record.materialCost,
    forecastTravel: record.travelCost,
    forecastOther: record.otherCosts,
  };
}

export function SimpleFinanceWorkspace({ onNewEntryRequest }: { onNewEntryRequest?: (callback: () => void) => void }) {
  const [draft, setDraft] = useState<FinanceDraft>(emptyDraft);
  const [showEntryForm, setShowEntryForm] = useState(false);
  
  // Expose the "new entry" logic if requested
  useEffect(() => {
    if (onNewEntryRequest) {
      onNewEntryRequest(() => {
        setDraft(emptyDraft);
        setShowEntryForm(true);
      });
    }
  }, [onNewEntryRequest]);

  const [records, setRecords] = useState<SimpleFinanceRecord[]>(() => loadSimpleFinanceRecords());
  const [recordSearch, setRecordSearch] = useState('');
  const savedBudgets = useMemo(() => loadSavedBudgets(), []);
  const approvedBudgets = savedBudgets.filter((budget) => budget.status === 'approved');
  
  const filteredRecords = useMemo(() => {
    const normalizedSearch = recordSearch.trim().toLowerCase();
    if (!normalizedSearch) return records;
    return records.filter((record) => [record.title, record.clientName, record.status === 'forecast' ? 'Previsto' : 'Recebido', money(record.receivedAmount)].join(' ').toLowerCase().includes(normalizedSearch));
  }, [recordSearch, records]);

  const visibleRecords = filteredRecords.slice(0, FINANCE_VISIBLE_LIMIT);
  const hiddenRecordCount = Math.max(filteredRecords.length - visibleRecords.length, 0);

  const realResult = useMemo(() => calculateServiceProfit({
    receivedAmount: parseAmount(draft.receivedAmount),
    materialCost: parseAmount(draft.materialCost),
    travelCost: parseAmount(draft.travelCost),
    cardFee: parseAmount(draft.cardFee),
    estimatedTax: parseAmount(draft.estimatedTax),
    otherCosts: parseAmount(draft.otherCosts),
  }), [draft.cardFee, draft.estimatedTax, draft.materialCost, draft.otherCosts, draft.receivedAmount, draft.travelCost]);

  const forecastResult = useMemo(() => calculateServiceProfit({
    receivedAmount: draft.forecastReceived,
    materialCost: draft.forecastMaterial,
    travelCost: draft.forecastTravel,
    cardFee: 0,
    estimatedTax: 0,
    otherCosts: draft.forecastOther,
  }), [draft.forecastMaterial, draft.forecastOther, draft.forecastReceived, draft.forecastTravel]);

  const profitDiff = realResult.netProfit - forecastResult.netProfit;

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

  function useBudget(recordId: string) {
    const budget = approvedBudgets.find((item) => item.id === recordId);
    if (!budget) return;
    const materialCost = budget.items.filter((item) => item.category === 'material').reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    const totalOrçado = savedBudgetTotal(budget);
    setDraft((current) => ({
      ...current,
      title: budget.title,
      clientName: budget.clientName,
      status: 'realized',
      receivedAmount: String(totalOrçado),
      materialCost: String(materialCost),
      travelCost: String(budget.travelCost),
      sourceBudgetId: budget.id,
      forecastReceived: totalOrçado,
      forecastMaterial: materialCost,
      forecastTravel: budget.travelCost || 0,
      forecastOther: budget.additionalFees || 0,
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
        <BackButton onClick={() => { setDraft(emptyDraft); setShowEntryForm(false); }} label="Voltar para Orçamentos" />
        <header>
          <div>
            <h2>{draft.id ? 'Editar Resultado' : 'Resultado do Orçamento'}</h2>
            <p>Registre o resultado real comparado ao orçamento concluído.</p>
          </div>
        </header>

        <div className="finance-entry-layout">
          <div className="finance-entry-main">
            {approvedBudgets.length > 0 && !draft.id && (
              <Select label="Vincular orçamento aprovado" className="finance-source-field" value={draft.sourceBudgetId} onChange={(value: string) => useBudget(value)}>
                <option value="">Selecionar orçamento concluído</option>
                {approvedBudgets.map((budget) => <option key={budget.id} value={budget.id}>{budget.title} · {money(savedBudgetTotal(budget))}</option>)}
              </Select>
            )}

            <div className="finance-form-grid finance-form-grid-spaced">
              <label className="budget-field wide"><span>Título do Serviço</span><input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} /></label>
              <label className="budget-field"><span>Cliente</span><input value={draft.clientName} onChange={(event) => updateDraft('clientName', event.target.value)} /></label>
              
              <Select label="Status" value={draft.status} onChange={(value: string) => updateDraft('status', value as SimpleFinanceRecord['status'])}>
                <option value="realized">Recebido / Concluído</option>
                <option value="forecast">Aguardando Recebimento</option>
              </Select>
              
              <div className="comparative-input-group">
                <label className="budget-field">
                  <span>Valor Recebido (Real)</span>
                  <input inputMode="decimal" value={draft.receivedAmount} onChange={(event) => updateDraft('receivedAmount', event.target.value)} />
                  <small>Orçado: {money(draft.forecastReceived)}</small>
                </label>
                <label className="budget-field">
                  <span>Custo Material (Real)</span>
                  <input inputMode="decimal" value={draft.materialCost} onChange={(event) => updateDraft('materialCost', event.target.value)} />
                  <small>Previsto: {money(draft.forecastMaterial)}</small>
                </label>
                <label className="budget-field">
                  <span>Deslocamento (Real)</span>
                  <input inputMode="decimal" value={draft.travelCost} onChange={(event) => updateDraft('travelCost', event.target.value)} />
                  <small>Previsto: {money(draft.forecastTravel)}</small>
                </label>
                <label className="budget-field">
                  <span>Outros Custos (Real)</span>
                  <input inputMode="decimal" value={draft.otherCosts} onChange={(event) => updateDraft('otherCosts', event.target.value)} />
                  <small>Previsto: {money(draft.forecastOther)}</small>
                </label>
              </div>
            </div>

            <div className="finance-entry-actions">
              <Button variant="primary" className="finance-entry-submit" onClick={saveRecord}>{draft.id ? 'Atualizar Apuração' : 'Finalizar e Salvar Lucro'}</Button>
            </div>
          </div>

          <aside className="finance-live-summary">
            <div className="aferix-panel-card result-comparison-card">
              <header><h3>Resultado Final</h3></header>
              <div className="result-metric">
                <span>Lucro Real</span>
                <strong className={realResult.netProfit >= 0 ? 'tone-success' : 'tone-danger'}>{money(realResult.netProfit)}</strong>
              </div>
              <div className="result-metric">
                <span>Margem Real</span>
                <strong>{realResult.netMarginPercent.toFixed(1)}%</strong>
              </div>
              <div className="result-divider" />
              <div className="result-metric diff-metric">
                <span>Diferença (vs Orçado)</span>
                <strong className={profitDiff >= 0 ? 'tone-success' : 'tone-danger'}>
                  {profitDiff >= 0 ? '+' : ''}{money(profitDiff)}
                </strong>
                <small>{profitDiff >= 0 ? 'Lucro acima do previsto' : 'Lucro abaixo do previsto'}</small>
              </div>
            </div>
          </aside>
        </div>
      </div>}

      <div className="aferix-panel-card finance-results-panel">
        <header className="panel-list-header">
          <div>
            <h2>Apuração de Resultados</h2>
          </div>
        </header>
        <div className="finance-search-container">
          <input 
            value={recordSearch} 
            placeholder="Buscar orçamento..." 
            onChange={(event) => setRecordSearch(event.target.value)} 
          />
        </div>
        <div className="continuous-list">
          {records.length === 0 ? (
            <EmptyState title="Sem orçamentos concluídos" description="Orçamentos concluídos aparecem aqui." />
          ) : visibleRecords.length === 0 ? (
            <EmptyState title="Nenhum resultado" description={`Nenhum orçamento encontrado para "${recordSearch}".`} />
          ) : (
            visibleRecords.map((record) => {
              const profit = calculateServiceProfit(record);
              return (
                <article className="continuous-list-item" key={record.id}>
                  <div className="client-col">
                    <strong>{record.title}</strong>
                    <small>{record.clientName || 'Cliente final'} · {record.status === 'forecast' ? 'Aguardando' : 'Finalizado'}</small>
                  </div>
                  <div className="value-col">
                    <strong>{money(profit.netProfit)}</strong>
                    <small>{profit.netMarginPercent.toFixed(0)}% margem</small>
                  </div>
                  <div className="finance-record-actions">
                    <button className="ghost-action compact-row-action" type="button" onClick={() => editRecord(record)}>✎</button>
                    <button className="ghost-action compact-row-action danger-row-action" type="button" onClick={() => removeRecord(record.id)}>✕</button>
                  </div>
                </article>
              );
            })
          )}
          {hiddenRecordCount > 0 && <div className="continuous-list-empty">+{hiddenRecordCount} registros.</div>}
        </div>
      </div>
    </section>
  );
}
