// src/features/budgets/components/BudgetDetailWorkspace.tsx
import React, { useEffect, useState } from 'react';
import {
  PanelCard,
  EmptyState,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  Input,
  TextArea,
  Modal,
  Select,
  ConfirmModal,
  StatusBadge,
  BackButton,
} from '../../../app/components/ui';
import { loadSavedBudgets, saveBudgetRecord } from '../storage/savedBudgetsStorage';
import { duplicateBudget } from '../utils/duplicateBudget';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';
import type { AppTab } from '../../../app/appTypes';
import styles from './BudgetDetailWorkspace.module.css';
import { calculateBudgetTotal } from '../../../core/pricing/budget';

/** UI for Budget Detail (premium redesign) */
export function BudgetDetailWorkspace({
  budgetId,
  onNavigate,
}: {
  budgetId: string;
  onNavigate: (tab: AppTab) => void;
}) {
  const [budget, setBudget] = useState<SavedBudgetRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Temp edit fields
  const [editDiscount, setEditDiscount] = useState('');
  const [editTravelCost, setEditTravelCost] = useState('');
  const [editAdditionalFees, setEditAdditionalFees] = useState('');
  const [editCommercialNotes, setEditCommercialNotes] = useState('');
  const [editTechnicalNotes, setEditTechnicalNotes] = useState('');

  // Load budget
  useEffect(() => {
    const all = loadSavedBudgets();
    const found = all.find((b) => b.id === budgetId) || null;
    setBudget(found);
  }, [budgetId]);

  const money = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const total = budget ? money(calculateBudgetTotal({
    id: budget.id,
    title: budget.title,
    status: budget.status,
    discount: budget.discount,
    travelCost: budget.travelCost,
    additionalFees: budget.additionalFees,
    items: budget.items,
  })) : money(0);

  const startEdit = () => {
    if (!budget) return;
    setEditDiscount(String(budget.discount));
    setEditTravelCost(String(budget.travelCost));
    setEditAdditionalFees(String(budget.additionalFees));
    setEditCommercialNotes(budget.commercialNotes ?? '');
    setEditTechnicalNotes(budget.technicalNotes ?? '');
    setEditMode(true);
  };

  const cancelEdit = () => setEditMode(false);

  const saveEdit = () => {
    if (!budget) return;
    const updated = saveBudgetRecord({
      ...budget,
      discount: Number(editDiscount) || 0,
      travelCost: Number(editTravelCost) || 0,
      additionalFees: Number(editAdditionalFees) || 0,
      commercialNotes: editCommercialNotes,
      technicalNotes: editTechnicalNotes,
    });
    if (updated) {
      setBudget(updated);
      setEditMode(false);
    } else {
      setError('Falha ao salvar as alterações.');
    }
  };

  const handleDuplicate = () => {
    if (!budget) return;
    const newRecord = duplicateBudget(budget);
    if (newRecord) {
      setToastMessage('Cópia criada com sucesso.');
      onNavigate('budgets');
    } else {
      setError('Falha ao duplicar o orçamento.');
    }
  };

  // Item editing state
  const [editingItem, setEditingItem] = useState<SavedBudgetRecord['items'][0] | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');

  // Adding item state
  const [addingItem, setAddingItem] = useState(false);
  const [addDescription, setAddDescription] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [addUnitPrice, setAddUnitPrice] = useState('');

  // Delete confirmation
  const [deletingItem, setDeletingItem] = useState<SavedBudgetRecord['items'][0] | null>(null);

  const startEditItem = (item: SavedBudgetRecord['items'][0]) => {
    setEditingItem(item);
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditQuantity(String(item.quantity));
    setEditUnitPrice(String(item.unitPrice));
  };
  const cancelEditItem = () => setEditingItem(null);
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
        : it,
    );
    const updated = saveBudgetRecord({ ...budget, items: updatedItems });
    if (updated) {
      setBudget(updated);
      setEditingItem(null);
    } else {
      setError('Falha ao salvar o item.');
    }
  };

  const startAddItem = () => {
    setAddDescription('');
    setAddCategory('');
    setAddQuantity('');
    setAddUnitPrice('');
    setAddingItem(true);
  };
  const cancelAddItem = () => setAddingItem(false);
  const saveAddItem = () => {
    if (!budget) return;
    const newItem = {
      id: Date.now().toString(),
      description: addDescription,
      category: addCategory as any,
      quantity: Number(addQuantity) || 0,
      unitPrice: Number(addUnitPrice) || 0,
    };
    const updated = saveBudgetRecord({ ...budget, items: [...budget.items, newItem] });
    if (updated) {
      setBudget(updated);
      setAddingItem(false);
    } else {
      setError('Falha ao adicionar o item.');
    }
  };

  const startDeleteItem = (item: SavedBudgetRecord['items'][0]) => setDeletingItem(item);
  const cancelDeleteItem = () => setDeletingItem(null);
  const confirmDeleteItem = () => {
    if (!budget || !deletingItem) return;
    const updated = saveBudgetRecord({
      ...budget,
      items: budget.items.filter((it) => it.id !== deletingItem.id),
    });
    if (updated) {
      setBudget(updated);
      setDeletingItem(null);
    } else {
      setError('Falha ao remover o item.');
    }
  };

  if (!budget) {
    return (
      <EmptyState
        title="Orçamento não encontrado"
        description="O orçamento solicitado não foi encontrado ou foi removido."
      />
    );
  }

  const isLocked = ['finalizado', 'cancelado', 'recusado'].includes(budget.status);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerBar}>
        <BackButton
          label="Voltar"
          onClick={() => onNavigate('budgets')}
        />
        <h1 className={styles.pageTitle}>Detalhe do orçamento</h1>
      </div>

      <PanelCard className={styles.card}>
        <h2 className={styles.cardTitle}>Detalhe do Orçamento</h2>
        <p className={styles.cardId}>ID: {budget.id}</p>
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
          <StatusBadge status={budget.status} />
        </div>
        <div className={styles.fieldGroup}>
          <label>Total</label>
          <strong className={styles.totalValue}>{total}</strong>
        </div>
        <hr className={styles.divider} />
        {/* Items Table */}
        <h3 className={styles.sectionTitle}>Itens</h3>
        <div className={styles.itemTable}>
          <div className={styles.itemHeader}>Descrição</div>
          <div className={styles.itemHeader}>Qtd.</div>
          <div className={styles.itemHeader}>Valor</div>
          {budget.items.map((item) => (
            <React.Fragment key={item.id}>
              <div className={styles.itemDescription}>{item.description}</div>
              <div className={styles.itemQuantity}>{item.quantity}</div>
              <div className={styles.itemValue}>{money(item.unitPrice * item.quantity)}</div>
              {/* Action row */}
              {!isLocked && (
                <div className={styles.itemActions}>
                  <SecondaryButton onClick={() => startEditItem(item)}>Editar</SecondaryButton>
                  <DangerButton onClick={() => startDeleteItem(item)}>Remover</DangerButton>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {!isLocked && (
          <div className={styles.addItemContainer}>
            <PrimaryButton onClick={startAddItem}>Adicionar item</PrimaryButton>
          </div>
        )}
        <hr className={styles.divider} />
        {/* Costs and notes */}
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
              {!isLocked && <PrimaryButton onClick={startEdit}>Editar</PrimaryButton>}
              <SecondaryButton onClick={handleDuplicate}>Duplicar</SecondaryButton>
            </>
          )}
        </div>
        {/* Modals */}
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
              <Select value={editCategory} onChange={(v) => setEditCategory(v)}>
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
        {addingItem && (
          <Modal
            isOpen={addingItem}
            title="Adicionar Item"
            onClose={cancelAddItem}
            onConfirm={saveAddItem}
            confirmLabel="Salvar"
            cancelLabel="Cancelar"
          >
            <div className={styles.fieldGroup}>
              <label>Descrição</label>
              <Input value={addDescription} onChange={(e) => setAddDescription(e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label>Categoria</label>
              <Select value={addCategory} onChange={(v) => setAddCategory(v)}>
                <option value="labor">Labor</option>
                <option value="material">Material</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div className={styles.fieldGroup}>
              <label>Quantidade</label>
              <Input type="number" value={addQuantity} onChange={(e) => setAddQuantity(e.target.value)} />
            </div>
            <div className={styles.fieldGroup}>
              <label>Valor unitário</label>
              <Input type="number" value={addUnitPrice} onChange={(e) => setAddUnitPrice(e.target.value)} />
            </div>
          </Modal>
        )}
        {deletingItem && (
          <ConfirmModal
            isOpen={!!deletingItem}
            title="Remover Item"
            onClose={cancelDeleteItem}
            onConfirm={confirmDeleteItem}
            confirmLabel="Remover"
            cancelLabel="Cancelar"
          >
            <p>Remover este item do orçamento?</p>
          </ConfirmModal>
        )}
      </PanelCard>
    </div>
  );
}
