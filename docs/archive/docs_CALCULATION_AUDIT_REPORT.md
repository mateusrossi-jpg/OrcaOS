# Auditoria de Cálculos Financeiros (Fase 2)

## 1. Classificação de Cálculos Encontrados

| Localização | Tipo de Cálculo | Status | Ação Realizada |
| :--- | :--- | :--- | :--- |
| `HomeScreen.tsx` | Subtotal e Lucro Mensal (inline) | **Cálculo Duplicado** | Refatorado para usar `calculateBudget` facade. |
| `budgetValidation.ts` | Subtotal para validação de desconto | **Cálculo Duplicado** | Refatorado para usar `BudgetCalculatorService`. |
| `ReportWorkspace.tsx` | Resumo financeiro e margem média | **Permitido** | Utiliza `calculateServiceProfit` (engine oficial de finanças). |
| `buildClientProposalFromCaptures.ts` | Totais de itens e subtotal da proposta | **Cálculo Duplicado** | Refatorado para usar `BudgetCalculatorService`. |
| `AferixBudgetPdf.tsx` | Totais de itens no PDF | **Cálculo Oficial** | Utiliza `BudgetCalculatorService`. |
| `PricingWorkspace.tsx` | Preço rápido, margem e markup | **Cálculo Oficial** | Utiliza `trade.ts` (engine de precificação comercial). |

## 2. Validação de Consumo do Engine

- **PDF**: Confirmado uso de `BudgetCalculatorService` para totais de linha.
- **Reports**: Confirmado uso de `calculateServiceProfit` para análise de realizado vs planejado.
- **Finance**: Confirmado uso de `calculateServiceProfit` para exibição de lucros reais.
- **Dashboard (Home)**: Refatorado para eliminar `reduce` inline e usar a fachada oficial.
- **Histórico**: Confirmado uso de `calculateBudget` através do snapshot ou cálculo em tempo real.

## 3. Resultado Final
**ZERO** cálculo financeiro de "business logic" (totais, lucros, margens) reside agora fora do ecossistema de Services/Engines. 

As lógicas matemáticas foram centralizadas, garantindo que o valor exibido no PDF seja idêntico ao do Dashboard e do Histórico.

## 4. Próximos Passos
Continuar para a Fase 3 (Consolidação do Domain Model) para remover campos híbridos que ainda existem para suporte a cálculos legados (`total_servicos`, `lucro_liquido`).
