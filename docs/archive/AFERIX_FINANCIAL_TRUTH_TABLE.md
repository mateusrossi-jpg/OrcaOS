# AFERIX FINANCIAL TRUTH TABLE

Este documento define a verdade única para a agregação dos KPIs financeiros em todo o sistema.

| Métrica | Regra de Agregação | Função de Proteção | Status |
| :--- | :--- | :--- | :---: |
| **Receita Recebida** | `SUM(SimpleFinanceRecord.receivedValue)` | `safeMoneyValue()` | 🟢 |
| **Faturamento Esperado**| `SUM(SimpleFinanceRecord.expectedValue)` | `safeMoneyValue()` | 🟢 |
| **Saldo a Receber** | `SUM(SimpleFinanceRecord.openBalance)` | `safeMoneyValue()` | 🟢 |
| **Realização (%)** | `(Received / Expected) * 100` | N/A | 🟢 |

## Regras de Integridade Aplicadas
1.  **Imunidade a Nulos:** Todo campo numérico deve ser processado por `safeMoneyValue` antes de entrar em um acumulador `.reduce()`.
2.  **Sincronismo Operacional:** Os KPIs superiores devem bater exatamente com o somatório dos itens visíveis na lista de histórico.
3.  **Precedência:** O `SimpleFinanceRecord` é a autoridade máxima sobre a conta bancária do operador SOLO.
