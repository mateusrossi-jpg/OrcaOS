# AFERIX STATUS MATRIX V1

## 1. Budget Domain (Orçamentos)

| Status | Representação | Próximos Estados Possíveis | Impacto Financeiro |
| :--- | :--- | :--- | :--- |
| `iniciado` | Rascunho técnico | `enviado`, `cancelado` | Nenhum |
| `enviado` | Proposta no cliente | `autorizado`, `recusado`, `cancelado` | Radar Comercial |
| `autorizado` | Venda Fechada (OS Criada) | `em_execucao`, `cancelado` | **Receita Contratada** |
| `em_execucao` | Trabalho iniciado | `finalizado`, `pausado`, `cancelado` | **Receita Contratada** |
| `finalizado` | Ciclo concluído | `arquivado` | **Receita Contratada** |
| `recusado` | Proposta perdida | `iniciado` (re-work) | Nenhum |
| `pausado` | Aguardando cliente/peça | `em_execucao`, `cancelado` | Receita Contratada |
| `cancelado` | Operação abortada | - | Perda de Valor |

---

## 2. WorkOrder Domain (Ordens de Serviço)

| Status | Representação | Próximos Estados Possíveis | Impacto Executivo |
| :--- | :--- | :--- | :--- |
| `awaiting_schedule`*| Pós-venda imediato | `scheduled`, `cancelled` | **Em Execução** |
| `scheduled` | Técnico/Data definidos | `in-progress`, `cancelled` | **Em Execução** |
| `in-progress` | Técnico no local | `done`, `cancelled` | **Em Execução** |
| `done` | Serviço entregue | - | Faturado |
| `cancelled` | Não executada | - | Nenhum |

*\*Proposta de substituição do status `draft` para OSs vendidas.*

---

## 3. Attendance Domain (Atendimentos)

O status do Atendimento é **derivado** dos estados de seus orçamentos e OSs.

| Status Atendimento | Condição de Derivação |
| :--- | :--- |
| `iniciado` | Apenas Budgets `iniciado`/`enviado` ou sem filhos. |
| `autorizado` | Pelo menos um Budget `autorizado` e nenhuma OS iniciada. |
| `em_execucao` | Pelo menos uma OS em `in-progress`. |
| `concluido` | Todas as OSs válidas estão `done`. |
| `cancelado` | Todos os orçamentos/OSs cancelados ou recusados. |

---

## 4. Finance Domain (Registros Financeiros)

| Status | Representação | Trigger |
| :--- | :--- | :--- |
| `pending` | Valor total em aberto | `completeWorkOrder` (com R$ 0 pago) |
| `partial` | Pagamento parcial | `registerPayment` |
| `paid` | Liquidação total | `registerPayment` (saldo zerado) |
