// src/features/budgets/components/BudgetDetailWorkspace.tsx
import React, { useEffect, useState } from 'react';
import { PrimaryButton, SecondaryButton, PanelCard, Select } from '../../../app/components/ui';
import { InputAdapter as Input, TextAreaAdapter as TextArea } from '../../../app/components/ui/Adapter';
import { loadSavedBudgets, saveBudgetRecord, deleteSavedBudget } from '../storage/savedBudgetsStorage';
import type { SavedBudgetRecord, SavedBudgetStatus } from '../storage/savedBudgetsStorage';
import type { AppTab } from '../../../app/appTypes';
import styles from './BudgetDetailWorkspace.module.css';

interface BudgetDetailWorkspaceProps {
  /** The id of the budget to display */
  budgetId: string;
  /** Callback to navigate after actions (e.g., back, delete) */
  onNavigate: (tab: AppTab) => void;
}

export function BudgetDetailWorkspace({ budgetId, onNavigate }: BudgetDetailWorkspaceProps) {
  const [budget, setBudget] = useState<SavedBudgetRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load budget on mount / id change
  useEffect(() => {
    const all = loadSavedBudgets();
    const found = all.find((b) => b.id === budgetId) || null;
    setBudget(found);
  }, [budgetId]);

  // Handlers for editable fields – receive value directly
  const handleChange = (field: keyof SavedBudgetRecord) => (value: string) => {
    if (!budget) return;
    const parsed = (field === 'discount' || field === 'travelCost' || field === 'additionalFees') ? Number(value) : value;
    setBudget({ ...budget, [field]: parsed });
  };

  const handleStatusChange = (value: string) => {
    if (!budget) return;
    const status = value as SavedBudgetStatus;
    setBudget({ ...budget, status });
  };

// Duplicate component code removed

  const save = async () => {
    if (!budget) return;
    setIsSaving(true);
    setError(null);
    const saved = saveBudgetRecord({
      id: budget.id,
      clientName: budget.clientName,
      title: budget.title,
      status: budget.status,
      discount: budget.discount,
      travelCost: budget.travelCost,
      additionalFees: budget.additionalFees,
      paymentTerms: budget.paymentTerms,
      validity: budget.validity,
      guarantee: budget.guarantee,
      executionDeadline: budget.executionDeadline,
      commercialNotes: budget.commercialNotes,
      technicalNotes: budget.technicalNotes,
      items: budget.items,
    });
    if (!saved) {
      setError('Falha ao salvar o orçamento.');
    } else {
      setBudget(saved);
    }
    setIsSaving(false);
  };

  const deleteBudget = () => {
    if (!budget) return;
    const confirmed = window.confirm('Deseja realmente excluir este orçamento? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    deleteSavedBudget(budget.id);
    // Return to history screen
    onNavigate('work-history');
  };

  const exportPdf = () => {
    // Placeholder – actual PDF generation is handled elsewhere in the app.
    alert('Exportar PDF ainda não está implementado.');
  };

  if (!budget) {
    return <div className={styles.empty}>Orçamento não encontrado.</div>;
  }

  const statusOptions: SavedBudgetStatus[] = ['iniciado', 'em_revisao', 'enviado', 'autorizado', 'em_execucao', 'finalizado', 'recusado', 'cancelado'];

  return (
    <div className={styles.container}>
      <PanelCard className={styles.card}>
        <h2 className={styles.title}>Detalhe do Orçamento #{budget.id}</h2>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.fieldGroup}>
          <label>Título</label>
          <Input value={budget.title} onValueChange={handleChange('title')} />
        </div>
        <div className={styles.fieldGroup}>
          <label>Status</label>
          <Select value={budget.status} onChange={handleStatusChange}>
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.fieldGroup}>
          <label>Desconto (%)</label>
          <Input type="number" value={budget.discount} onValueChange={handleChange('discount')} />
        </div>
        <div className={styles.fieldGroup}>
          <label>Custos de Viagem</label>
          <Input type="number" value={budget.travelCost} onValueChange={handleChange('travelCost')} />
        </div>
        <div className={styles.fieldGroup}>
          <label>Taxas Adicionais</label>
          <Input type="number" value={budget.additionalFees} onValueChange={handleChange('additionalFees')} />
        </div>
        <div className={styles.fieldGroup}>
          <label>Notas Comerciais</label>
          <TextArea rows={3} value={budget.commercialNotes} onValueChange={handleChange('commercialNotes')} />
        </div>
        <div className={styles.fieldGroup}>
          <label>Notas Técnicas</label>
          <TextArea rows={3} value={budget.technicalNotes} onValueChange={handleChange('technicalNotes')} />
        </div>
        <div className={styles.actions}>
          <PrimaryButton onClick={save} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </PrimaryButton>
          <SecondaryButton onClick={exportPdf}>Exportar PDF</SecondaryButton>
          <SecondaryButton onClick={deleteBudget} className={styles.deleteBtn}>
            Excluir
          </SecondaryButton>
        </div>
      </PanelCard>
    </div>
  );
}
