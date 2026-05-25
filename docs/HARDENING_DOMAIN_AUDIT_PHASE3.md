# Relatório de Consolidação do Domínio de Orçamento (Fase 3)

## 1. Duplicações Encontradas (Calculators)
A lógica matemática em torno de "Budget" e "Margin" está severamente fragmentada e, em alguns casos, inacessível:
- **`app/screens/HomeScreen.tsx`:** Implementa uma função inline `calculateSavedBudgetValue` para calcular totais (violação arquitetural clássica - regra de negócio na UI).
- **`services/BudgetCalculatorService.ts`:** Classe singleton que calcula totais, porém está cheia de erros de tipagem (`additionalFees` possivelmente `undefined`, problemas com tipos de retorno).
- **Arquivos Fantasmas / Módulos Removidos:** 
  - Vários componentes e hooks (`useBudgetForm.ts`, `BudgetHistoryPage.tsx`, `budgetService.ts`) tentam importar `calculateBudget` de `src/domain/aferixFinanceEngine.ts`, **que não existe**.
  - Componentes de UI e testes (ex: `BudgetPrintPreview.tsx`) tentam importar `calculateBudgetItemTotal` de `src/core/pricing/budget`, **que também não existe**.
- **Lógica Auxiliar:** Existem cálculos auxiliares de trade/margem em `src/core/calculations/trade.ts` e `src/core/finance/projectMargin.ts`, que operam paralelamente ao budget.

## 2. Normalizadores e Mapeadores
- Encontrado `mapToNewBudget` em `src/features/budgets/storage/savedBudgetsStorage.ts` para migrar do formato antigo (localStorage) para o formato "Novo" (usado na Dexie). Essa lógica pertence a adaptadores, mas foi colocada no storage legado.

## 3. Risco da Duplicidade e das Inconsistências
- **Risco Altíssimo:** A build (`typecheck`) está falhando neste momento porque componentes dependem de arquivos apagados (`aferixFinanceEngine.ts` e `core/pricing/budget.ts`).
- **Inconsistência Financeira:** Com cálculos no `HomeScreen`, `BudgetCalculatorService` e (teoricamente) no `aferixFinanceEngine`, há uma garantia de que orçamentos darão valores diferentes dependendo da tela.
- **Corrupção Silenciosa:** Fallbacks que assumem tipos, campos que são somados ignorando `undefined` (como relatado no TypeScript: `'additionalFees' is possibly 'undefined'`).

## 4. Proposta Mínima de Consolidação
1. **Restaurar/Criar a Single Source of Truth:** Criar de fato o `src/domain/aferixFinanceEngine.ts` ou estabilizar o `BudgetCalculatorService.ts` e tornar um deles a **ÚNICA** forma de calcular totais e margens de um Budget, importada através de Domain Services.
2. **Remover lógicas inline:** Excluir funções como `calculateSavedBudgetValue` do `HomeScreen` e de quaisquer outras Views.
3. **Tipagem Estrita:** No calculador unificado, garantir conversão de `undefined` para `0` antes de cálculos (Runtime Invariants).
4. **Alinhar Testes:** Atualizar o `budget-calculation.test.ts` para apontar para o novo Engine consolidado.

A base está perigosa e o build está quebrado devido a "refatorações fantasmas". Precisamos limpar esses buracos nas próximas fases.
