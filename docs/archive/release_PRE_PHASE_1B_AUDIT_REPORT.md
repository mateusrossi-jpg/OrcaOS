# AUDITORIA PRÉ-FASE 1B: ARQUITETURA FINANCEIRA

**Objetivo:** Validar a aderência do domínio financeiro atual frente ao fluxo oficial do MVP (`OS → Valor Final → Recebimento → Encerramento`).

---

### 1. Como o sistema calcula lucro atualmente?
O lucro é calculado de forma centralizada pelo `BudgetCalculatorService.ts` e envelopado pelo `aferixFinanceEngine.ts`. 
**A falha:** O cálculo depende estritamente da interface `BudgetInputs`, baseando-se no campo `chargedValue` (Valor Orçado) menos as deduções (material, deslocamento, taxas, etc.). Atualmente, a execução real em campo não retroalimenta este motor de cálculo nativamente; o sistema apenas "congela" o lucro orçado como lucro final.

### 2. Qual a diferença atual entre os valores?
*   **Valor Orçado:** É o `chargedValue` na entidade `Budget`. (Existe e funciona bem).
*   **Valor Executado:** Criamos o `executedValue` na entidade `WorkOrder` na Fase 1A. (Existe, mas o motor financeiro atual o ignora completamente).
*   **Valor Recebido:** É o `receivedAmount` dentro de `SimpleFinanceRecord`. (Existe, mas é usado como uma re-escrita do orçamento, não como um controle de fluxo de caixa real).

### 3. O SimpleFinanceRecord suporta pagamento parcial, múltiplos recebimentos, saldo aberto?
**NÃO SUPORTA.**
A entidade atual (`domain/finance.ts`) possui um único `receivedAmount` e um status binário (`forecast` | `realized`).
*   **Conflito Grave:** A função `recordFinanceAdjustment` no `operationalFacade.ts` pega o `receivedAmount` e *sobrescreve* o `chargedValue` original do Orçamento para forçar a matemática a bater. Isso destrói o histórico do que foi orçado vs. o que foi pago e impede o registro de múltiplos pagamentos para quitar um saldo aberto.

### 4. O financeiro está vinculado ao Budget ou à WorkOrder?
**Vinculado ao Budget.**
A entidade `SimpleFinanceRecord` possui a chave estrangeira `sourceBudgetId`. Isso impossibilita faturar uma "OS Avulsa" (que não possui orçamento), quebrando o requisito principal definido na Etapa 2 das Decisões Executivas.

### 5. Onde o sistema assume Orçamento = Receita?
Em **todo o sistema de leitura (Read Models)**.
*   `operationalReadModelService.ts`: Ao agregar métricas (`getMetricsProjection`), a receita é calculada somando os snapshots financeiros gerados na finalização do *Orçamento*, ignorando o valor real da *OS*.
*   `SimpleFinanceWorkspace.tsx`: Na listagem de liquidações, a UI processa `(b.chargedValue - b.discounts)` direto da tabela de orçamentos, assumindo que a promessa se tornou realidade financeira exata.

### 6. Onde o sistema assume OS Concluída = Dinheiro Recebido?
Na fachada de orquestração (`operationalFacade.ts`).
*   **Gatilho Automático:** A função `completeWorkOrder` chama `finalizeBudget`, que por sua vez emite o evento `FINANCE_RECORD_REALIZED` injetando 100% da receita como ganha. 
*   **Risco Operacional:** O técnico fecha a OS no aplicativo quando termina de limpar o local da obra. Ao fazer isso hoje, o sistema entende que o dinheiro já está na conta do prestador, ignorando o tempo de recebimento ou a emissão de boletos.

---

### 7. ARQUITETURA ATUAL vs. ARQUITETURA MVP

| Critério | Arquitetura Atual (OrcaOS Legacy) | Arquitetura MVP (Objetivo Aferix) |
| :--- | :--- | :--- |
| **Origem da Receita** | `Budget.chargedValue` | `WorkOrder.executedValue` |
| **Vínculo do Recebimento** | `sourceBudgetId` | `workOrderId` |
| **Liquidação** | Automática ao fechar OS | Manual/Registrada no Recebimento |
| **Pagamento Parcial** | Não suporta (sobrescreve orçamento) | Suporta (Soma de N recebimentos contra Saldo Aberto) |
| **Ciclo de Vida** | Promessa Comercial = Dinheiro em Caixa | OS Finalizada abre Contas a Receber |

---

### 8. NECESSIDADES DE MIGRAÇÃO E AJUSTES (Para a Fase 1B)

Para implementar a Fase 1B com segurança e sem quebrar o sistema, as seguintes refatorações estruturais são obrigatórias:

1.  **Refatoração do Domínio Financeiro (`domain/finance.ts`):**
    *   Mudar a chave estrangeira de `sourceBudgetId` para `workOrderId`.
    *   Adicionar os campos obrigatórios aprovados: `finalValue` (Total da OS), `receivedValue` (Total pago até agora), e `openBalance` (Saldo a pagar).
    *   Expandir o status para: `pending` | `partial` | `paid`.
2.  **Desacoplamento do Gatilho (`operationalFacade.ts`):**
    *   Remover a emissão do evento `FINANCE_RECORD_REALIZED` de dentro de `completeWorkOrder`.
    *   O fechamento da OS deve apenas criar o registro de "Contas a Receber" pendente.
3.  **Atualização do Motor de Leitura (`operationalReadModelService.ts`):**
    *   Mudar a agregação de receita para ler a tabela de recebimentos (`FinancialRecord`) atrelada às `WorkOrders`, em vez dos snapshots de `Budget`.
4.  **Ajuste Visual (`SimpleFinanceWorkspace.tsx`):**
    *   A tela de "Linha do Tempo de Liquidações" deve passar a listar as OSs concluídas, mostrando a barra de progresso do recebimento, em vez de listar orçamentos concluídos.

**Status Final:** Auditoria concluída. Nenhuma implementação realizada. Aguardando diretrizes para a FASE 1B.