# AFERIX DUPLICATE AGGREGATION REPORT

## 1. KPIs com Múltiplos Motores de Cálculo

A auditoria identificou que métricas fundamentais estão sendo recalculadas de forma inconsistente em diferentes módulos.

| KPI | Motor 1 (Home) | Motor 2 (Finance) | Motor 3 (Relatórios) | Risco de Divergência |
| :--- | :--- | :--- | :--- | :--- |
| **Receita Bruta** | Sum(budgets + contracts) | Sum(finance.expected) | Sum(captures.value) | **ALTO** (Técnico vs Comercial) |
| **Lucro** | Média de Ticket (OS) | Real (Expected - Costs) | Fictício (Revenue * 0.6) | **CRÍTICO** (Estratégico vs Real) |
| **Volume OS** | Count(WorkOrders) | N/A | Count(Captures) | **MÉDIO** (Transação vs Ordem) |

## 2. Detalhamento das Divergências

### A. Receita: Comercial vs. Técnico
-   **Local:** `ReportWorkspace.tsx` vs `OwnerWorkspace.tsx`.
-   **Causa:** Os relatórios somam `calculationCaptures` (o que o técnico mediu). A Home soma `budgets` (o que o comercial fechou).
-   **Cenário de Erro:** Se um orçamento de R$ 1.000 for fechado com desconto para R$ 900, o Relatório continuará mostrando R$ 1.000.

### B. Lucro: Real vs. Estimado
-   **Módulo Financeiro:** Calcula lucro subtraindo impostos, taxas de cartão e custos de material registrados no `financeRecord`.
-   **Módulo de Relatórios:** Aplica uma margem fixa de 60% (`totalRevenue * 0.6`) hardcoded.
-   **Consequência:** O sistema mente para o usuário sobre sua lucratividade real em uma das telas.

### C. OS: Realidade vs. Histórico Técnico
-   O `ReportWorkspace` utiliza a contagem de `captures.length` para indicar "transações". Isso ignora se múltiplas capturas fazem parte de uma única OS ou se foram canceladas.

## 3. Recomendação Imediata
Eliminar o uso de `calculationCaptures` e multiplicadores hardcoded em todos os dashboards de performance executiva. O dado deve emanar do faturamento real.
