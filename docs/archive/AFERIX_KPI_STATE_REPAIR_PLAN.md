# AFERIX KPI STATE REPAIR PLAN

## 1. Normalização de Tipagem (WorkOrder)

O objetivo é substituir o status `draft` por `awaiting_schedule` para OSs originadas de vendas, eliminando a ambiguidade de rascunhos técnicos.

### Alterações em `src/core/types/business.ts`:
```typescript
export type ServiceStatus = 'awaiting_schedule' | 'scheduled' | 'in-progress' | 'done' | 'cancelled';
```

## 2. Ajuste no Facade de Conversão

O `operationalFacade` deve injetar o novo status e garantir que o valor orçado seja herdado para o KPI de execução.

### Alterações em `src/features/workflow/operationalFacade.ts`:
- Em `authorizeBudget`: Mudar `status: 'draft'` para `status: 'awaiting_schedule'`.
- Garantir que `executedValue` receba o `chargedValue` do orçamento inicial.

## 3. Reparo de Filtros Executivos (OwnerWorkspace)

Eliminar o status ghost `open` e incluir os novos estados válidos.

### Alterações em `src/features/workspace/screens/OwnerWorkspace.tsx`:
```typescript
// De:
['open', 'scheduled', 'in-progress']
// Para:
['awaiting_schedule', 'scheduled', 'in-progress']
```

## 4. Atualização do Portal do Cliente

Corrigir a busca por execuções finalizadas.

### Alterações em `src/features/clientPortal/screens/ClientPortalPage.tsx`:
```typescript
// De:
.where('status').equals('completed')
// Para:
.where('status').equals('done')
```

## 5. Migração de Dados (Hotfix)

Executar script de correção no Dexie para converter registros existentes:
1. `WorkOrder.status === 'draft'` -> `status: 'awaiting_schedule'`.
2. Garantir que `WorkOrder.executedValue` não seja nulo para OSs em aberto.

## Impacto Esperado

| KPI | Antes | Depois | Justificativa |
| :--- | :--- | :--- | :--- |
| **Em Execução** | R$ 0,00 | R$ [Total Vendido] | Inclusão de OSs aguardando agenda. |
| **Produtividade** | N/A | Ticket Médio Real | Normalização de `executedValue`. |
| **Confiança** | Baixa | Alta | KPI reflete a conta bancária futura. |
