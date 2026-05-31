# AUDITORIA FASE 1C: ADERÊNCIA DA INTERFACE (UI) AO FLUXO OFICIAL

**Objetivo:** Validar se a interface atual suporta o fluxo oficial `Cliente → OS Avulsa → OS Execução → Valor Final → Recebimento Parcial` e definir o menor caminho para conectar a UI à arquitetura construída na Fase 1A e 1B.

---

### 1. QUAIS TELAS JÁ SUPORTAM ESTE FLUXO?
- **Nenhuma.** O visual das telas é excelente, mas o *Data Binding* (vínculo de dados) de todas elas ainda espelha a arquitetura antiga.
- O `SimpleFinanceWorkspace` foi o único parcialmente adaptado na Fase 1B, mas ainda requer que a tela de "Finalização de OS" envie os inputs corretos.

### 2. QUAIS TELAS AINDA REFLETEM A ARQUITETURA ANTIGA?
- **`HomeScreen.tsx` e `useHomeAttentionStack.ts`:**
  - O cálculo do `receivables` (Atrasados) lê `budget.chargedValue` ao invés de `workOrder.executedValue - receivedValue` (Furo de Caixa).
  - Continua tratando Orçamento "ENVIADO/APROVADO" como item acionável, ao invés de ler as OSs geradas em `draft`.
- **`ClientsScreen.tsx` (`OperationsHubWorkspace`)**
  - Renderiza apenas orçamentos em andamento; não tem conhecimento das OS Avulsas ou de OS derivadas em `draft/scheduled`.

### 3. A ABA "OPERAÇÕES" DEVE SER SUBSTITUÍDA POR "OS"?
- **Sim, mas sem refazer a tela.** O arquivo `OperationsHubWorkspace.tsx` possui um design system perfeito. Apenas o hook que o alimenta deve parar de buscar `budgets` e passar a buscar `workOrders` ordenadas por `status` (separando o que é `draft/scheduled` do que é `in-progress`).

### 4. COMO A HOME DEVE CONSUMIR WORKORDERS REAIS?
- O hook `useHomeAttentionStack` deve parar de fazer loop duplo (`budgets` vs `workorders`) para inferir status.
- **Hoje (`p2.todayJobs`):** Mapear as `WorkOrders` com status `scheduled` cuja `scheduledDate` bata com hoje.
- **Bloqueios (`p0`):** Mapear OSs onde o `status` seja `in-progress` com `priority === 'urgent'`.
- **Dinheiro a Receber (`p0.overdue_payment`):** Mapear Registros Financeiros onde `status === 'partial' || status === 'pending'` e o `openBalance > 0`.

### 5. COMO A AGENDA DEVE CONSUMIR WORKORDERS REAIS?
- A Agenda (hoje parcialmente ausente do menu principal ou misturada) deve simplesmente renderizar uma lista filtrada do repositório de OS: `workOrders.filter(wo => wo.status === 'scheduled')`.

### 6. QUAIS COMPONENTES VISUAIS JÁ EXISTEM PARA ISSO?
- `SurfaceCard`, `OpsChip`, `Badge`, `SemanticScreen`, `FinancialInsightLayout`, e o recém criado `statusLabel()` que já possui traduções ("Aguardando Agendamento", "Agendada"). Nenhum CSS precisa ser escrito.

---

### 7. ROADMAP FASE 1C (A REAÇÃO DA UI)

**FASE 1C.1: O Checkout do Técnico (A Ponte)**
*   **O que:** Criar um formulário/modal simples onde o técnico, ao clicar em "Finalizar OS", informa se houve custo adicional (gerando o `executedValue`) e se já recebeu algo do cliente.
*   **Por que:** Sem essa tela, a OS fecha sem valor e o financeiro não sabe o que cobrar. O código de backend já foi feito na Fase 1B, falta apenas a UI chamar a função `completeWorkOrder` passando os dados.

**FASE 1C.2: O "Operations Hub" (A Trincheira Real)**
*   **O que:** Refatorar `OperationsHubWorkspace.tsx`.
*   **Ação:** Trocar a busca de `budgets` para `workOrders`. Dividir a UI em duas sessões lógicas usando os componentes atuais: "Fila de Preparação" (OSs `draft` e `scheduled`) e "Execução Ativa" (OSs `in-progress`). Adicionar o botão "Nova OS Avulsa".

**FASE 1C.3: A Limpeza da Home (A Mesa do Diretor)**
*   **O que:** Refatorar `useHomeAttentionStack.ts`.
*   **Ação:** Direcionar os ponteiros para a nova realidade. O "A Receber" olha para o `SimpleFinanceService`. O "Agendado Hoje" olha para a `WorkOrder`. Isso conectará o "Command Center" visual com o sangue do aplicativo.

**Prioridade do Roadmap:** O foco é zero refatoração estética. Aproveitar 100% dos `.tsx` existentes, mudando apenas os hooks e os `.map()` de dados.