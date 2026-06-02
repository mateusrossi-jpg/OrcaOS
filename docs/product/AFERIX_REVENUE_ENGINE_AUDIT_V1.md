# AFERIX REVENUE ENGINE AUDIT V1
**Transformando Falhas Técnicas em Máquina de Receita**

## 1. Revenue Engine Architecture (A Máquina de Vendas)
Atualmente, o fluxo de dinheiro morre no "X" vermelho. O técnico detecta uma falha e o sistema para. A arquitetura do *Revenue Engine* inverte isso: **A anomalia não é o fim de um serviço, é o *Inbound Lead* (gatilho de venda) para um novo orçamento.**
Em uma empresa de manutenção, a margem de lucro real não está no contrato de manutenção preventiva (que é uma commodity espremida). A margem está na Manutenção Corretiva. O Aferix precisa capturar essa oportunidade no milissegundo em que ela é detectada em campo, eliminando o atrito da redigitação.

---

## 2. Domain Model & Entidades
A rastreabilidade (Fio de Ouro) é vital. A mesma anomalia detectada viaja por todo o sistema.

*   **`Anomaly` (Anomalia):** Uma entidade embutida na execução (`AssetExecution`), contendo `id`, `assetId`, `itemKey`, `description`, `photoUuids`, `status: pending | quoted | approved | resolved`.
*   **`Recommendation` (Recomendação):** Descrição técnica da solução ("Trocar válvula de serviço e recarga de gás").
*   **`Budget / Proposal` (Orçamento):** Herda automaticamente o `anomalyId`. O sistema injeta o `assetId`, `clientId`, e `siteId`. Falta apenas colocar o preço (R$).
*   **`WorkOrder` (OS Corretiva):** Gerada automaticamente quando o cliente aprova o `Budget`. Carrega o `anomalyId` para fechar o ciclo.

---

## 3. UX Flow (A Experiência de Receita)

### O Fluxo Técnico (Campo)
1. **Detecção:** Técnico marca "Pressão do Gás" como `[X] Não Conforme`.
2. **Registro Imediato:** Um modal limpo desliza (bottom sheet). 
   * "Adicionar Foto da Evidência" (Câmera abre na hora).
   * "Qual a recomendação?" (Campo com suporte forte a digitação por voz).
3. **Fim do Expediente:** A OS é fechada e o laudo de preventiva é gerado.

### O Fluxo Proprietário (Base/Comercial)
1. **O Gatilho:** Assim que o técnico assina a preventiva, a Home do Gestor (Dashboard) acende um alerta verde brilhante: **"3 Anomalias Detectadas hoje aguardando Orçamento. Potencial de Receita: R$ ??"**.
2. **Conversão (1 Clique):** O dono clica na anomalia. O Aferix já abre a tela de `BudgetForm`.
3. **Automação:** O Cliente, o Prédio, o Ar Condicionado, o Defeito (Evidência) e a Recomendação *já estão preenchidos*. O dono só adiciona: `Serviço: R$ 800,00` e clica em **[GERAR PROPOSTA]**.

### O Fluxo de Aprovação (Cliente)
1. **WhatsApp:** O sistema envia a proposta com o link mágico (Client Portal).
2. **Decisão:** O cliente vê as fotos do vazamento tiradas há 3 horas, a recomendação técnica e o valor de R$ 800,00. Ele clica no botão verde **[APROVAR ORÇAMENTO]**.
3. **OS Automática:** A aprovação online dispara a criação de uma `WorkOrder` (Corretiva) na agenda da empresa. O dinheiro rodou sozinho.

---

## 4. Event Flow (Event Bus Architecture)
O Event Store precisa registrar essa jornada emocional de venda para auditoria:
*   `ANOMALY_DETECTED` (Técnico marca falha)
*   `ANOMALY_EVIDENCE_ATTACHED` (Técnico tira foto)
*   `BUDGET_DRAFTED_FROM_ANOMALY` (Dono clica para orçar)
*   `PROPOSAL_SENT_VIA_WHATSAPP` (Envio do link mágico)
*   `PROPOSAL_APPROVED_BY_CLIENT` (Clique do cliente no portal)
*   `WORK_ORDER_AUTO_CREATED` (OS corretiva agendada)
*   `ANOMALY_RESOLVED` (Técnico executa a nova OS)

---

## 5. Screens Required (Novas Interfaces)
1. **Bottom Sheet de Anomalia:** Um modal ultrarrápido (meia tela) que sobe apenas quando algo é marcado como "Não Conforme". Foca em 2 coisas: Câmera e Áudio (Voz para texto).
2. **Painel de Oportunidades (Gestor):** Uma lista na tela principal da empresa, estilo "Kanban" ou Lista de Tarefas, focada puramente nas anomalias aguardando preço.
3. **Portal de Aprovação (Link Cliente):** Uma Landing Page dedicada com estética premium. Metade superior: Evidências da quebra (Fotos). Metade inferior: O valor (R$) e botões de `[Aprovar]` / `[Recusar]`.

---

## 6. Database Changes (Mudanças Necessárias)
**Dexie Schema Updates (V19):**
*   `assetExecutions`:
    *   Adicionar campo `anomalies: Anomaly[]`.
*   `budgets`:
    *   Adicionar campo `originAnomalyId?: string`.
    *   Adicionar campo `originWorkOrderId?: string`.
*   `workOrders`:
    *   Adicionar campo `resolutionForAnomalyId?: string`.
    *   Mudar `type` para suportar `preventive | corrective | installation`.

---

## 7. `anomalyId` Strategy (O Fio de Ouro)
A estratégia do `anomalyId` é o passaporte que viaja por todo o banco.
Ele nasce UUID v4 na ponta do dedo do técnico e nunca morre. 
Se um cliente reclamar *"Vocês não consertaram meu AC!"*, o sistema pode rastrear:
`anomalyId` -> `AssetExecution` (Quem achou) -> `Budget` (Quando foi orçado) -> `Portal` (Quem assinou) -> `WorkOrder` (Quem consertou).
Rastreabilidade 100% blindada e à prova de balas para auditorias jurídicas e brigas comerciais.

---

## 8. Final Executive Verdict (O Pivô Final)
**O Aferix deve parar de celebrar a conformidade e começar a celebrar a não conformidade.** 

No mundo da prestação de serviço, "Tudo Ok" significa que você cumpriu seu dever cívico. Onde o equipamento "Quebra", é onde a sua empresa fatura, troca peças e agrega valor premium de salvamento.

O fluxo atual é puramente um "Custos Engine". O técnico executa e isso custa homem-hora.
Ao plugar o "Revenue Engine", nós fechamos a roda. A cada vazamento detectado no calor do campo, um orçamento pisca na tela do gestor 3 segundos depois. 

**Redigitação = Zero.**
**Perda de Oportunidades de Manutenção Corretiva = Zero.**
**Roadmap Recomendado:** Elevar este motor de vendas a P0 para a próxima grande atualização de arquitetura do sistema. Isso converte o Aferix de "Gasto" (Software de OS) para "Investimento" (Máquina de Vendas Automática).
