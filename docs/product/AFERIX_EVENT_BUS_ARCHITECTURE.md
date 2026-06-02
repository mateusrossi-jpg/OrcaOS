# AFERIX EVENT BUS ARCHITECTURE
**Status:** CONGELADO E RATIFICADO  
**Data de Emissão:** 01 de Junho de 2026  
**Tecnologia de Referência:** Supabase Event Streams / PostgreSQL WAL Replication (Real-time Engine)

---

## 🏛️ ARQUITETURA GERAL DO EVENT BUS
Para manter o acoplamento fraco (loose coupling) e alta resiliência entre **Aferix**, **OrçaOS** e **ENDAP**, toda transição crítica de estado de domínio é transmitida por meio de um **Event Bus** assíncrono baseado em tópicos.

```text
[ OrçaOS ] ──► (PROPOSAL_APPROVED) ──┐
                                      ▼
[ ENDAP  ] ──► (ANOMALY_DETECTED)  ──┼──► [ Aferix Platform Event Bus ]
                                      ▲
[ Aferix ] ──► (WORKORDER_CLOSED)  ──┘
                                      │
                                      ▼ (Dispatch para Destinos)
                              ┌───────┴───────┐
                              ▼               ▼
                        [ Aferix Core ]  [ Notification ]
```

---

## 1. DETALHAMENTO DOS EVENTOS INTEGRADOS

### A. PROPOSAL_APPROVED (Transição Comercial para Operacional)
* **Origem:** OrçaOS Spoke (Comercial / Proposal Builder)
* **Destino:** Aferix Hub (Core ERP) & Aferix Platform (Billing Engine)
* **Gatilho:** Cliente final aceita e assina a proposta digital interativa no navegador.
* **Foco do Payload:** Dados completos do cliente, insumos orçados que gerarão tarefas de OS e termos comerciais.
* **Payload JSON Schema:**
```json
{
  "event_id": "evt_prop_app_98234",
  "event_type": "PROPOSAL_APPROVED",
  "timestamp": "2026-06-01T20:26:00Z",
  "workspace_id": "ws_sp_01",
  "data": {
    "proposal_id": "prop_991823",
    "client_name": "Hospital Regional Leste",
    "client_document": "12.345.678/0001-90",
    "site_address": {
      "street": "Av. Principal",
      "number": "1000",
      "city": "São Paulo",
      "state": "SP",
      "zip_code": "01001-000"
    },
    "total_value": 45000.00,
    "markup_applied": 1.35,
    "materials_approved": [
      {
        "sku": "AC-SPLIT-30",
        "description": "Evaporadora/Condensadora 30.000 BTU Inverter",
        "quantity": 3,
        "unit_price": 4500.00
      }
    ],
    "services_approved": [
      {
        "service_code": "INST-HVAC",
        "description": "Instalação física e linha de cobre de Climatização",
        "estimated_hours": 12.5
      }
    ],
    "client_signature_base64": "data:image/png;base64,iVBORw0KGg...",
    "signature_timestamp": "2026-06-01T20:25:34Z"
  }
}
```

### B. WORKORDER_COMPLETED (Conclusão de Serviço)
* **Origem:** Aferix Hub (Mobile Execution / Dexie Sync)
* **Destino:** OrçaOS Spoke (Vendas / Auditoria de Markup) & Platform (Billing & Client Portal)
* **Gatilho:** Técnico clica em "Finalizar OS" e coleta a assinatura do cliente final após check-out de campo.
* **Payload JSON Schema:**
```json
{
  "event_id": "evt_wo_comp_8872",
  "event_type": "WORKORDER_COMPLETED",
  "timestamp": "2026-06-01T20:28:00Z",
  "workspace_id": "ws_sp_01",
  "data": {
    "work_order_id": "wo_9921",
    "client_id": "cli_5561",
    "site_id": "site_7721",
    "technician_id": "usr_tech_09",
    "time_spent_minutes": 180,
    "status": "COMPLETED",
    "checklists_validated": [
      {
        "checklist_id": "chk_pmoc_v1",
        "title": "Checklist Mensal Climatização ANVISA",
        "items_ok": 12,
        "items_failed": 0
      }
    ],
    "materials_consumed": [
      {
        "sku": "TUB-COP-38",
        "quantity": 5.5,
        "unit": "meters"
      }
    ]
  }
}
```

### C. ANOMALY_DETECTED (Manutenção Preditiva)
* **Origem:** ENDAP Spoke (IoT Processing / Sensor Network)
* **Destino:** Aferix Hub (Core Dispatcher / OS Planner)
* **Gatilho:** Regra de análise de sensor é violada (ex: temperatura de compressor acima de 75°C por 3 minutos).
* **Payload JSON Schema:**
```json
{
  "event_id": "evt_anom_det_1209",
  "event_type": "ANOMALY_DETECTED",
  "timestamp": "2026-06-01T20:29:10Z",
  "workspace_id": "ws_sp_01",
  "data": {
    "device_id": "dev_chiller_04",
    "asset_id": "ast_chiller_paulista_01",
    "site_id": "site_7721",
    "telemetry_context": {
      "monitored_variable": "compressor_temperature",
      "threshold_value": 75.0,
      "detected_value": 78.4,
      "duration_seconds": 180
    },
    "severity": "CRITICAL"
  }
}
```

### D. DEVICE_OFFLINE (Queda de Conexão Física de Hardware)
* **Origem:** ENDAP Spoke (IoT Gateway / Connectivity Service)
* **Destino:** Aferix Platform (Notification Engine & Security Ledger)
* **Gatilho:** Gateway de telemetria perde comunicação (missed heartbeat) por mais de 5 minutos.
* **Payload JSON Schema:**
```json
{
  "event_id": "evt_dev_off_4431",
  "event_type": "DEVICE_OFFLINE",
  "timestamp": "2026-06-01T20:30:00Z",
  "workspace_id": "ws_sp_01",
  "data": {
    "gateway_id": "gtw_leste_09",
    "last_seen": "2026-06-01T20:25:00Z",
    "connected_devices_impacted": 8,
    "network_type": "4G_LTE"
  }
}
```

### E. PMOC_DUE (Vencimento de Cronograma de Vistoria ANVISA)
* **Origem:** Aferix Hub (Maintenance Scheduler Service)
* **Destino:** Aferix Platform (Notification Engine) & Aferix Core (Dispatcher Screen)
* **Gatilho:** Cronograma atinge a data planejada para vistoria mensal obrigatória.
* **Payload JSON Schema:**
```json
{
  "event_id": "evt_pmoc_due_9001",
  "event_type": "PMOC_DUE",
  "timestamp": "2026-06-01T00:00:05Z",
  "workspace_id": "ws_sp_01",
  "data": {
    "contract_id": "ctr_hospital_2026",
    "pmoc_schedule_id": "sch_june_2026",
    "site_id": "site_7721",
    "assets_to_inspect": [
      "ast_chiller_paulista_01",
      "ast_split_paulista_02"
    ],
    "due_date": "2026-06-15"
  }
}
```

### F. CONTRACT_RENEWAL (Renovação de Contrato Recorrente)
* **Origem:** Aferix Hub (Core Contract Service)
* **Destino:** Aferix Platform (Billing Engine / Stripe Invoice Scheduler)
* **Gatilho:** Data atual atinge a janela de faturamento da mensalidade do contrato (ex: D-5 do faturamento).
* **Payload JSON Schema:**
```json
{
  "event_id": "evt_ctr_ren_1102",
  "event_type": "CONTRACT_RENEWAL",
  "timestamp": "2026-06-01T00:01:00Z",
  "workspace_id": "ws_sp_01",
  "data": {
    "contract_id": "ctr_hospital_2026",
    "client_id": "cli_5561",
    "monthly_billing_value": 3500.00,
    "payment_due_date": "2026-06-10",
    "invoice_cycle": "2026-06-10_to_2026-07-10"
  }
}
```

### G. PAYMENT_CONFIRMED (Aprovação de Cobrança Financeira)
* **Origem:** Aferix Platform (Billing Engine / Stripe Webhook Interceptor)
* **Destino:** Aferix Hub (Core Financial Ledger) & Aferix Platform (Feature Flag Service)
* **Gatilho:** Confirmação do recebimento da mensalidade ou do add-on via gateway Stripe.
* **Payload JSON Schema:**
```json
{
  "event_id": "evt_pay_conf_3345",
  "event_type": "PAYMENT_CONFIRMED",
  "timestamp": "2026-06-01T20:32:00Z",
  "workspace_id": "ws_sp_01",
  "data": {
    "stripe_invoice_id": "in_1N23hS",
    "organization_id": "org_med_services_01",
    "amount_paid": 3500.00,
    "payment_method": "CREDIT_CARD",
    "plan_id": "plan_professional_team",
    "features_unlocked": [
      "addon.pmoc_reporting",
      "limit.workspaces.unlimited"
    ]
  }
}
```

---

## 2. REGRAS GERAIS DE RESILIÊNCIA DO EVENT BUS
1. **At-Least-Once Delivery:** O Event Bus garante que todo evento seja entregue pelo menos uma vez. Os consumidores das APIs dos Spokes e do Hub devem ser **idempotentes**, processando payloads duplicados sem gerar anomalias ou duplicações financeiras.
2. **Event Schema Validation:** Mensagens que não validarem a estrutura JSON exata em relação ao schema serão descartadas e direcionadas para uma fila de **Dead Letter Queue (DLQ)** para auditoria de segurança da engenharia de infraestrutura da plataforma.
