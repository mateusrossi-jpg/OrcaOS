import React from 'react';
import { PrimaryButton } from '../../../app/components/ui';
import styles from './BudgetActionsBar.module.css';

/**
 * BudgetActionsBar – renders Edit action and conditional Create Version action.
 */
export const BudgetActionsBar: React.FC<{
  onEdit: () => void;
  onCreateVersion?: () => void;
  disabled: boolean;
  showCreateVersion?: boolean;
}> = ({ onEdit, onCreateVersion, disabled, showCreateVersion }) => (
  <div className={styles.container}>
    <PrimaryButton className={styles.button} onClick={onEdit} disabled={disabled}>
      Editar
    </PrimaryButton>
    {showCreateVersion && onCreateVersion && (
      <PrimaryButton className={styles.button} onClick={onCreateVersion} disabled={disabled}>
        Criar nova versão
      </PrimaryButton>
    )}
  </div>
);
