import React from 'react';
import { StatusBadge as BaseStatusBadge } from '../../../app/components/ui';
import styles from './BudgetStatusBadge.module.css';

/** BudgetStatusBadge – wrapper around shared StatusBadge with design‑system classes */
export const BudgetStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={styles.wrapper}>
    <BaseStatusBadge status={status} />
  </span>
);
