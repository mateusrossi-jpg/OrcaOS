# AFERIX SINGLE SOURCE OF TRUTH AUDIT

## 1. Mapeamento de Fontes de Dados

A auditoria identificou a convivência de fontes de dados heterogêneas alimentando KPIs idênticos.

| Tela | KPI | Fonte de Verdade | Entidade Primária | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Home** | Receita Contratada | Direct Dexie (UI) | `budgets`, `contracts` | ✅ Real |
| **Home** | Em Execução | Direct Dexie (UI) | `workOrders` | ✅ Real |
| **Financeiro** | Receita Bruta | financeFacade | `simpleFinanceRecords` | ✅ Real |
| **Relatórios** | Receita Bruta | useCalculationCaptures | `calculationCaptures` | 🔴 Divergente |
| **Portal Cliente**| Saúde dos Ativos | Hardcoded | N/A | ❌ Mock |
| **Contratos** | MRR | Hardcoded | N/A | ❌ Mock |

## 2. Inventário de `calculationCaptures`

Esta entidade atua hoje como um log paralelo de baixa fidelidade comercial.

1.  **Quem grava?** CatalogScreen e App.tsx (itens adicionados individualmente).
2.  **Quem lê?** Apenas o ReportWorkspace.tsx.
3.  **Possui valor financeiro?** Não. É apenas uma estimativa técnica bruta.
4.  **Possui valor operacional?** Sim, como evidência de levantamento técnico.
5.  **Pode ser substituído?** Para fins de **KPI Executivo**, deve ser substituído por `WorkOrder`.

**Classificação:** `AUXILIAR` (Técnico), `DEPRECAR` (KPIs).

## 3. Respostas Obrigatórias

1.  **Quantas fontes de verdade existem hoje?** 4 fontes concorrentes.
2.  **Quantas devem permanecer?** 1 fonte: O Agregador de Domínio (Dexie) projetado via Read Models.
3.  **calculationCaptures deve sobreviver?** Sim, como log de auditoria técnica de levantamento, mas sem autoridade financeira.
4.  **Qual é o SSOT oficial do Financeiro?** `simpleFinanceRecords`.
5.  **Qual é o SSOT oficial da Operação?** `workOrders`.
6.  **Qual é o SSOT oficial dos Relatórios?** Deve ser migrado para `financeRecords` (Valor) e `workOrders` (Volume).
7.  **Existe risco de divergência financeira?** **SIM, CRÍTICO.** Relatórios de lucro mostram valores teóricos baseados em multiplicadores hardcoded.

## 4. Classificação de Integridade
🔴 **Múltiplas Verdades**
O sistema entrega dashboards que não fecham a conta entre si.
