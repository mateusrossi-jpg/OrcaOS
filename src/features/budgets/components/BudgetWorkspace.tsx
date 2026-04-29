import { useEffect, useMemo, useState } from 'react';
import type { Budget, BudgetItem } from '../../../core/types/business';
import { calculateBudgetItemTotal, calculateBudgetSubtotal, calculateBudgetTotal } from '../../../core/pricing/budget';
import { roundTechnical } from '../../../core/calculations/electrical';
import { clearBudgetDraft, loadBudgetDraft, saveBudgetDraft } from '../storage/budgetDraftStorage';
import {
  deleteSavedBudget,
  loadSavedBudgets,
  saveBudgetRecord,
  type SavedBudgetRecord,
  type SavedBudgetStatus,
} from '../storage/savedBudgetsStorage';
import { starterElectricalBudgetItems } from '../budgetTemplates';
import './BudgetWorkspace.css';

type BudgetCategory = BudgetItem['category'];

interface DraftBudgetItem {
  description: string;
  quantity: number;
  unitPrice: number;
  category: BudgetCategory;
}

const emptyDraftItem: DraftBudgetItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  category: 'labor',
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(roundTechnical(value));
}

function formatSavedAt(value: string | null): string {
  if (!value) {
    return 'Ainda não salvo nesta sessão';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function categoryLabel(category: BudgetCategory): string {
  if (category === 'labor') {
    return 'Mão de obra';
  }

  if (category === 'material') {
    return 'Material';
  }

  return 'Outro';
}

function statusLabel(status: SavedBudgetStatus): string {
  const labels: Record<SavedBudgetStatus, string> = {
    draft: 'Rascunho',
    sent: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Recusado',
  };

  return labels[status];
}

function createBudgetItem(draft: DraftBudgetItem): BudgetItem {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `item-${Date.now()}`;

  return {
    id,
    description: draft.description.trim(),
    quantity: draft.quantity,
    unitPrice: draft.unitPrice,
    category: draft.category,
  };
}

function calculateSavedBudgetTotal(record: SavedBudgetRecord): number {
  const budget: Budget = {
    id: record.id,
    title: record.title,
    status: record.status,
    discount: record.discount,
    items: record.items,
  };

  return calculateBudgetTotal(budget);
}

const savedDraft = loadBudgetDraft();

export function BudgetWorkspace() {
  const [items, setItems] = useState<BudgetItem[]>(savedDraft?.items ?? starterElectricalBudgetItems);
  const [draft, setDraft] = useState<DraftBudgetItem>(emptyDraftItem);
  const [discount, setDiscount] = useState(savedDraft?.discount ?? 0);
  const [clientName, setClientName] = useState(savedDraft?.clientName ?? 'Cliente exemplo');
  const [budgetTitle, setBudgetTitle] = useState(savedDraft?.budgetTitle ?? 'Serviços elétricos');
  const [budgetStatus, setBudgetStatus] = useState<SavedBudgetStatus>('draft');
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null);
  const [savedBudgets, setSavedBudgets] = useState<SavedBudgetRecord[]>(() => loadSavedBudgets());
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(savedDraft?.updatedAt ?? null);

  useEffect(() => {
    const saved = saveBudgetDraft({
      clientName,
      budgetTitle,
      discount,
      items,
    });

    if (saved) {
      setLastSavedAt(saved.updatedAt);
    }
  }, [budgetTitle, clientName, discount, items]);

  const summary = useMemo(() => {
    const labor = items
      .filter((item) => item.category === 'labor')
      .reduce((total, item) => total + calculateBudgetItemTotal(item), 0);

    const material = items
      .filter((item) => item.category === 'material')
      .reduce((total, item) => total + calculateBudgetItemTotal(item), 0);

    const other = items
      .filter((item) => item.category === 'other')
      .reduce((total, item) => total + calculateBudgetItemTotal(item), 0);

    const subtotal = calculateBudgetSubtotal(items);
    const total = calculateBudgetTotal({
      id: activeBudgetId ?? 'preview-budget',
      title: budgetTitle,
      items,
      discount,
      status: budgetStatus,
    });

    return { labor, material, other, subtotal, total };
  }, [activeBudgetId, budgetStatus, budgetTitle, discount, items]);

  function updateDraft<K extends keyof DraftBudgetItem>(key: K, value: DraftBudgetItem[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function addItem() {
    if (!draft.description.trim() || draft.quantity <= 0 || draft.unitPrice <= 0) {
      return;
    }

    setItems((current) => [...current, createBudgetItem(draft)]);
    setDraft(emptyDraftItem);
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  function loadStarterItems() {
    setItems(starterElectricalBudgetItems);
  }

  function clearItems() {
    setItems([]);
  }

  function resetBudgetDraft() {
    clearBudgetDraft();
    setActiveBudgetId(null);
    setBudgetStatus('draft');
    setClientName('Cliente exemplo');
    setBudgetTitle('Serviços elétricos');
    setDiscount(0);
    setItems(starterElectricalBudgetItems);
    setDraft(emptyDraftItem);
    setLastSavedAt(null);
  }

  function saveCurrentBudget() {
    const saved = saveBudgetRecord({
      id: activeBudgetId,
      clientName,
      title: budgetTitle || 'Orçamento sem título',
      status: budgetStatus,
      discount,
      items,
    });

    if (!saved) {
      return;
    }

    setActiveBudgetId(saved.id);
    setSavedBudgets(loadSavedBudgets());
  }

  function openSavedBudget(record: SavedBudgetRecord) {
    setActiveBudgetId(record.id);
    setClientName(record.clientName);
    setBudgetTitle(record.title);
    setBudgetStatus(record.status);
    setDiscount(record.discount);
    setItems(record.items);
    setDraft(emptyDraftItem);
  }

  function removeSavedBudget(recordId: string) {
    setSavedBudgets(deleteSavedBudget(recordId));

    if (recordId === activeBudgetId) {
      resetBudgetDraft();
    }
  }

  const canAddItem = draft.description.trim().length > 0 && draft.quantity > 0 && draft.unitPrice > 0;

  return (
    <div className="budget-workspace">
      <div className="budget-save-status">
        <span>Rascunho salvo automaticamente</span>
        <strong>{formatSavedAt(lastSavedAt)}</strong>
      </div>

      <div className="budget-header-card">
        <label className="budget-field">
          <span>Cliente</span>
          <input value={clientName} onChange={(event) => setClientName(event.target.value)} />
        </label>
        <label className="budget-field">
          <span>Título do orçamento</span>
          <input value={budgetTitle} onChange={(event) => setBudgetTitle(event.target.value)} />
        </label>
        <label className="budget-field">
          <span>Status</span>
          <select value={budgetStatus} onChange={(event) => setBudgetStatus(event.target.value as SavedBudgetStatus)}>
            <option value="draft">Rascunho</option>
            <option value="sent">Enviado</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Recusado</option>
          </select>
        </label>
      </div>

      <div className="saved-budget-panel">
        <div className="saved-budget-panel-header">
          <div>
            <h3>Orçamentos salvos</h3>
            <p>Salve, abra e gerencie rascunhos locais neste navegador.</p>
          </div>
          <button type="button" className="primary-action inline-action" onClick={saveCurrentBudget}>
            {activeBudgetId ? 'Atualizar orçamento' : 'Salvar orçamento'}
          </button>
        </div>

        <div className="saved-budget-list">
          {savedBudgets.length === 0 ? (
            <div className="empty-budget">Nenhum orçamento salvo ainda.</div>
          ) : (
            savedBudgets.map((record) => (
              <article className={record.id === activeBudgetId ? 'saved-budget-card active' : 'saved-budget-card'} key={record.id}>
                <button type="button" className="saved-budget-open" onClick={() => openSavedBudget(record)}>
                  <strong>{record.title || 'Orçamento sem título'}</strong>
                  <small>{record.clientName || 'Cliente não informado'}</small>
                  <span>
                    {statusLabel(record.status)} · {formatCurrency(calculateSavedBudgetTotal(record))} · {formatDateTime(record.updatedAt)}
                  </span>
                </button>
                <button type="button" className="saved-budget-delete" onClick={() => removeSavedBudget(record.id)}>
                  Excluir
                </button>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="budget-layout">
        <section className="budget-editor" aria-label="Editor de orçamento">
          <div className="budget-editor-title">
            <h3>Adicionar item</h3>
            <p>Monte serviços, materiais e outros custos. Depois evoluímos isso para PDF e histórico.</p>
          </div>

          <div className="budget-form-grid">
            <label className="budget-field budget-field-wide">
              <span>Descrição</span>
              <input
                placeholder="Ex.: Instalação de tomada dupla"
                value={draft.description}
                onChange={(event) => updateDraft('description', event.target.value)}
              />
            </label>

            <label className="budget-field">
              <span>Qtd.</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={draft.quantity}
                onChange={(event) => updateDraft('quantity', Number(event.target.value))}
              />
            </label>

            <label className="budget-field">
              <span>Valor unitário</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={draft.unitPrice}
                onChange={(event) => updateDraft('unitPrice', Number(event.target.value))}
              />
            </label>

            <label className="budget-field">
              <span>Categoria</span>
              <select value={draft.category} onChange={(event) => updateDraft('category', event.target.value as BudgetCategory)}>
                <option value="labor">Mão de obra</option>
                <option value="material">Material</option>
                <option value="other">Outro</option>
              </select>
            </label>
          </div>

          <div className="budget-actions">
            <button type="button" className="primary-action inline-action" disabled={!canAddItem} onClick={addItem}>
              Adicionar item
            </button>
            <button type="button" className="secondary-action inline-action" onClick={loadStarterItems}>
              Carregar modelo
            </button>
            <button type="button" className="ghost-action" onClick={clearItems}>
              Limpar itens
            </button>
            <button type="button" className="danger-action" onClick={resetBudgetDraft}>
              Novo orçamento
            </button>
          </div>

          <div className="budget-items-list">
            {items.length === 0 ? (
              <div className="empty-budget">Nenhum item adicionado ainda.</div>
            ) : (
              items.map((item) => (
                <article className="budget-item-row" key={item.id}>
                  <div>
                    <strong>{item.description}</strong>
                    <small>
                      {categoryLabel(item.category)} · {item.quantity} × {formatCurrency(item.unitPrice)}
                    </small>
                  </div>
                  <div className="budget-item-total">
                    <span>{formatCurrency(calculateBudgetItemTotal(item))}</span>
                    <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remover ${item.description}`}>
                      Remover
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="budget-summary" aria-label="Resumo do orçamento">
          <span className={`summary-kicker status-${budgetStatus}`}>{statusLabel(budgetStatus)}</span>
          <h3>{budgetTitle || 'Orçamento sem título'}</h3>
          <p>{clientName || 'Cliente não informado'}</p>

          <div className="summary-lines">
            <div>
              <span>Mão de obra</span>
              <strong>{formatCurrency(summary.labor)}</strong>
            </div>
            <div>
              <span>Materiais</span>
              <strong>{formatCurrency(summary.material)}</strong>
            </div>
            <div>
              <span>Outros</span>
              <strong>{formatCurrency(summary.other)}</strong>
            </div>
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(summary.subtotal)}</strong>
            </div>
          </div>

          <label className="budget-field discount-field">
            <span>Desconto</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) => setDiscount(Number(event.target.value))}
            />
          </label>

          <div className="summary-total">
            <span>Total</span>
            <strong>{formatCurrency(summary.total)}</strong>
          </div>

          <div className="technical-warning">
            Você já pode salvar vários orçamentos neste navegador. Próximo passo: gerar PDF e relatório de visita.
          </div>
        </aside>
      </div>
    </div>
  );
}
