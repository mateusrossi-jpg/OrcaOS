# AUDITORIA FASE 1C.2: WORKSPACE DE ORDEM DE SERVIÇO (OS)

**Status:** Auditoria Concluída (Somente Leitura)
**Objetivo:** Validar se o atual `OperationsHubWorkspace` pode atuar como o painel central do fluxo de vida da OS ou se requer uma nova tela, identificando o caminho de menor fricção para integrar a nova arquitetura (Fases 1A e 1B) à interface.

---

### 1. COMPONENTES EXISTENTES
O arquivo `OperationsHubWorkspace.tsx` possui um conjunto maduro de componentes do Design System que são perfeitamente aderentes ao tema Dark Premium:
*   **Cards:** `SurfaceCard` (com elevação e bordas glassmorphism).
*   **Chips/Badges:** `SemanticBadge` ("AO VIVO"), `OpsChip`.
*   **Filtros:** `SearchInput` (usado na aba de inteligência).
*   **Ações:** Botão `Plus` (flutuante no header), botões de tabulação (`Ação` / `Carteira`), botão de ação da OS (`CheckCircle2`).
*   **Hooks/Serviços:** Consome `clientService.getAll()` e `operationalReadModelService.getBoardProjection()`.
*   *Veredito:* Visualmente pronto. Nenhum componente estrutural novo é necessário.

---

### 2. DADOS CONSUMIDOS
**Mistura Tóxica.** Hoje a tela lê o `boardData` vindo do `operationalReadModelService.getBoardProjection()`. 
*   **O Problema:** Esta projeção varre primeiramente os **Budgets** (Orçamentos). Ela preenche a lista `inExecution` checando `budget.status === 'em_execucao' || proj.workOrderStatus === 'in-progress'`. 
*   **O Risco:** A tela está amarrada ao Orçamento. Se houver uma "OS Avulsa" (sem orçamento), o `getBoardProjection()` falhará em exibi-la ou a agrupará erroneamente.

---

### 3. ADERÊNCIA AO FLUXO NOVO
A tela **NÃO** consegue representar o fluxo novo atualmente.
Ela foi construída assumindo orçamentos. Não há espaço lógico na UI atual para `draft` (Aguardando Agendamento) ou `scheduled` (Agendadas). A interface salta do nada direto para um bloco "Em Execução Agora".

---

### 4. MAPA OPERACIONAL (A NOVA TRINCHEIRA)
Para representar a realidade do técnico em campo, a aba "Ação" deve ser reestruturada nos seguintes blocos lógicos, usando os mesmos `SurfaceCards`:

1.  **Fila de Preparação:** (Filtro: `status === 'draft'`). OSs recém-aprovadas ou avulsas que precisam de um técnico ou material atribuído.
2.  **Agendadas:** (Filtro: `status === 'scheduled'`). O que está na fila para hoje ou próximos dias.
3.  **Em Execução:** (Filtro: `status === 'in-progress'`). O "Ao Vivo". Onde o técnico está agora. (Já existe visualmente).
4.  **Concluídas (Histórico Recente):** (Filtro: `status === 'done'`). OSs fechadas recentemente para referência. *(Aguardando Recebimento vai para a aba Financeira).*

**Isso pode ser feito reutilizando a tela atual?**
**SIM.** A estrutura visual de listagem dentro de um `map()` de cards é flexível o suficiente para ser envelopada em blocos agrupadores com títulos diferentes (usando o componente `<Label>`).

---

### 5. CRIAÇÃO DE OS AVULSA
**Onde o botão deveria existir:**
O `OperationsHubWorkspace` já possui um botão `<Plus>` dourado flutuante ao lado do título "Operações".
Hoje ele dispara `onNavigate('new-budget')`. 
*Proposta:* Ao clicar, ele deve abrir uma `ActionMenu` (componente existente) perguntando: "Novo Orçamento" ou "Nova OS Avulsa". Se escolher OS Avulsa, abre um modal rápido pedindo Cliente e Título, injetando direto no `workOrderService`.

---

### 6. HOME
**A Home deve continuar lendo Budgets ou WorkOrders?**
**WorkOrders.**
*Justificativa:* O "Command Center" do técnico (A Home) deve focar na ação física. Se um orçamento está aprovado, a ação física é a OS derivada (que estará em `draft`). A Home deve alertar o técnico: "Você tem 3 OSs agendadas para hoje" (lendo `WorkOrder.scheduledDate`) e "Você tem 1 OS aguardando agendamento" (lendo `WorkOrder.draft`). O orçamento volta a ser apenas um documento da gaveta comercial.

---

### 7. RISCOS
*   **Acoplamento em `getBoardProjection()`:** Enquanto a aba Operações usar esta projeção, ela estará amarrada aos orçamentos.
*   **Dashboards Antigos:** A tela de `HomeScreen` ainda usa `useHomeAttentionStack.ts` que faz um duplo-loop perigoso entre Orçamentos e OSs, podendo gerar cartões duplicados se não for limpo.
*   **O "Limbo" da Conclusão:** Se a OS vai para `done`, ela some da aba de Ação. O técnico precisa confiar que a tela de Financeiro capturou a pendência (o que a Fase 1B já garantiu).

---

### 8. DECISÃO FINAL

**OPÇÃO A) OperationsHubWorkspace pode ser reutilizado.**

**Justificativa Técnica:**
A separação entre Apresentação (UI) e Dados (Store) no React permite que mantenhamos 100% dos `Imports`, `divs`, `Cards` e estilos Dark Premium intactos. O trabalho necessário é estritamente **substituir o Data Binding**. 
Em vez de ler `board?.inExecution` via ReadModel de orçamentos, o componente importará o `workOrderService.getAll()`, dividirá o array em `draftOS`, `scheduledOS` e `activeOS`, e fará o renderização. É o caminho de menor atrito, zero esforço CSS e maior aderência ao MVP.