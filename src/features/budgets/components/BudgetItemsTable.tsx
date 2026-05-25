import React from 'react';
import { SecondaryButton, DangerButton } from '../../../app/components/ui';
import styles from './BudgetItemsTable.module.css';
import type { SavedBudgetRecord } from '../storage/savedBudgetsStorage';

/**
 * BudgetItemsTable – renders the list of items.
 * Desktop: grid/table layout (horizontal).
 * Mobile (<768px): each item becomes a stacked card.
 */
export const BudgetItemsTable: React.FC<{
  items: SavedBudgetRecord['items'];
  onEditItem: (item: SavedBudgetRecord['items'][0]) => void;
  onDeleteItem: (item: SavedBudgetRecord['items'][0]) => void;
  isLocked: boolean;
}> = ({ items, onEditItem, onDeleteItem, isLocked }) => (
  <div className={styles.wrapper}>
    {/* Header row – only visible on desktop */}
    <div className={styles.headerRow}>
      <div className={styles.header}>Descrição</div>
      <div className={styles.header}>Qtd.</div>
      <div className={styles.header}>Valor</div>
      <div className={styles.header}>Ações</div>
    </div>
    {items.map((item) => (
      <div className={styles.itemCard} key={item.id}>
        <div className={styles.description}>{item.description}</div>
        <div className={styles.metaRow}>
          <div className={styles.quantity}>Qtd: {item.quantity}</div>
          <div className={styles.value}>Valor: R$ {(item.unitPrice * item.quantity).toFixed(2)}</div>
        </div>
        <div className={styles.actionsRow}>
          {!isLocked && (
            <>
              <SecondaryButton onClick={() => onEditItem(item)}>Editar</SecondaryButton>
              <DangerButton onClick={() => onDeleteItem(item)}>Remover</DangerButton>
            </>
          )}
        </div>
      </div>
    ))}
  </div>
);
