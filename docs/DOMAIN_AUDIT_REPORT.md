# Relatório de Auditoria Total do Domínio (DOMAIN_AUDIT_REPORT)

## 1. Entidades e Status (Budget & BudgetStatus)
- **Onde foi encontrado:**
  - `src/core/types/business.ts`: Define `CoreBudgetStatus`, `LegacyBudgetStatus` e exporta o union `BudgetStatus`. Também define a interface `Budget`.
  - `src/domain/budget.ts`: Define uma constante `BUDGET_STATUS`, um type `BudgetStatus` isolado, e uma interface `Budget` separada focada no financeiro.
  - `src/core/validation/invariant.ts`: `assertValidBudgetStatus` valida um array de strings *hardcoded*.
  - `src/core/finance/budgetLifecycle.ts`: Define os status abertos/fechados e transições de `BudgetStatus`.
  - `src/core/workflow/engine.ts`: Mapeia `WorkflowState` para `BudgetStatus`.
- **Classificação:** **Divergente e Perigoso.** Existem múltiplas fontes de verdade definindo o que é um `Budget` e os possíveis status, resultando em cast inseguro (`as unknown as BudgetStatus`) nos storages.
- **Ação Necessária (Fase 2):** Consolidar em uma única interface `Budget` e enum de status em `src/domain/budget.ts`, removendo as duplicatas de `core/types/business.ts`.

## 2. Cálculos Financeiros (Subtotal, Total, Margem, Lucro, Taxas)
- **Onde foi encontrado:**
  - `src/core/pricing/budget.ts`: Calcula subtotais, totais comerciais e totais com desconto varrendo os `items` do orçamento.
  - `src/domain/aferixFinanceEngine.ts`: `calculateBudget` recebe `BudgetInputs` avulsos, ignora os itens e calcula custos agregados, valor líquido cobrado e margem/lucro de forma isolada.
  - `src/core/finance/serviceProfit.ts`: Calcula o lucro real de um serviço concluído (pós-execução).
  - `src/core/finance/projectMargin.ts`: Calcula a margem de um projeto.
  - `src/app/screens/HomeScreen.tsx`: Componente de UI fazendo `calculateSavedBudgetValue` em tempo real.
- **Classificação:** **Descentralizado e Duplicado.** Regras financeiras vazam para a UI e estão espalhadas em diversos arquivos do `core`, gerando risco de a margem mostrada no simulador divergir do valor real cobrado no PDF.
- **Ação Necessária (Fase 3):** Criar `BudgetCalculatorService.ts` centralizando todos os cálculos financeiros de orçamentos, tornando-o a única via de obtenção de totais, margens e impostos no fluxo operacional.

## 3. Workflow, Timeline e Snapshots
- **Onde foi encontrado:**
  - `src/core/types/business.ts`: Declara `OperationalSnapshot` e tipagens de timeline de forma não finalizada.
  - `src/features/budgets/storage/savedBudgetsStorage.ts`: Armazena `timeline` e `snapshots` como arrays na entidade legada.
  - `src/core/workflow/timeline.ts`: Implementa lógicas de eventos de tempo, porém de forma isolada do salvamento nativo.
- **Classificação:** **Precisa Consolidar.**
- **Ação Necessária:** Ajustar as tipagens de snapshot na interface única de Budget, mas focar primeiramente em travar as regras de negócio base (cálculo e status) antes da complexidade de timeline (já parcialmente protegida na fase anterior).

## Conclusão da Auditoria
O domínio está seriamente fragmentado entre definições ricas para interface (`core/types/business.ts`) e definições de domínio puro (`domain/`). Isso será resolvido na Fase 2 e 3 para criar a SSOT (Single Source of Truth) definitiva.
