import React from 'react';
import { BackButton } from '../../../app/components/ui';
import { BudgetStatusBadge } from './BudgetStatusBadge';
import styles from './BudgetHeaderCard.module.css';

/**
 * BudgetHeaderCard – displays title, client, status badge, total and budget ID.
 */
export const BudgetHeaderCard: React.FC<{
  budgetId: string;
  title: string;
  clientName: string;
  status: string;
  total: string;
  onBack: () => void;
}> = ({ budgetId, title, clientName, status, total, onBack }) => (
  <div className={styles.container}>
    <BackButton label="Voltar" onClick={onBack} />
    <h1 className={styles.title}>Detalhe do orçamento</h1>
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Detalhe do Orçamento</h2>
      <p className={styles.id}>ID: {budgetId}</p>
      <div className={styles.fieldGroup}>
        <label>Título</label>
        <span>{title || 'Sem título'}</span>
      </div>
      <div className={styles.fieldGroup}>
        <label>Cliente</label>
        <span>{clientName || 'Cliente não informado'}</span>
      </div>
      <div className={styles.fieldGroup}>
        <label>Status</label>
        <BudgetStatusBadge status={status} />
      </div>
      <div className={styles.fieldGroup}>
        <label>Total</label>
        <strong className={styles.totalValue}>{total}</strong>
      </div>
    </div>
  </div>
);
