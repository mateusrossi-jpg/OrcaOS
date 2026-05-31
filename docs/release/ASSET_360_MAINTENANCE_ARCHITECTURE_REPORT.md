# RELATÓRIO DE AUDITORIA: ASSET 360 & MAINTENANCE ARCHITECTURE — AFERIX OS

**Status:** Auditoria e Consolidação Concluída (READ-ONLY)
**Perfil:** Solutions Architect & Service Operations Strategist
**Objetivo:** Consolidar a arquitetura técnica definitiva do Aferix, integrando Ativos, Planos de Manutenção e Contratos em um ecossistema escalável e proativo.

---

### ETAPA 1: ASSET 360 (A IDENTIDADE TÉCNICA)

O **Asset 360** é o equivalente ao Client 360, mas focado na integridade da máquina/sistema.

**Asset Executive Header (Os 3 Pilares):**
1.  **Estado Operacional:** `ACTIVE`, `MAINTENANCE`, `CRITICAL`.
2.  **Timeline Técnica:** Rastreabilidade de quem tocou no ativo e quando.
3.  **Saúde Predictiva:** `AssetHealthScore` (calculado via falhas vs. preventivas).

**KPIs Essenciais (< 5s):**
*   `Última Preventiva:` Data e Responsável.
*   `Próxima Ação:` Dias restantes para o plano de manutenção.
*   `Garantia:` Status (Fabricante e Serviço).
*   `Custo Acumulado:` Soma financeira de todas as OSs vinculadas.

---

### ETAPA 2: MAINTENANCE PLAN (O MOTOR DE RECORRÊNCIA)

O **MaintenancePlan** é uma entidade filha do **Asset**.

*   **Relação:** `Asset (1) -> (N) MaintenancePlan`.
*   **Inteligência:** Um plano define a frequência (mensal, trimestral, etc.) e o checklist técnico necessário.
*   **Geração:** O plano é o responsável por injetar `WorkOrder drafts` (pré-agendadas) no Pipeline Operacional, garantindo que o prestador nunca esqueça uma visita recorrente.

---

### ETAPA 3: MULTI-ASSET WORKORDER (OPERAÇÃO EM ESCALA)

Para evitar a inflação de OSs (5 OSs para 5 aparelhos no mesmo local), adotamos a modelagem de **Múltiplos Ativos por Intervenção**.

*   **Entidade:** `WorkOrder` conterá um array `assetIds[]`.
*   **Checklist:** A UI de execução deverá agrupar as tarefas por Ativo (ex: "AC 01: Limpar filtro", "AC 02: Limpar filtro").
*   **Timeline:** Um evento de `MAINTENANCE_COMPLETED` será disparado individualmente para cada ativo vinculado ao final da OS.

---

### ETAPA 4: GARANTIAS (PROTEÇÃO TÉCNICA)

**Classificação de Prioridade:**
*   **MVP:** Campos diretos no `Asset` (`manufacturerWarrantyUntil`, `serviceWarrantyUntil`).
*   **Pós-MVP (Enterprise):** Entidade `Warranty` própria para gerenciar extensões de garantia e componentes internos (ex: garantia do compressor vs. garantia da placa).

---

### ETAPA 5: QR CODE & IDENTIDADE FÍSICA

O QR Code identifica o **Asset**.

*   **Fluxo Técnico:** Escanear o QR abre instantaneamente o **Asset 360**.
*   **Fluxo de Emergência:** Escanear e clicar em "Abrir Chamado" pré-preenche a OS com o `clientId`, `siteId` e `assetId` corretos.
*   **Risco:** Perda física da etiqueta. O sistema deve permitir a busca manual por `TAG` ou `SerialNumber`.

---

### ETAPA 6: HIERARQUIA DE DOCUMENTAÇÃO TÉCNICA

Definição de posse de arquivos:
*   **Manuais e Diagramas:** Pertencem ao **Asset** (Referência Permanente).
*   **Projetos e Plantas:** Pertencem ao **Site** (Referência Local).
*   **Fotos de Antes/Depois e Relatórios:** Pertencem à **WorkOrder** (Evidência de Execução).

---

### ETAPA 7: CONTRATOS (MODERNO E FLEXÍVEL)

O **Contrato** é o envelope comercial que cobre os ativos.

**Estrutura Validada:**
`Contract`
├── `clientId`
├── `siteIds[]` (Onde o contrato atua)
├── `assetIds[]` (Quais máquinas estão cobertas)
└── `billingCycle` (Vínculo com o Financeiro)

*Esta estrutura suporta desde um contrato de "Limpeza de Piscina" (1 Site, 1 Ativo) até um contrato corporativo de "Manutenção Predial" (N Sites, N Ativos).*

---

### ETAPA 8: ASSET HEALTH SCORE (0-100)

Algoritmo sugerido para o futuro motor de inteligência:
*   **+40 pts:** Preventiva em dia.
*   **-30 pts:** Cada falha técnica reportada nos últimos 90 dias.
*   **-50 pts:** Se estiver no status `CRITICAL`.
*   **-20 pts:** Se a garantia expirou.

---

### ETAPA 9: IMPACTO NO CLIENT 360

O **Client 360** não será poluído com log técnico detalhado.
*   Ele mostrará um **"Sumário de Frota"**: "12 Ativos (10 Saudáveis, 2 Críticos)".
*   Ao clicar em um ativo, o sistema navega para o **Asset 360**.

---

### VEREDITO EXECUTIVO

1.  **Asset é domínio raiz?** Sim.
2.  **Entidade Própria?** Obrigatória.
3.  **Event Sourcing?** Essencial para Garantias e Auditorias.
4.  **Obrigatório para Preventivas?** Sim, é o coração do agendamento.
5.  **Sequência definitiva:**
    **Asset Foundation (3B) -> Multi-Asset OS (3C) -> Maintenance Intelligence (3D) -> Contract Hub (3E)**

---
**Auditoria Concluída.** A arquitetura técnica do Aferix OS está agora desenhada para a eternidade. Temos clareza total sobre como as máquinas, os planos e os contratos se relacionam. Nenhuma etapa foi pulada, nenhum retrabalho foi gerado.

**Próximo Passo:** Implementar fisicamente as tabelas `Sites` e `Assets` no Dexie e os Services correspondentes. (Fase 3B Real).