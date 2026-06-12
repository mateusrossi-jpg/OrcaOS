# RELATÓRIO DE IMPACTO E MIGRAÇÃO: FASE 3 — AFERIX OS

**Status:** Auditoria Concluída (READ-ONLY)
**Perfil:** Lead Architect & Data Integrity Officer
**Objetivo:** Identificar os impactos estruturais da introdução do ecossistema Asset/Site sobre a base instalada e garantir 100% de compatibilidade reversa.

---

### 1. IMPACTO NAS ORDENS DE SERVIÇO (WORKORDERS)

*   **Novos Campos:** `siteId` (Obrigatório futuramente), `assetIds` (Array, Opcional).
*   **Compatibilidade:** OSs legadas não possuem `siteId`. O sistema deve injetar o `id` do "Site Principal" virtualmente ao ler registros antigos.
*   **Estratégia Backward:**
    ```typescript
    const siteId = workOrder.siteId || fallbackSiteId; // Onde fallbackSiteId é o 'Matriz/Casa' do cliente
    ```
*   **OS sem Asset:** Permitida. A OS continua sendo o contêiner de execução genérico, mas perde a inteligência de "Memória Técnica" se não houver vínculo.

---

### 2. IMPACTO NOS ORÇAMENTOS (BUDGETS)

*   **Site:** Deve existir opcionalmente na criação. Permite orçar para a "Filial 02" mantendo o faturamento na "Matriz".
*   **Asset:** Não deve ser obrigatório no orçamento inicial. Muitas vezes o orçamento é para **vender** o ativo (ex: "Instalação de Inversor Solar").
*   **Risco:** Confusão de fluxos. O orçamento gera a OS. Se o orçamento tem `siteId`, a OS deve herdá-lo obrigatoriamente.

---

### 3. IMPACTO NO CRM (CLIENT 360)

Para evitar poluição, o dossiê será fragmentado:
*   **Resumo (Header):** Contadores de Ativos e Unidades.
*   **Inventário (Nova Aba):** Lista de Assets com status de saúde.
*   **Detalhamento (Asset 360):** Abre ao clicar no ativo, isolando o rastro técnico do rastro comercial.

---

### 4. IMPACTO NO FINANCEIRO (RECORDS)

**Decisão:** `FinancialRecord` NÃO deve possuir `assetId` ou `siteId` diretamente.
*   **Justificativa:** O Financeiro herda o contexto da `WorkOrder`. Ter links diretos geraria redundância e risco de desync (ex: alterar o ativo na OS e esquecer de alterar no registro financeiro). A referência indireta via `workOrderId` é mais íntegra.

---

### 5. IMPACTO NA TIMELINE (EVENT SOURCING)

Lista mínima de novos eventos para o MVP da Fase 3:
1.  `ASSET_REGISTERED`: Criação do inventário.
2.  `ASSET_UPDATED`: Mudança de status ou localização.
3.  `SITE_CREATED`: Nova unidade operacional.
4.  `WORKORDER_ASSET_LINKED`: Quando um equipamento é atendido.
5.  `MAINTENANCE_SCHEDULED`: Registro de preventiva.

---

### 6. ESTRATÉGIA DE MIGRAÇÃO (MUDANÇA SILENCIOSA)

Para não quebrar a experiência dos usuários atuais:
1.  **Lazy Migration:** Ao abrir um cliente antigo, o sistema verifica se ele possui Sites.
2.  **Auto-Site:** Se zero sites, cria automaticamente o `Site Principal` usando o endereço atual gravado na tabela `Client`.
3.  **Data Move:** O endereço passa a ser gerido pelo `Site`, mas o `Client` mantém uma cópia (Snapshot) para fins de faturamento legado.

---

### 7. RISCOS DE IMPLEMENTAÇÃO

| Categoria | Risco | Severidade | Mitigação |
| :--- | :--- | :---: | :--- |
| **Técnico** | Quebra de queries legadas que esperam endereço no Client. | **Médio** | Manter campos de endereço no Client como 'Read-only fallback'. |
| **UX** | Técnico se sentir obrigado a cadastrar máquinas para uma OS simples. | **Alto** | Manter Asset como opcional na OS (Fast Work Order). |
| **Performance** | Lentidão ao carregar 360 de clientes com 100+ ativos. | **Médio** | Implementar virtualização e projeção parcial (Apenas ativos críticos). |
| **Migração** | Duplicação de endereços em clientes com lógicas customizadas. | **Baixo** | Auditoria de sanidade na criação do Auto-Site. |

---

### 8. ORDEM REAL DE IMPLEMENTAÇÃO (CUSTO-BENEFÍCIO)

A sequência lógica para minimizar atrito é:
1.  **Site Domain:** (Endereços e Logística).
2.  **Asset Domain:** (Inventário e Identidade).
3.  **Vínculo OS ↔ Asset:** (Hereditariedade Técnica).
4.  **Asset 360:** (Visibilidade Técnica).
5.  **Preventivas:** (Recorrência e Inteligência).
6.  **Contratos:** (Otimização Comercial).

---
**Veredito:** A implementação é segura. O maior ponto de atenção é a **Migração de Endereços**. Resolvendo isso via "Auto-Site", o restante do sistema fluirá naturalmente sem quebrar o MVP já entregue.

**Próximo Passo:** Iniciar a **Fase 3B real** começando pelo domínio **Site**.