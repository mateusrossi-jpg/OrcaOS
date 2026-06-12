# RELATÓRIO DE HOTFIX ARQUITETURAL: CICLO DE VIDA DA OS (FASE 1A)

**Status:** Concluído com Sucesso e Tipagem Segura (0 Erros)
**Objetivo:** Desacoplar a *criação* de uma Ordem de Serviço de sua *execução*, impedindo a poluição dos painéis operacionais e garantindo que o status "Em Execução" seja exclusivo para trabalhos reais em campo.

---

### 1. ARQUIVOS ALTERADOS
- `src/core/types/business.ts` (Core Domain)
- `src/features/workflow/operationalFacade.ts` (Workflow Engine)
- `src/app/utils/workOrderLabels.ts` (UI Dictionary)

---

### 2. MUDANÇA DE ESTADOS (STATE MACHINE)

**Tipagem Anterior (`ServiceStatus`):**
- `in-progress` (Em execução)
- `done` (Concluída)
- `cancelled` (Cancelada)
*(Problema: Uma OS recém-nascida já era considerada "em andamento").*

**Nova Tipagem Expandida:**
- **`draft`** (Aguardando agendamento/preparação) -> *NOVO*
- **`scheduled`** (Agendada) -> *NOVO*
- `in-progress` (Em execução - Trabalho físico iniciado)
- `done` (Concluída)
- `cancelled` (Cancelada)

---

### 3. TRANSIÇÕES PERMITIDAS E ATUALIZADAS

**Orçamento Aprovado → Geração de OS**
- *Como era:* `operationalFacade` criava a OS com status `in-progress` e instantaneamente mudava o status do Orçamento para `EM_EXECUCAO`.
- *Como ficou:* `operationalFacade` cria a OS Derivada com status **`draft`** (Aguardando Agendamento). O Orçamento atrelado permanece como `AUTORIZADO`.

**Início da Execução (Trincheira)**
- *Como ficou:* Somente quando o técnico ou o operador de base atualiza a OS para o status **`in-progress`** (via `updateWorkOrder`), o sistema dispara o evento `WORKORDER_STARTED` e, neste momento exato, atualiza o Orçamento pai para `EM_EXECUCAO`.

---

### 4. RISCOS MITIGADOS E PREVENIDOS

- **Poluição de Trincheira (Resolvido):** Painéis de execução (como a aba "Operações") agora podem filtrar estritamente por `status === 'in-progress'`. OSs pendentes ou futuras (`draft`, `scheduled`) não poluirão mais o radar de foco imediato do usuário.
- **Dissonância Lógica (Resolvido):** A aprovação de um orçamento pelo cliente não significa mais que a equipe está no local martelando a parede. O sistema agora reflete a linha do tempo física do mundo real.

---

### 5. IMPACTOS FUTUROS (PREPARAÇÃO PARA FASE 1B)

- **Aba "Operações":** Agora será possível dividir a UI da trincheira em duas listas claras: "O que fazer (Aguardando/Agendado)" e "O que está acontecendo (Em Execução)".
- **Aba "Agenda":** O filtro da agenda ganha precisão. OSs em `draft` são o backlog de "A Fazer" que precisam ser arrastadas ou atribuídas a uma data (`scheduledDate`), mudando seu status para `scheduled`.

---
**Hotfix Estrutural Encerrado.** O ciclo de vida da OS está blindado e pronto para ser consumido de forma segura pelas interfaces operacionais nas próximas fases.