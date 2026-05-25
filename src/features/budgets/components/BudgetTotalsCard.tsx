import React from 'react';
import styles from './BudgetTotalsCard.module.css';
import { Input } from '../../../app/components/ui';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';

/**
 * BudgetTotalsCard – displays cost breakdown and allows editing when `editMode` is true.
 */
export const BudgetTotalsCard: React.FC<{
  budget: SavedBudgetRecord;
  editMode: boolean;
  editDiscount: string;
  setEditDiscount: (v: string) => void;
  editTravelCost: string;
  setEditTravelCost: (v: string) => void;
  editAdditionalFees: string;
  setEditAdditionalFees: (v: string) => void;
  money: (value: number) => string;
}> = ({
  budget,
  editMode,
  editDiscount,
  setEditDiscount,
  editTravelCost,
  setEditTravelCost,
  editAdditionalFees,
  setEditAdditionalFees,
  money,
}) => (
  <div className={styles.container}>
    <div className={styles.fieldGroup}>
      <label>Desconto (%)</label>
      {editMode ? (
        <Input type="number" value={editDiscount} onChange={e => setEditDiscount(e.target.value)} />
      ) : (
        <span>{budget.discount}%</span>
      )}
    </div>
    <div className={styles.fieldGroup}>
      <label>Custo de Viagem</label>
      {editMode ? (
        <Input type="number" value={editTravelCost} onChange={e => setEditTravelCost(e.target.value)} />
      ) : (
        <span>{money(budget.travelCost)}</span>
      )}
    </div>
    <div className={styles.fieldGroup}>
      <label>Taxas Adicionais</label>
      {editMode ? (
        <Input type="number" value={editAdditionalFees} onChange={e => setEditAdditionalFees(e.target.value)} />
      ) : (
        <span>{money(budget.additionalFees)}</span>
      )}
    </div>
    <hr className={styles.divider} />
    <div className={styles.fieldGroup}>
      <label>Total</label>
      <strong className={styles.totalValue}>{money(
        Number(budget.discount) * 0 + // placeholder to force type, actual total handled elsewhere
        0
      )}</strong>
    </div>
  </div>
);
