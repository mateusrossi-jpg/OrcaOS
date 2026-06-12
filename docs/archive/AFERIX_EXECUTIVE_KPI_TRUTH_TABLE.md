# AFERIX EXECUTIVE KPI TRUTH TABLE

Este documento define quais estados de cada entidade compõem os KPIs do Radar Executivo (Home).

| KPI | Entidade Fonte | Status Considerados | Status Excluídos | Fórmula de Valor |
| :--- | :--- | :--- | :--- | :--- |
| **Receita Contratada** | `Budget` | `autorizado`, `em_execucao`, `finalizado` | `enviado`, `pausado`, `cancelado` | `SUM(chargedValue)` |
| **Receita Contratada** | `Contract` | `active` | `suspended`, `expired`, `draft` | `SUM(billingAmount)` |
| **Em Execução** | `WorkOrder` | `awaiting_schedule`, `scheduled`, `in-progress` | `done`, `cancelled` | `SUM(executedValue)` |
| **Faturado** | `Finance` | `pending`, `partial`, `paid` | - | `SUM(expectedValue)` |
| **Recebido** | `Finance` | `partial`, `paid` | `pending` | `SUM(receivedValue)` |
| **Contratos** | `Contract` | `active` | `suspended`, `expired`, `draft` | `COUNT(*)` |
| **Produtividade** | `WorkOrder` | `done` | Todos os outros | `SUM(executedValue) / COUNT(*)` |

---

## Regras de Integridade (Guardrails)

1.  **Conclusão Financeira:** Uma OS só sai do radar de "Em Execução" quando seu status muda para `done`.
2.  **Transição de Valor:** Ao mover uma OS de `in-progress` para `done`, o valor deve migrar instantaneamente para o KPI de **Faturado**.
3.  **Diferença de Escopo:** O `executedValue` da OS pode ser diferente do `chargedValue` do Budget original (se houver alteração técnica no campo), mas o Radar Executivo deve sempre priorizar o dado mais recente do pipeline (OS > Budget).
