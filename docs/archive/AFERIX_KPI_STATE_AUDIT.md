# AFERIX KPI STATE AUDIT

## 1. Mapeamento de Estados Reais vs. Utilizados

A auditoria identificou inconsistências críticas entre a tipagem oficial, a persistência no banco (Dexie) e os filtros aplicados nos Dashboards Executivos.

### Tabela de Auditoria de Status

| Entidade | Status Real (Dexie/Code) | Utilizado em KPIs | Origem/Trigger | Observação |
| :--- | :--- | :---: | :--- | :--- |
| **Budget** | `iniciado` | Não | Criação manual | - |
| **Budget** | `enviado` | Não | `changeProposalStatus` | Radar comercial apenas |
| **Budget** | `autorizado` | Sim | `authorizeBudget` | **Trigger de Conversão** |
| **Budget** | `em_execucao` | Sim | `executeBudget` | Venda confirmada |
| **Budget** | `finalizado` | Sim | `finalizeBudget` | Ciclo concluído |
| **WorkOrder**| `draft` | **NÃO** | `authorizeBudget` | **CAUSA RAIZ DA PERDA DE VALOR** |
| **WorkOrder**| `scheduled` | Sim | Agenda/Manual | - |
| **WorkOrder**| `in-progress` | Sim | `handleStartService` | - |
| **WorkOrder**| `done` | Não | `completeWorkOrder` | vira Faturamento |
| **WorkOrder**| `open` | Sim (Filtro) | - | **STATUS GHOST** (Não existe no tipo) |
| **WorkOrder**| `completed` | Sim (Portal) | - | **STATUS GHOST** (Deveria ser `done`) |
| **Contract** | `active` | Sim | Ativação manual | - |
| **Contract** | `draft` | Não | Criação | - |

---

## 2. Auditoria do Pipeline de Conversão

### Fluxo Atual de Perda de Valor

1.  **Aprovação:** Usuário clica em "Autorizar Orçamento".
2.  **Conversão:** `operationalFacade.authorizeBudget` altera status do Budget para `autorizado`.
3.  **Criação de OS:** O Facade cria uma `WorkOrder` com `status: 'draft'`.
4.  **Consumo KPI (Owner):** O filtro de "Em Execução" busca por `['open', 'scheduled', 'in-progress']`.
5.  **Desaparecimento:** Como `draft` não está no filtro e `autorizado` (Budget) não compõe o KPI de execução (apenas o de Receita Contratada), o valor da OS recém-criada fica invisível no radar de operação.

### Evidência em Código (`src/features/workspace/screens/OwnerWorkspace.tsx`)
```typescript
// L55: O filtro ignora 'draft' e busca por 'open' (que não existe)
const inProgressWOs = wos.filter(wo => ['open', 'scheduled', 'in-progress'].includes(wo.status));
```

---

## 3. Identificação de Status Mortos e Inconsistências

1.  **`open` (WorkOrder):** Utilizado no filtro da Home, mas inexistente no `ServiceStatus`.
2.  **`completed` (WorkOrder):** Utilizado no `ClientPortalPage.tsx`, mas o status real é `done`.
3.  **`concluido` (WorkOrder):** Utilizado em algumas comparações (`OperationsHubWorkspace.tsx`), mas é um status de `Attendance`, não de `WorkOrder`.
4.  **`draft` (WorkOrder):** Status excessivamente genérico para uma OS que já foi vendida (Pós-Autorização).

---

## 4. Diagnóstico de Discrepância (SSOT)

Existem **três fontes de verdade** competindo pelos KPIs:

1.  **OwnerWorkspace:** Lê direto do Dexie via `useLiveQuery`. (Mais rápido, mas ignora regras de negócio complexas).
2.  **ReportsWorkspace:** Lê de `calculationCaptures`. (Mostra o "valor técnico", que pode divergir do valor final fechado com o cliente).
3.  **OperationalReadModelService:** Tenta reconstruir via Event Store. (Arquitetura correta, mas subutilizada pelas telas principais).

---

## Conclusão da Auditoria
O sistema sofre de um "vazio de visibilidade" entre a venda e o agendamento. A correção exige a normalização do status inicial da OS e a atualização dos filtros executivos para refletir a realidade operacional.
