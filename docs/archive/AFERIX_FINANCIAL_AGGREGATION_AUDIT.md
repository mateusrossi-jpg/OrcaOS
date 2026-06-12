# AFERIX FINANCIAL KPI TRUTH AUDIT

## 1. Inventário de Dados (Diagnóstico de Runtime)

Com base na auditoria de integridade realizada, identificamos que o sistema está sofrendo de **Envenenamento de Agregados por NaN**.

| KPI | Fonte de Dados | Método de Cálculo | Status |
| :--- | :--- | :--- | :---: |
| **Fluxo de Caixa** | `simpleFinanceRecords` | `rows.reduce((acc, r) => acc + r.receivedValue, 0)` | 🔴 Quebrado |
| **Esperado** | `simpleFinanceRecords` | `rows.reduce((acc, r) => acc + r.expectedValue, 0)` | 🔴 Quebrado |
| **A Receber** | `simpleFinanceRecords` | `rows.reduce((acc, r) => acc + r.openBalance, 0)` | 🔴 Quebrado |

## 2. Evidência Técnica da Causa Raiz

A divergência ocorre no arquivo `src/features/finance/components/SimpleFinanceWorkspace.tsx`.

**Código Ofensor (Linhas 63-65):**
```typescript
const revenue = rows.reduce((acc, r) => acc + r.receivedValue, 0);
const expected = rows.reduce((acc, r) => acc + r.expectedValue, 0);
const pending = rows.reduce((acc, r) => acc + (r.status !== 'paid' ? r.openBalance : 0), 0);
```

**Mecânica da Falha:**
1. Se **um único registro** no Dexie possuir `receivedValue` como `undefined` (comum em migrações de esquema ou registros órfãos), a expressão `acc + undefined` resulta em `NaN`.
2. Uma vez que o acumulador vira `NaN`, todos os registros subsequentes mantêm o estado `NaN`.
3. O formatador `formatCurrencyBRL` recebe `NaN` e exibe `R$ 0,00` por fallback de segurança.
4. A **Lista de Recebimentos** continua exibindo valores porque utiliza `row.receivedValue` individualmente em cada linha, onde o erro não se propaga.

## 3. Auditoria de Filtros e Período

- **Filtro de Período (Junho):** **NÃO EXISTE.** Embora a interface exiba o nome do mês atual no cabeçalho, o código soma **TODOS** os registros históricos encontrados no banco.
- **Filtros de Status:** O KPI "A Receber" tenta filtrar por `status !== 'paid'`, mas também é vulnerável a `openBalance` indefinido.

## 4. Comparação: Calculado vs. Exibido

| KPI | Valor Real no Banco | Valor Exibido na UI | Motivo da Diferença |
| :--- | :--- | :--- | :--- |
| **Recebido** | > R$ 100.000,00 | R$ 0,00 | Propagação de `NaN` no `reduce`. |
| **Esperado** | > R$ 100.000,00 | R$ 0,00 | Propagação de `NaN` no `reduce`. |
| **A Receber** | Calculado | R$ 0,00 | Propagação de `NaN` no `reduce`. |

## 5. Classificação do Bug

### 🔴 BUG DE AGREGAÇÃO (Crítico)
O motor de cálculo não é resiliente a dados incompletos.

### 🟠 BUG DE REATIVIDADE (Médio)
A tela utiliza `useState` + `useEffect` em vez de `useLiveQuery`. Isso significa que se o usuário fechar uma OS e entrar no Financeiro, os dados podem estar desatualizados até que ocorra um refresh manual.

## 6. Recomendação de Correção
Implementar `null-coalescing` em todos os agregadores:
`rows.reduce((acc, r) => acc + (r.receivedValue || 0), 0)`
E migrar a tela para `useLiveQuery` para garantir paridade com a Home.
