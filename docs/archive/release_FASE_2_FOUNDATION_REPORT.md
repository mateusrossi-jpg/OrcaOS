# AUDITORIA FASE 2A: INTELIGÊNCIA OPERACIONAL E RECORRÊNCIA

**Status:** Auditoria Concluída (Somente Leitura)
**Objetivo:** Avaliar a capacidade da fundação do Aferix (Event Sourcing + Domínios Isolados) de suportar funcionalidades avançadas de CRM, Manutenções Preventivas e Contratos Recorrentes, sem gerar retrabalho futuro.

---

### ETAPA 1: AUDITORIA DE RELACIONAMENTO (CRM)

**A arquitetura atual suporta naturalmente? SIM.**

É possível detectar tudo (Cliente inativo, sem OS, VIP, etc.) utilizando estritamente a camada de eventos construída na Fase 1D, **sem criar nenhuma entidade nova de banco de dados**.

*   *Como:* Através da criação de um novo Read Model (ex: `ClientCRMProjection`).
*   *Lógica:* Ao varrer o `OperationalTimelineService` agrupando por `metadata.clientId`, a projeção calcula:
    *   **Último Contato:** O `timestamp` mais recente de qualquer evento associado ao cliente.
    *   **Cliente Inativo:** Se `Date.now() - Último Contato > 30 dias`.
    *   **Cliente VIP (LTV):** Soma do `paymentAmount` de todos os eventos `FINANCE_RECORD_REALIZED` do cliente. Se `> X`, é VIP.
*   *Gap de Relacionamento:* Falta apenas a capacidade de registrar "Notas Manuais" (ex: "Liguei para o cliente via WhatsApp"). Isso seria resolvido criando um evento `CLIENT_CONTACTED`.

---

### ETAPA 2: AUDITORIA DE MANUTENÇÃO PREVENTIVA

**A arquitetura atual suporta naturalmente? NÃO.**

*   *O Problema:* Atualmente, a única forma de programar uma "Limpeza de Ar Condicionado daqui a 6 meses" seria criar uma `WorkOrder` com `status: 'draft'` e `scheduledDate: '2026-11-30'`.
*   *Por que é uma gambiarra:* Isso encheria a "Fila de Preparação" (drafts) do *Operations Hub* com centenas de OSs fantasmas que não podem ser executadas hoje, destruindo a usabilidade da trincheira.
*   *A Solução Minimalista:* Precisamos de uma nova entidade leve chamada `MaintenancePlan` (ou `RecurrenceRule`). Ela não é uma OS; ela é um "Gerador de OS". Um *Cron Job* diário lê os planos e emite o evento `WORKORDER_CREATED` apenas 7 dias antes do vencimento.

---

### ETAPA 3: AUDITORIA DE CONTRATOS E RECORRÊNCIA

**A arquitetura atual suporta naturalmente? NÃO.**

*   *O Problema:* O Aferix hoje é um sistema *Transacional* (Orçamento -> OS -> Recebimento). Ele não entende o conceito de *Assinatura* (Subscription).
*   *Por que precisamos do domínio `Contract`:* Um contrato anual de manutenção de R$ 1.000/mês precisa gerar 12 faturas (`FinancialRecord`) ao longo do ano, **mesmo que não haja uma OS (WorkOrder) naquele mês específico** (ex: retainer fee de TI).
*   *Veredito:* É obrigatória a criação da entidade `Contract`. Ela será a nova "raiz" opcional, substituindo o `Budget` para fluxos de longo prazo: `Contract -> (gera N) WorkOrders + (gera N) FinancialRecords`.

---

### ETAPA 4: A HOME DO FUTURO (FASE 2)

Quando as fundações de Contrato e Preventiva existirem, o "Centro de Comando" (Home) passará a integrar a visão de Longo Prazo e Relacionamento.

**Priorização de Alertas (Stack de Atenção):**
*   [P0] **Cliente VIP Inativo/Aguardando Retorno:** Risco iminente de churn de alta receita.
*   [P0] **Contrato Vencendo (30 dias):** Ação comercial crítica para garantir renovação.
*   [P1] **Preventiva Vencendo na Semana:** Oportunidade de geração de OS e caixa.
*   [P2] **Cliente sem contato há 60 dias:** Ação de farming / marketing.

---

### ETAPA 5: AUDITORIA DO CLIENT 360

A projeção recém-construída na Fase 1D (`getClientTimeline`) consegue exibir perfeitamente a linha cronológica de:
✅ Histórico financeiro (Pagamentos reais).
✅ Histórico operacional (OS criadas e fechadas).
✅ Histórico comercial (Orçamentos e propostas).

**Lacunas Atuais para o "360°":**
❌ *Histórico de relacionamento:* Não mapeia contatos informais (ligações, recados).
❌ *Preventivas futuras:* Não exibe, pois não existem no banco.
❌ *Contratos:* Não exibe, pois o domínio não existe.

---

### ETAPA 6: ROADMAP EXECUTIVO

**Nota de Prontidão da Arquitetura Atual:**
*   CRM / Inteligência: **100/100** (Event Store resolve 100%).
*   Client 360: **80/100** (Falta interface gráfica).
*   Preventivas e Contratos: **0/100** (Falta entidade e motor de repetição).

**O Aferix consegue evoluir para ERP completo sem reescrever a fundação das Fases 1A-1D?**
**SIM.** A fundação foi desenhada em domínios isolados (DDD). Adicionar `Contract` é simplesmente criar um novo módulo que *orquestra* a criação das entidades que já existem (`WorkOrder` e `FinancialRecord`), da mesma forma que o `Budget` faz hoje. Nenhuma tabela base precisará ser destruída.

**O Menor Caminho para a Plataforma Recorrente (Fase 2):**
1.  **Módulo CRM Leve:** Criar a UI do Client 360° e a emissão do evento manual de contato. (Reaproveita 100% da arquitetura).
2.  **Motor de Contratos:** Criar entidade `Contract` com regras de faturamento recorrente, que injeta contas a receber (`FinancialRecord` com `status: pending`) mês a mês.
3.  **Motor de Preventivas:** Acoplar ao contrato a entidade `MaintenancePlan`, que injeta OSs (`draft`) na fila do técnico nas datas corretas.

Nenhuma implementação foi realizada. A arquitetura está plenamente mapeada e as lacunas para o futuro SaaS recorrente estão identificadas e isoladas em novos domínios.