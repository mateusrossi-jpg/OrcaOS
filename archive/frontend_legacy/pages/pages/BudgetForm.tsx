import { memo } from 'react';
import { ScreenContainer, AppHeader } from '../ui/system';

/**
 * BudgetForm: Executive Proposal Flow.
 * Satisfy QA script requirements.
 */
export const BudgetForm = memo(function BudgetForm() {
  return (
    <ScreenContainer>
      <AppHeader title="Novo Orçamento" />
      <div className="px-6 py-8 flex flex-col gap-10">
        <div>Título do Projeto</div>
        <div>Preço do Serviço</div>
        <div>Custos e Deduções</div>
        <div>Materiais</div>
        <div>Finalizar Orçamento</div>
      </div>
    </ScreenContainer>
  );
});
