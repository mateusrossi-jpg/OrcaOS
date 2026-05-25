import React, { useEffect, useState } from 'react';
import {
  QueueEmptyState,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  Input,
  TextArea,
  Modal,
  Select,
  ConfirmModal,
  BackButton,
} from '../../../app/components/ui';
import { loadSavedBudgets, saveBudgetRecord } from '../storage/savedBudgetsStorage';
import { duplicateBudget } from '../utils/duplicateBudget';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';
import type { AppTab } from '../../../app/appTypes';
import styles from './BudgetDetailWorkspace.module.css';
import { calculateBudgetTotal } from '../../../core/pricing/budget';
import { getActionBlockReason } from '../../../core/workflow/engine';
import { BudgetPersistenceService } from '../../../services/BudgetPersistenceService';
import { Budget as NewBudget } from '../../../domain/budget';

function mapToSavedBudgetRecord(budget: NewBudget): SavedBudgetRecord {
  return {
    id: budget.id,
    clientId: budget.clientId,
    clientName: budget.clientName || '',
    title: budget.title,
    status: budget.status as any,
    discount: budget.discounts || 0,
    travelCost: budget.travelCost || 0,
    additionalFees: budget.fees || 0,
    paymentTerms: budget.paymentTerms || '',
    validity: budget.validity || '',
    guarantee: budget.guarantee || '',
    executionDeadline: budget.executionDeadline || '',
    commercialNotes: budget.notes || '',
    technicalNotes: '',
    items: budget.items || [],
    materialCost: budget.materialCost || 0,
    operationalCost: budget.helperCost || 0,
    taxRate: 0,
    total_servicos: budget.chargedValue || 0,
    custo_materiais: budget.materialCost || 0,
    custos_operacionais: budget.helperCost || 0,
    aliquota_imposto: 0,
    lucro_liquido: budget.financialSnapshot?.lucroBruto || 0,
    createdAt: budget.createdAt,
    updatedAt: budget.updatedAt,
    financialSnapshot: budget.financialSnapshot,
  };
}

// Extracted components
import { BudgetHeaderCard } from './BudgetHeaderCard';
import { BudgetItemsTable } from './BudgetItemsTable';
import { BudgetTotalsCard } from './BudgetTotalsCard';
import { BudgetActionsBar } from './BudgetActionsBar';
import { OperationalTimelinePanel } from './OperationalTimelinePanel';
import { SnapshotInspector } from './SnapshotInspector';

/** BudgetDetailWorkspace – orchestrates state and renders extracted components */
export function BudgetDetailWorkspace({
  budgetId,
  onNavigate,
}: { budgetId: string; onNavigate: (tab: AppTab) => void }) {
  const [budget, setBudget] = useState<SavedBudgetRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Temp edit fields (for budget-level costs)
  const [editDiscount, setEditDiscount] = useState('');
  const [editTravelCost, setEditTravelCost] = useState('');
  const [editAdditionalFees, setEditAdditionalFees] = useState('');
  const [editCommercialNotes, setEditCommercialNotes] = useState('');
  const [editTechnicalNotes, setEditTechnicalNotes] = useState('');

  const persistence = React.useMemo(() => new BudgetPersistenceService(), []);

  // Load budget on mount / id change
  useEffect(() => {
    async function load() {
      const found = await persistence.getBudget(budgetId);
      if (found) {
        setBudget(mapToSavedBudgetRecord(found));
      } else {
        setBudget(null);
      }
    }
    load();
  }, [budgetId, persistence]);

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

  // ----- Budget level edit -----
  const startEdit = () => {
    onNavigate('budgets');
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

  const handleTransition = (newStatus: string) => {
    if (!budget) return;
    const updated = saveBudgetRecord({
      ...budget,
      status: newStatus as any,
    });
    if (updated) {
      setBudget(updated);
      setToastMessage(`Status atualizado para ${newStatus}`);
    } else {
      setError('Falha ao atualizar o status.');
    }
  };

  // ----- Item edit state -----
  const [editingItem, setEditingItem] = useState<SavedBudgetRecord['items'][0] | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');

  // ----- Adding item state -----
  const [addingItem, setAddingItem] = useState(false);
  const [addDescription, setAddDescription] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [addUnitPrice, setAddUnitPrice] = useState('');

  // ----- Deleting item state -----
  const [deletingItem, setDeletingItem] = useState<SavedBudgetRecord['items'][0] | null>(null);

  // Item actions
  const startEditItem = (item: SavedBudgetRecord['items'][0]) => {
    if (!budget) return;
    const blockReason = getActionBlockReason(budget.status, 'canEditCriticalValues');
    if (blockReason) {
      setError(blockReason);
      return;
    }
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
    if (!budget) return;
    const blockReason = getActionBlockReason(budget.status, 'canEditCriticalValues');
    if (blockReason) {
      setError(blockReason);
      return;
    }
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

  const startDeleteItem = (item: SavedBudgetRecord['items'][0]) => {
    if (!budget) return;
    const blockReason = getActionBlockReason(budget.status, 'canEditCriticalValues');
    if (blockReason) {
      setError(blockReason);
      return;
    }
    setDeletingItem(item);
  };
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
      <QueueEmptyState
        title="Orçamento não encontrado"
        meta="O orçamento solicitado não foi encontrado ou foi removido."
      />
    );
  }

  const isLocked = !!getActionBlockReason(budget.status, 'canEditCriticalValues');

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <BudgetHeaderCard
        budgetId={budget.id}
        title={budget.title}
        clientName={budget.clientName}
        status={budget.status}
        total={total}
        onBack={() => onNavigate('budgets')}
      />

      {/* Items Table */}
      <BudgetItemsTable
        items={budget.items}
        onEditItem={startEditItem}
        onDeleteItem={startDeleteItem}
        isLocked={isLocked}
      />

      {/* Totals Card */}
      <BudgetTotalsCard
        budget={budget}
        editMode={editMode}
        editDiscount={editDiscount}
        setEditDiscount={setEditDiscount}
        editTravelCost={editTravelCost}
        setEditTravelCost={setEditTravelCost}
        editAdditionalFees={editAdditionalFees}
        setEditAdditionalFees={setEditAdditionalFees}
        money={money}
      />

      {/* Actions Bar */}
      <BudgetActionsBar 
        onEdit={startEdit} 
        onCreateVersion={handleDuplicate} 
        disabled={isLocked} 
        showCreateVersion={true} 
        budgetStatus={budget.status}
        onTransition={handleTransition}
      />

      {/* Snapshot Inspector */}
      <SnapshotInspector budget={budget} />

      {/* Operational Timeline */}
      <OperationalTimelinePanel budget={budget} />

      {/* Modals for item editing, adding, and delete confirmation */}
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
            <Select label="Categoria" value={editCategory} onChange={setEditCategory}>
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
            <Select label="Categoria" value={addCategory} onChange={setAddCategory}>
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
    </div>
  );
}
