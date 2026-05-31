# AUDITORIA FASE 1C.3: A HOME E O CENTRO DE COMANDO

**Status:** Auditoria Concluída (Somente Leitura)
**Objetivo:** Avaliar a aderência da tela inicial (`HomeScreen.tsx` e seus hooks de alimentação) à nova arquitetura descentralizada do Aferix, identificando contaminações legadas e propondo um roadmap de adequação.

---

### 1. INVENTÁRIO COMPLETO E FONTES DE DADOS
A Home atual utiliza o hook `useHomeAttentionStack.ts` para classificar cartões de atenção (P0, P1, P2) e o `useFinancialCycleSummary` para os KPIs financeiros.

*   **Card: Serviço Paralisado (P0 - blocked_wo)**
    *   *Objetivo:* Alertar sobre serviços travados.
    *   *Fonte Atual:* `Budget` (Status === 'PAUSADO') e `WorkOrder` (Status === 'in-progress' & priority === 'urgent').
*   **Card: Cobrança Atrasada (P0 - overdue_payment)**
    *   *Objetivo:* Alertar sobre dinheiro não recebido.
    *   *Fonte Atual:* Mistura. Lê `WorkOrder` (Status === 'done' & paymentStatus === 'pending'), mas extrai o valor de `Budget.chargedValue`.
*   **Card: Proposta Aprovada (P1 - approved_proposal)**
    *   *Objetivo:* Converter proposta em serviço.
    *   *Fonte Atual:* `Budget` e `ClientProposal` (Status === 'AUTORIZADO' / 'approved').
*   **Card: Proposta Visualizada / Pendente (P1 - viewed/follow_up)**
    *   *Objetivo:* Pipeline comercial (Follow-up).
    *   *Fonte Atual:* `ClientProposal` e `Budget`.
*   **Card: Próxima Visita (P2 - today_job)**
    *   *Objetivo:* Ação operacional imediata.
    *   *Fonte Atual:* `WorkOrder` (onde `scheduledDate` === hoje). Usa o `Budget` atrelado apenas para buscar o nome do cliente.
*   **Métrica: Recebíveis (Atrasados)**
    *   *Fonte Atual:* Soma `Budget.chargedValue` de todas as OSs concluídas que estão com pagamento pendente.
*   **Métrica: Metas e Forecast (Monthly Goal Progress)**
    *   *Fonte Atual:* `financialSummary.profit` projetado artificialmente (Média Diária * 30).

---

### 2. AUDITORIA DE DOMÍNIO E CONTAMINAÇÕES

Encontrei **Múltiplas Contaminações Graves** onde o sistema tenta usar o domínio Comercial para resolver problemas Operacionais e Financeiros:

*   **[CONTAMINAÇÃO] Budget = Trabalho:** O alerta de "Serviço Paralisado" aciona se o *Orçamento* estiver 'Pausado'. O orçamento é um documento comercial; quem pausa é a *Execução* (OS).
*   **[CONTAMINAÇÃO] Budget = Receita:** A métrica de "Recebíveis" calcula dívidas lendo o `chargedValue` do Orçamento. Se o "Valor Final" da OS foi diferente na hora do checkout (Fase 1C.1), a Home exibirá um furo de caixa.
*   **[CONTAMINAÇÃO] OS Concluída = Pago:** O alerta de "Cobrança Atrasada" infere o status da dívida olhando para o `paymentStatus` dentro da OS. Mas na Fase 1B, nós movemos o controle de pagamento e saldo aberto para o `FinancialRecord`.
*   **[CONTAMINAÇÃO] OS Dependente de Orçamento:** O "Próxima Visita" faz um lookup no `Budget` para encontrar o nome do cliente. Na Fase 1A, nós fizemos o `clientId` ser um campo obrigatório nativo da OS.

---

### 3. AUDITORIA DOS CARDS (O QUE FAZER)

| Card Atual | Domínio | Ação | Justificativa Técnica |
| :--- | :--- | :--- | :--- |
| **Serviço Paralisado** | Operacional | **ALTERAR** | Deve ler apenas `WorkOrder` (status em execução, com algum flag de bloqueio). |
| **Cobrança Atrasada** | Financeiro | **ALTERAR** | Deve ler a tabela `FinancialRecord` (status pending/partial com `openBalance > 0`). |
| **Proposta Aprovada** | Operacional | **ALTERAR** | Com a Fase 1A, a OS nasce automática. Este card deve alertar "OS Aguardando Agendamento" lendo `WorkOrder` (status `draft`). |
| **Proposta Visualizada**| Comercial | **MANTER** | É um aviso comercial real e útil. |
| **Próxima Visita** | Operacional | **ALTERAR** | Manter a leitura de `WorkOrder.scheduledDate`, mas ler o nome do cliente do `clientService`, removendo a busca no Budget. |

---

### 4. AUDITORIA DE KPIs (Vaidade)

*   **Métrica: Forecast e Monthly Goal Progress** -> **REMOVER/ALTERAR.**
    *   *Motivo:* É uma métrica de vaidade baseada em uma média artificial. O Aferix preza pela ação direta. O técnico quer saber "Quanto eu já recebi?" e "Quanto falta receber do que eu já fiz?". A barra de progresso deve focar em Saldo Aberto (`openBalance`) vs Receita Liquidada. Violar isso fere o `workspace-principles.md`.

---

### 5. DEFINIÇÃO DA NOVA HOME

Se o Aferix é o Sistema Operacional de Bolso do prestador:
**A Home deve ser um: D) CENTRO DE COMANDO INTEGRADO.**

Ela precisa responder a 4 perguntas essenciais, conectando os 3 domínios (Comercial, Operacional, Financeiro):
1. **O que fazer agora?** (Próximas Visitas -> *WorkOrder: scheduled*)
2. **Quem está esperando?** (Orçamentos a aprovar / OSs a agendar -> *Budget/WorkOrder: draft*)
3. **O que está paralisado?** (Gargalos -> *WorkOrder: bloqueada*)
4. **Onde está meu dinheiro?** (Cobranças -> *FinancialRecord: openBalance > 0*)

---

### 6. ROADMAP FASE 1C.3

A Home é a tela mais complexa do aplicativo, mas sua refatoração estética é desnecessária. O problema está isolado no hook `useHomeAttentionStack.ts`.

*   **Implementação Mínima (Foco total da 1C.3):**
    *   Refatorar `useHomeAttentionStack.ts` para parar de ler `Budgets` quando procurar receita ou clientes.
    *   Mudar o card de "Cobrança Atrasada" para varrer `financeService.listRecords()` procurando `openBalance > 0`.
    *   Mudar o card de "Proposta Aprovada" para ler `workOrders.filter(wo => wo.status === 'draft')`.
    *   Garantir que a "Próxima Visita" pegue o `clientName` consultando a lista de clientes, e não o orçamento.

*   **Implementação Recomendada (Pós-MVP):**
    *   Substituir a métrica de vaidade (Forecast) por um painel de "Liquidez" exibindo o total pendente real da rua.

*   **Implementação Ideal (Futuro):**
    *   Integração com notificações Push e Geofencing para alertar a "Próxima Visita" com base na proximidade do endereço da OS.

---
**VEREDITO FINAL:**
A Home atual está aderente ao Aferix? **NÃO.**
*Motivo:* Ela é um dinossauro estético. Visualmente ela é o Aferix, mas "por baixo do capô" ela funciona como o antigo sistema, usando o Orçamento (Budget) como muleta para responder a perguntas que agora têm entidades próprias (OS e Financeiro). A refatoração do seu Data Binding é o último passo para fechar o MVP estrutural.