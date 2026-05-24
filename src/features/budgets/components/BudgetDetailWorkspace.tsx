import React, { useEffect, useState } from 'react';
import { PanelCard, EmptyState, PrimaryButton, SecondaryButton, Input, TextArea, ListItem, Modal, Select } from '../../../app/components/ui';
import { loadSavedBudgets, saveBudgetRecord } from '../storage/savedBudgetsStorage';
import { duplicateBudget } from '../utils/duplicateBudget';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';
import type { AppTab } from '../../../app/appTypes';
import styles from './BudgetDetailWorkspace.module.css';
import { calculateBudgetTotal } from '../../../core/pricing/budget';

/**
 * UI shell for the internal Budget Detail screen (Rodada 3.1).
 * Adds controlled editing for costs and notes while keeping the rest read‑only.
 */
export function BudgetDetailWorkspace({ budgetId, onNavigate }: { budgetId: string; onNavigate: (tab: AppTab) => void }) {
  const [budget, setBudget] = useState<SavedBudgetRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Temporary edit fields
  const [editDiscount, setEditDiscount] = useState('');
  const [editTravelCost, setEditTravelCost] = useState('');
  const [editAdditionalFees, setEditAdditionalFees] = useState('');
  const [editCommercialNotes, setEditCommercialNotes] = useState('');
  const [editTechnicalNotes, setEditTechnicalNotes] = useState('');

  // Load the budget when the component mounts or the id changes
  useEffect(() => {
    const all = loadSavedBudgets();
    const found = all.find((b) => b.id === budgetId) || null;
    setBudget(found);
  }, [budgetId]);

  // Money formatter used across the app
  const money = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Compute total if we have a budget
  const total = budget
    ? money(
        calculateBudgetTotal({
          id: budget.id,
          title: budget.title,
          status: budget.status,
          discount: budget.discount,
          travelCost: budget.travelCost,
          additionalFees: budget.additionalFees,
          items: budget.items,
        })
      )
    : money(0);

  // When entering edit mode, populate temporary fields
  const startEdit = () => {
    if (!budget) return;
    setEditDiscount(String(budget.discount));
    setEditTravelCost(String(budget.travelCost));
    setEditAdditionalFees(String(budget.additionalFees));
    setEditCommercialNotes(budget.commercialNotes ?? '');
    setEditTechnicalNotes(budget.technicalNotes ?? '');
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const saveEdit = () => {
    if (!budget) return;
    const updated = saveBudgetRecord({
      id: budget.id,
      clientName: budget.clientName,
      title: budget.title,
      status: budget.status,
      discount: Number(editDiscount) || 0,
      travelCost: Number(editTravelCost) || 0,
      additionalFees: Number(editAdditionalFees) || 0,
      commercialNotes: editCommercialNotes,
      technicalNotes: editTechnicalNotes,
      items: budget.items,
    });
    if (updated) {
      setBudget(updated);
      setEditMode(false);
    } else {
      setError('Falha ao salvar as alterações.');
    }
  };

  // Handle duplication of the current budget
  const handleDuplicate = () => {
    if (!budget) return;
    const newRecord = duplicateBudget(budget);
    if (newRecord) {
      // Show success feedback and navigate to the new budget detail if possible
      // For now, we simply alert and navigate back to the list
      setToastMessage('Cópia criada com sucesso.');
      // Optionally navigate to the list of budgets
      if (onNavigate) {
        onNavigate('budgets');
      }
    } else {
      setError('Falha ao duplicar o orçamento.');
    }
  };

  // State for editing a single item
  const [editingItem, setEditingItem] = useState<SavedBudgetRecord['items'][0] | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');

  const startEditItem = (item: SavedBudgetRecord['items'][0]) => {
    setEditingItem(item);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditQuantity(String(item.quantity));
    setEditUnitPrice(String(item.unitPrice));
  };

  const cancelEditItem = () => {
    setEditingItem(null);
  };

  const saveEditItem = () => {
    if (!budget || !editingItem) return;
    const updatedItems = budget.items.map((it) =>
      it.id === editingItem.id
        ? {
            ...it,
            description: editDescription,
            category: editCategory as any,
            quantity: Number(editQuantity) || 0,
            unitPrice: Number(editUnitPrice) || 0,
          }
        : it
    );
    const updated = saveBudgetRecord({
      id: budget.id,
      clientName: budget.clientName,
      title: budget.title,
      status: budget.status,
      discount: budget.discount,
      travelCost: budget.travelCost,
      additionalFees: budget.additionalFees,
      commercialNotes: budget.commercialNotes,
      technicalNotes: budget.technicalNotes,
      items: updatedItems,
    });
    if (updated) {
      setBudget(updated);
      setEditingItem(null);
    } else {
      setError('Falha ao salvar o item.');
    }
  };
  // Render an empty state when the budget cannot be found
  if (!budget) {
    return (
      <EmptyState
        title="Orçamento não encontrado"
        description="O orçamento solicitado não foi encontrado ou foi removido."
      />
    );
  }

  // Determine if editing should be blocked based on status
  const isLocked = ['finalizado', 'cancelado', 'recusado'].includes(budget.status);

  return (
    <div className={styles.container}>
      <PanelCard className={styles.card}>
        <h2 className={styles.title}>Detalhe do Orçamento #{budget.id}</h2>
        {error && <div className={styles.error}>{error}</div>}
        {/* Header – compact, read‑only */}
        <div className={styles.fieldGroup}>
          <label>Título</label>
          <span>{budget.title || 'Sem título'}</span>
        </div>
        <div className={styles.fieldGroup}>
          <label>Cliente</label>
          <span>{budget.clientName || 'Cliente não informado'}</span>
        </div>
        <div className={styles.fieldGroup}>
          <label>Status</label>
          <span>{budget.status}</span>
        </div>
        <div className={styles.fieldGroup}>
          <label>Total</label>
          <strong>{total}</strong>
        </div>
        <hr className={styles.divider} />
        {/* Costs and Notes – possibly editable */}
        {/* Items list */}
        <h3 className={styles.sectionTitle}>Itens</h3>
            {budget.items.map((item) => (
              <div key={item.id} className={styles.itemContainer}>
                <ListItem
                  title={item.description}
                  subtitle={item.category}
                  value={money(item.unitPrice)}
                  status={money(item.unitPrice * item.quantity)}
                  action={!isLocked && (
                    <SecondaryButton onClick={() => startEditItem(item)}>
                      Editar
                    </SecondaryButton>
                  )}
                />
              </div>
            ))}
        <hr className={styles.divider} />
        <div className={styles.fieldGroup}>
          <label>Desconto (%)</label>
          {editMode ? (
            <Input
              type="number"
              value={editDiscount}
              onChange={(e) => setEditDiscount(e.target.value)}
            />
          ) : (
            <span>{budget.discount}%</span>
          )}
        </div>
        <div className={styles.fieldGroup}>
          <label>Custo de Viagem</label>
          {editMode ? (
            <Input
              type="number"
              value={editTravelCost}
              onChange={(e) => setEditTravelCost(e.target.value)}
            />
          ) : (
            <span>{money(budget.travelCost)}</span>
          )}
        </div>
        <div className={styles.fieldGroup}>
          <label>Taxas Adicionais</label>
          {editMode ? (
            <Input
              type="number"
              value={editAdditionalFees}
              onChange={(e) => setEditAdditionalFees(e.target.value)}
            />
          ) : (
            <span>{money(budget.additionalFees)}</span>
          )}
        </div>
        <hr className={styles.divider} />
        <div className={styles.fieldGroup}>
          <label>Notas Comerciais</label>
          {editMode ? (
            <TextArea
              value={editCommercialNotes}
              onChange={(v) => setEditCommercialNotes(v)}
              placeholder="Notas comerciais..."
            />
          ) : (
            <span>{budget.commercialNotes || '—'}</span>
          )}
        </div>
        <div className={styles.fieldGroup}>
          <label>Notas Técnicas</label>
          {editMode ? (
            <TextArea
              value={editTechnicalNotes}
              onChange={(v) => setEditTechnicalNotes(v)}
              placeholder="Notas técnicas..."
            />
          ) : (
            <span>{budget.technicalNotes || '—'}</span>
          )}
        </div>
        {/* Action buttons */}
        <div className={styles.actions}>
        {editMode ? (
          <>
            <SecondaryButton onClick={cancelEdit}>Cancelar</SecondaryButton>
            <PrimaryButton onClick={saveEdit}>Salvar</PrimaryButton>
          </>
        ) : (
          <>
            {/* Edit button only when not locked */}
            {!isLocked && <PrimaryButton onClick={startEdit}>Editar</PrimaryButton>}
            {/* Duplicate button always visible */}
            <SecondaryButton onClick={handleDuplicate}>Duplicar</SecondaryButton>
          </>
        )}
      </div>
        {/* Edit Item Modal */}
        {editingItem && (
          <Modal
            isOpen={!!editingItem}
            title="Editar Item"
            onClose={cancelEditItem}
            onConfirm={saveEditItem}
            confirmLabel="Salvar"
            cancelLabel="Cancelar"
          >
            <div className={styles.fieldGroup}>
              <label>Descrição</label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label>Categoria</label>
              <Select
                value={editCategory}
                onChange={(v) => setEditCategory(v)}
              >
                <option value="labor">Labor</option>
                <option value="material">Material</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div className={styles.fieldGroup}>
              <label>Quantidade</label>
              <Input type="number" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label>Valor unitário</label>
              <Input type="number" value={editUnitPrice} onChange={(e) => setEditUnitPrice(e.target.value)} />
            </div>
          </Modal>
        )}
      </PanelCard>
    </div>
  );
}
