# AFERIX REVENUE EVENT BUS
**A Espinha Dorsal de Dados Financeiros**

Para garantir consistência e disparos automáticos, o sistema financeiro inteiro opera orientado a eventos (Event Sourcing Architecture).

## 1. Eventos Críticos

### `ANOMALY_CREATED`
*   **Payload:** `{ anomalyId, assetId, severity, createdBy }`
*   **Consumidor:** Timeline do Ativo (registra falha) + Inbox Comercial (cria cartão no Kanban em OPEN).

### `PROPOSAL_CREATED`
*   **Payload:** `{ proposalId, anomalyId, totalValue, clientId }`
*   **Consumidor:** Inbox Comercial (Move cartão para QUOTED).

### `PROPOSAL_APPROVED` (O Evento Rei)
*   **Payload:** `{ proposalId, signatureUrl, clientName, timestamp }`
*   **Consumidor 1:** Timeline do Cliente (Sinaliza vitória).
*   **Consumidor 2:** WorkOrder Factory (Cria a `WorkOrder` Corretiva automaticamente e insere na fila de Despacho).
*   **Consumidor 3:** Anomaly Engine (Muda Anomaly para `APPROVED`).

### `WORKORDER_COMPLETED` (Corretiva)
*   **Payload:** `{ workOrderId, originAnomalyId, resolvedBy }`
*   **Consumidor:** Anomaly Engine (Muda Anomaly para `RESOLVED`) + Billing Engine (Libera fatura da corretiva).

## 2. Idempotência e Reprocessamento
Se o celular do cliente cair a internet no meio da assinatura (`PROPOSAL_APPROVED`), o backend deve ser idempotente. Um `proposalId` só pode ser aprovado e gerar uma `WorkOrder` uma única vez. Chaves únicas no Postgres (`unique_constraint` no originAnomalyId da OS) garantem que a mesma falha não gere duas OS corretivas duplicadas acidentalmente.
