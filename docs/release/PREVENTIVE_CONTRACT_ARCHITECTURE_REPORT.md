# RELATÓRIO DE AUDITORIA: MOTOR DE PREVENTIVAS E CONTRATOS — AFERIX OS

**Status:** Auditoria Concluída (READ-ONLY)
**Perfil:** Lead Architect & Recurring Revenue Specialist
**Objetivo:** Validar a arquitetura do motor de recorrência (Preventivas e Contratos) para garantir escalabilidade e integridade de dados antes da implementação física.

---

### ETAPA 1: DEFINIÇÃO DE PREVENTIVA

**Veredito:** **B) Um Plano que gera OSs.**
*Justificativa:* Uma preventiva não é apenas uma OS que se repete; é um compromisso técnico (`MaintenancePlan`) que vive no Ativo e possui inteligência de agendamento. Se o ativo for removido, o plano morre. Se a OS falhar, o plano permanece vivo aguardando a próxima data.

**Entidade `MaintenancePlan`:**
*   `id`: UID.
*   `assetId`: Vínculo obrigatório (O quê).
*   `siteId`: Herdado do Ativo (Onde).
*   `frequency`: Enum (Mensal, Trimestral, Semestral, Anual).
*   `nextExecutionDate`: Gatilho cronológico.
*   `checklistTemplate`: O roteiro técnico da visita.
*   `isActive`: Controle de suspensão.

---

### ETAPA 2: MOTOR DE GERAÇÃO (SCHEDULER)

O fluxo de vida da recorrência será:
`MaintenancePlan` → `Daily Scheduler` → `WorkOrder Draft` → `Operational Pipeline`.

1.  **Antecedência:** A OS deve ser gerada **7 dias antes** da data prevista.
2.  **Modo:** Geração **Automática** em estado `draft` (Aguardando agendamento).
3.  **Segurança:** O motor deve verificar se já existe uma OS `draft` ou `scheduled` para aquele `planId` antes de gerar uma nova, evitando duplicidade por erro de processamento.

---

### ETAPA 3: CONCEITO DE CONTRATO

**Veredito:** **Contract → Client → Site → Assets.**
O Contrato é o envelope comercial. Ele protege o relacionamento financeiro entre o Cliente e o Prestador, cobrindo ativos específicos em locais específicos.

*   **Vantagem:** Permite que um cliente VIP tenha um contrato para a "Matriz" e pague avulso na "Filial".
*   **Risco:** Complexidade na gestão de aditivos (adicionar/remover ativos do contrato).

---

### ETAPA 4: TIPOS DE CONTRATO (PRIORIZAÇÃO)

1.  **Contrato Operacional (MVP):** Foco em "Visitas Técnicas". O motor gera a OS e o técnico executa. O faturamento é baseado na execução.
2.  **Contrato Financeiro (Pós-MVP):** Foco em "Mensalidade". O cliente paga um valor fixo independente de quantas visitas ocorram.
3.  **Contrato Híbrido (Enterprise):** Franquia de horas + mensalidade + preventivas inclusas.

---

### ETAPA 5: HOME INTELLIGENCE (STACK DE ALERTAS)

*   **[P0] Preventiva Vencida:** (Atraso técnico).
*   **[P0] SLA Violado:** (OS de contrato parada há mais tempo que o permitido).
*   **[P1] Contrato Vencendo:** (30 dias para expiração).
*   **[P2] Visita de Contrato Hoje:** (Logística).

---

### ETAPA 6: SEPARAÇÃO 360 (CLIENT vs ASSET)

| Bloco | Client 360 (Estratégico) | Asset 360 (Técnico) |
| :--- | :--- | :--- |
| **Identidade** | Quem é o dono? | O que é a máquina? |
| **Financeiro** | Total Pago / Dívida Total | Custo de Manutenção / ROI |
| **Saúde** | Relationship Score | Asset Health Score |
| **Recorrência** | Lista de Contratos | Plano de Manutenção Ativo |

---

### ETAPA 7: ROADMAP DEFINITIVO (OPÇÃO A)

**Sequência Técnica Recomendada:**
1.  **Site Foundation:** Separação de endereços (Logística).
2.  **Asset Foundation:** Inventário (Identidade).
3.  **Maintenance Intelligence:** Planos e Checklists vinculados ao Asset.
4.  **Contract Engine:** Vínculo comercial e recorrência financeira.

*Justificativa:* É impossível vender um contrato sério sem saber quais ativos serão mantidos.

---

### ETAPA 8: SITE ID E NAVEGAÇÃO

**Obrigatoriedade de `siteId`:**
*   `WorkOrder`: **SIM** (Onde é o serviço?).
*   `Budget`: **SIM** (Onde será a obra?).
*   `Asset`: **SIM** (Onde está instalado?).
*   `Proposal`: **NÃO** (Pode ser um lead sem local definido ainda).

---

### ETAPA 9: ROTAS E LOGÍSTICA (A VERDADE DO GPS)

**Veredito:** **O `Site` é a entidade oficial de geolocalização.**
*   *Justificativa:* O `Client` pode mudar de escritório, mas a máquina (Asset) continua no local original (`Site`). O GPS deve apontar para o local da intervenção física. O botão "IR PARA O LOCAL" consultará sempre as coordenadas do `siteId` vinculado à OS.

---
**Conclusão:** A arquitetura está validada e pronta para sustentar a economia recorrente. O Aferix OS deixará de ser apenas um "emissor de papel" para se tornar o guardião do patrimônio do cliente.

**Próximo Passo:** Encerrar as auditorias e iniciar a Fase 3B real (Implementação física de Sites e Assets).