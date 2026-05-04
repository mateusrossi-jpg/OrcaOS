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
    if (!normalizedSearch) return records;
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
      <div className="finance-kpi-grid">
        <article><span>Receita prevista</span><strong>{money(monthSummary.forecast)}</strong></article>
        <article><span>Receita realizada</span><strong>{money(monthSummary.realized)}</strong></article>
        <article><span>Custos diretos</span><strong>{money(monthSummary.directCosts)}</strong></article>
        <article><span>Lucro líquido estimado</span><strong>{money(monthSummary.net)}</strong></article>
      </div>

      <div className="finance-panel finance-command-panel">
        <div className="finance-panel-header">
          <div>
            <h2>Lançamentos financeiros</h2>
            <p>Veja receitas e custos primeiro. Abra o formulário apenas para criar ou editar um lançamento.</p>
          </div>
          <button className="primary-action inline-action" type="button" onClick={() => { setDraft(emptyDraft); setShowEntryForm(true); }}>Novo lançamento</button>
        </div>
      </div>

      {showEntryForm && <div className="finance-panel finance-entry-panel">
        <div className="finance-panel-header">
          <div>
            <h2>{draft.id ? 'Editar lançamento financeiro' : 'Novo lançamento financeiro'}</h2>
            <p>Controle gerencial simples. Não substitui nota fiscal, contador ou cálculo fiscal oficial.</p>
          </div>
          <button className="secondary-action inline-action" type="button" onClick={() => { setDraft(emptyDraft); setShowEntryForm(false); }}>Fechar</button>
        </div>

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

            <div className="finance-form-grid">
              <label className="finance-field wide"><span>Serviço</span><input value={draft.title} placeholder="Ex.: Instalação de tomadas no quarto" onChange={(event) => updateDraft('title', event.target.value)} /></label>
              <label className="finance-field"><span>Cliente</span><input value={draft.clientName} placeholder="Opcional" onChange={(event) => updateDraft('clientName', event.target.value)} /></label>
              <label className="finance-field"><span>Status financeiro</span><select value={draft.status} onChange={(event) => updateDraft('status', event.target.value as SimpleFinanceRecord['status'])}><option value="forecast">Receita prevista</option><option value="realized">Receita realizada</option></select></label>
              <label className="finance-field"><span>Valor recebido</span><input inputMode="decimal" value={draft.receivedAmount} onChange={(event) => updateDraft('receivedAmount', event.target.value)} /></label>
              <label className="finance-field"><span>Material</span><input inputMode="decimal" value={draft.materialCost} onChange={(event) => updateDraft('materialCost', event.target.value)} /></label>
              <label className="finance-field"><span>Deslocamento</span><input inputMode="decimal" value={draft.travelCost} onChange={(event) => updateDraft('travelCost', event.target.value)} /></label>
              <label className="finance-field"><span>Outros custos</span><input inputMode="decimal" value={draft.otherCosts} onChange={(event) => updateDraft('otherCosts', event.target.value)} /></label>
              <label className="finance-field"><span>Taxa cartão %</span><input inputMode="decimal" value={draft.cardFeePercent} onChange={(event) => updateDraft('cardFeePercent', event.target.value)} /></label>
              <label className="finance-field action-field"><span>Taxa cartão R$</span><input inputMode="decimal" value={draft.cardFee} onChange={(event) => updateDraft('cardFee', event.target.value)} /><button type="button" onClick={() => applyPercent('card')}>Calcular</button></label>
              <label className="finance-field"><span>Imposto estimado %</span><input inputMode="decimal" value={draft.estimatedTaxPercent} onChange={(event) => updateDraft('estimatedTaxPercent', event.target.value)} /></label>
              <label className="finance-field action-field"><span>Imposto estimado R$</span><input inputMode="decimal" value={draft.estimatedTax} onChange={(event) => updateDraft('estimatedTax', event.target.value)} /><button type="button" onClick={() => applyPercent('tax')}>Calcular</button></label>
            </div>

            <button className="primary-action inline-action finance-save-button" type="button" onClick={saveRecord}>{draft.id ? 'Atualizar lançamento' : 'Salvar lançamento'}</button>
          </div>

          <aside className="finance-live-summary" aria-label="Resumo do lançamento">
            <div className="finance-result-grid">
              <article><span>Lucro bruto</span><strong>{money(result.grossProfit)}</strong><small>recebido - custos diretos</small></article>
              <article><span>Lucro líquido</span><strong>{money(result.netProfit)}</strong><small>bruto - cartão - imposto</small></article>
              <article><span>Margem líquida</span><strong>{result.netMarginPercent.toFixed(1)}%</strong><small>sobre valor recebido</small></article>
            </div>
            <div className="finance-warning-card">
              <strong>{draft.status === 'forecast' ? 'Receita prevista' : 'Receita realizada'}</strong>
              <small>{draft.status === 'forecast' ? 'Use para orçamento aprovado ainda não recebido. Quando o cliente pagar, marque como receita realizada.' : 'Use para serviço pago/executado e acompanhe lucro real estimado.'}</small>
              <small>Controle gerencial local, não fiscal oficial.</small>
            </div>
          </aside>
        </div>
      </div>}

      <div className="finance-panel">
        <div className="finance-panel-header"><div><h2>Histórico financeiro</h2><p>Lançamentos locais para o profissional acompanhar quanto realmente ganhou.</p></div></div>
        <label className="finance-field finance-search-field"><span>Buscar lançamento</span><input value={recordSearch} placeholder="Serviço, cliente, status ou valor" onChange={(event) => setRecordSearch(event.target.value)} /></label>
        <div className="finance-record-list">
          {records.length === 0 ? <div className="finance-empty">Nenhum lançamento financeiro ainda.</div> : visibleRecords.length === 0 ? <div className="finance-empty">Nenhum lançamento encontrado com essa busca.</div> : visibleRecords.map((record) => {
            const profit = calculateServiceProfit(record);
            return (
              <article className="finance-record-card" key={record.id}>
                <button type="button" onClick={() => editRecord(record)}>
                  <strong>{record.title}</strong>
                  <small>{record.clientName || 'Cliente não informado'} · {record.status === 'forecast' ? 'Previsto' : 'Recebido'} {money(record.receivedAmount)}</small>
                  <span>Lucro líquido {money(profit.netProfit)} · margem {profit.netMarginPercent.toFixed(1)}%</span>
                </button>
                <div className="finance-record-actions">
                  <button className="secondary-action inline-action" type="button" onClick={() => editRecord(record)}>Editar</button>
                  <button className="danger-action" type="button" onClick={() => removeRecord(record.id)}>Remover</button>
                </div>
              </article>
            );
          })}
          {hiddenRecordCount > 0 && <div className="finance-empty compact">Mais {hiddenRecordCount} lançamento(s) oculto(s). Use a busca para refinar.</div>}
        </div>
      </div>
    </section>
  );
}
