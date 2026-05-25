import React from 'react';
import { PrimaryButton, SecondaryButton } from '../../../app/components/ui';
import styles from './BudgetActionsBar.module.css';
import { ALLOWED_TRANSITIONS, getActionBlockReason } from '../../../core/workflow/engine';

/**
 * BudgetActionsBar – renders Edit action and conditional Create Version action.
 */
export const BudgetActionsBar: React.FC<{
  onEdit: () => void;
  onCreateVersion?: () => void;
  disabled: boolean;
  showCreateVersion?: boolean;
  budgetStatus: string;
  onTransition: (status: string) => void;
}> = ({ onEdit, onCreateVersion, disabled, showCreateVersion, budgetStatus, onTransition }) => {
  const allowed = ALLOWED_TRANSITIONS[budgetStatus] || [];
  
  const criticalBlockReason = getActionBlockReason(budgetStatus, 'canEditCriticalValues');
  const operationalBlockReason = getActionBlockReason(budgetStatus, 'canEditOperational');
  const isFinalized = budgetStatus === 'finalizado' || budgetStatus === 'arquivado';

  let lockTitle = '';
  if (isFinalized) lockTitle = 'Orçamento finalizado';
  else if (operationalBlockReason) lockTitle = 'Edição bloqueada';
  else if (criticalBlockReason) lockTitle = 'Valores bloqueados';

  return (
    <div className={styles.wrapper}>
      {lockTitle && (
        <div className={styles.lockIndicator} title={operationalBlockReason || criticalBlockReason || ''}>
          <span className={styles.lockIcon}>🔒</span>
          <div className={styles.lockText}>
            <strong>{lockTitle}</strong>
            <span>{operationalBlockReason || criticalBlockReason}</span>
          </div>
        </div>
      )}
      <div className={styles.container}>
        <SecondaryButton className={styles.button} onClick={onEdit} disabled={disabled}>
          Editar
        </SecondaryButton>
      
      {allowed.includes('enviado') && (
        <PrimaryButton className={styles.button} onClick={() => onTransition('enviado')}>
          Enviar
        </PrimaryButton>
      )}
      {allowed.includes('autorizado') && (
        <PrimaryButton className={styles.button} onClick={() => onTransition('autorizado')}>
          Autorizar
        </PrimaryButton>
      )}
      {allowed.includes('em_execucao') && (
        <PrimaryButton className={styles.button} onClick={() => onTransition('em_execucao')}>
          Iniciar execução
        </PrimaryButton>
      )}
      {allowed.includes('finalizado') && (
        <PrimaryButton className={styles.button} onClick={() => onTransition('finalizado')}>
          Finalizar
        </PrimaryButton>
      )}
      {allowed.includes('arquivado') && (
        <SecondaryButton className={styles.button} onClick={() => onTransition('arquivado')}>
          Arquivar
        </SecondaryButton>
      )}

      {showCreateVersion && onCreateVersion && (
        <SecondaryButton className={styles.button} onClick={onCreateVersion}>
          Criar nova versão
        </SecondaryButton>
      )}
      </div>
    </div>
  );
};
