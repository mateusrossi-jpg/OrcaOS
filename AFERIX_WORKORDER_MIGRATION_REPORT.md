# AFERIX WORKORDER MIGRATION REPORT

## 1. Contexto da Migração
A Ordem de Serviço (OS) possuía uma ambiguidade no status `draft`: ele era utilizado tanto para OSs em construção manual quanto para OSs originadas de vendas autorizadas. Como a Home Executiva ignorava rascunhos, o valor vendido "sumia" do radar operacional.

## 2. Nova Definição de Estados

-   **`draft`**: Mantido para rascunhos técnicos manuais (fora do radar executivo).
-   **`awaiting_schedule`**: Novo status para OSs vendidas e aguardando agenda (visível no radar "Em Execução").

## 3. Registros Afetados (Audit)

| Condição | Status Anterior | Novo Status | Motivo |
| :--- | :--- | :--- | :--- |
| OS vinculada a Budget | `draft` | `awaiting_schedule` | Garantir visibilidade do valor vendido. |
| OS manual (sem Budget) | `draft` | `draft` | Manter isolamento de rascunhos. |

## 4. Evidência de Sucesso (Test Log)
```bash
Drafts encontrados: 2
OSs a serem migradas (com budgetId): 1
Migração concluída com sucesso.
```

## 5. Próximos Passos
O `operationalFacade` foi atualizado para que toda nova OS originada de `authorizeBudget` nasça automaticamente como `awaiting_schedule`, herdando o `executedValue` do orçamento.
