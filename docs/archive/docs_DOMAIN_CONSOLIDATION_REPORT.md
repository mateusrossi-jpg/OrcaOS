# Relatório de Auditoria e Consolidação de Domínio (Orçamento)

## 1. Tipos e Entidades (BudgetItem, BudgetStatus, Budget)
- **Onde há duplicidade:**
  - `src/core/types/business.ts` (Tipagem rica e complexa, com campos de UI/PDF, 'templateId' e status de ciclo de vida misturados com legados como 'draft', 'em_execucao').
  - `src/domain/budget.ts` (Tipagem simplificada, focada em snapshots financeiros e agregados; status divergentes como 'execucao' e constante `BUDGET_STATUS`).
- **Risco da duplicidade:** Inconsistência de dados ao transitar da interface/storage para o motor de cálculos (domain). Pode causar corrupção de status ao salvar, perda de propriedades cruciais para o catálogo (`sourceId`, `catalogId`), e erros de *type mismatch*.
- **Impacto:** Alto. Código frágil que demanda type casts ou conversões manuais espalhadas na aplicação. Manutenção dupla ao adicionar novos campos em um orçamento.
- **Proposta Mínima de Consolidação:** 
  1. Eleger um único arquivo (ex: `domain/budget.ts`) como o *Single Source of Truth* para a interface `Budget`, `BudgetItem` e `BudgetStatus`.
  2. Unificar a nomenclatura de status ('em_execucao' vs 'execucao') e utilizar os tipos legados estritamente na camada de Storage via Data Mappers, nunca vazando para o motor de domínio ou UI.

## 2. Lógica de Cálculo (Calculators)
- **Onde há duplicidade:**
  - `src/core/pricing/budget.ts`: Calcula o subtotal e total comercial iterando pelos `items` do orçamento e aplicando descontos/taxas.
  - `src/domain/aferixFinanceEngine.ts`: Possui uma função `calculateBudget(inputs: BudgetInputs)` isolada, que ignora os itens reais e foca no custo agregado vs valor cobrado (`chargedValue`), para gerar margem e lucro.
- **Risco da duplicidade:** Falta de amarração estrita. O valor gerado pela UI na aba "Itens" pode divergir do valor usado na aba "Simulador de Lucro" se não houver um *Mapper* garantindo que `chargedValue === calculateBudgetTotal(budget)`.
- **Impacto:** Crítico. O cliente pode apresentar um orçamento de R$ 1.000, mas o motor calcular margem sobre R$ 900 devido a uma taxa adicional desconsiderada pelos `BudgetInputs`.
- **Proposta Mínima de Consolidação:** 
  1. Eliminar a passagem manual de `BudgetInputs` avulsos na interface.
  2. O `aferixFinanceEngine` (`calculateBudget`) deve receber o objeto `Budget` unificado completo, extrair os totais e custos automaticamente consumindo as funções de `core/pricing/budget.ts`, e devolver o *Snapshot Financeiro* atualizado, sendo a ÚNICA via oficial de obtenção de margem e lucro no app.