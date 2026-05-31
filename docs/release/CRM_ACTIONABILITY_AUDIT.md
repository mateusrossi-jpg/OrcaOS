# AUDITORIA DE ACIONABILIDADE CRM — AFERIX OS

**Status:** Auditoria Concluída (READ-ONLY)
**Perfil:** CRM Architect & Customer Success Auditor
**Objetivo:** Determinar se o Workspace Clientes é uma ferramenta de gestão estratégica (CRM) ou apenas um repositório visual de cadastros.

---

### ETAPA 1: AUDITORIA DE AÇÃO (O QUE SE FAZ)

Ao abrir o Workspace Clientes hoje, o usuário depara-se com o seguinte cenário:

1.  **O que ele consegue fazer?** Buscar um nome na lista, ver o valor total da carteira (Patrimônio) e abrir um "Log de Eventos" (Dossiê).
2.  **Decisões que consegue tomar?** Identificar quem é o cliente de maior LTV (Lifetime Value).
3.  **Ações que consegue executar?** Iniciar um novo cadastro.
4.  **Problemas identificados em 5 segundos?** Apenas se a base de dados está vazia. Problemas de relacionamento (atrasos, churn, dívidas) estão invisíveis.

| Dado Encontrado | Classificação | Observação |
| :--- | :---: | :--- |
| **Patrimônio Total** | Informação | É um número estático (Vaidade). |
| **Lista de Clientes** | Informação | É um repositório. |
| **Rating (A+)** | Informação | É estático e não reflete comportamento real. |
| **Timeline de Eventos**| Insight | Ajuda a entender o passado, mas não sugere o futuro. |
| **Plus (Novo)** | Ação | Única ação clara de fluxo. |

---

### ETAPA 2: AUDITORIA DE RELACIONAMENTO

O sistema consegue responder às perguntas vitais de um prestador de serviço?

*   **Quem está sumido?** **NÃO.** (Não há cálculo de inatividade visível).
*   **Quem está devendo?** **NÃO.** (O saldo aberto do financeiro não foi cruzado com a lista).
*   **Quem está comprando mais?** **NÃO.** (Não há indicador de tendência).
*   **Quem precisa de retorno?** **NÃO.** (Orçamentos pendentes não geram alerta aqui).
*   **Relacionamento em risco?** **NÃO.**
*   **Atenção imediata?** **NÃO.**

**Justificativa Técnica:** A arquitetura de dados (Fase 1D) já possui as respostas através da Timeline, mas a UI de Clientes ignora estes dados e foca apenas nos campos estáticos da tabela `Client`.

---

### ETAPA 3: AUDITORIA DE CLIENTE INATIVO

**O sistema já possui dados para detectar inativos sem novas tabelas? SIM.**

*   **Como:** O `operationalReadModelService.getClientPipelineProjection()` já extrai o campo `lastInteractionAt`.
*   **Implementação lógica:** Basta comparar `Date.now() - lastInteractionAt > 30 dias`. A infraestrutura está pronta, a UI é que está cega.

---

### ETAPA 4: AUDITORIA DE COBRANÇA

**O usuário identifica devedores sem abrir o Dossiê? NÃO.**
Pior: Mesmo abrindo o Dossiê 360, o saldo devedor real (`openBalance` da Fase 1B) não é exibido no resumo, forçando o técnico a ler a timeline inteira e fazer conta de cabeça.

---

### ETAPA 5: AUDITORIA DO CLIENT 360

O Dossiê hoje parece mais com: **D) Log Técnico.**

*   **Justificativa:** É uma sequência fria de eventos. Falta a "camada executiva" (Ex: "Este cliente já gerou R$ 5.000, mas deve R$ 1.200 agora").

**Pontuação de Visões (0-100):**
*   Resumo Executivo: `30` (Apenas LTV).
*   Visão Financeira: `10` (Só eventos soltos).
*   Visão Operacional: `40` (Mostra quando a OS começou/parou).
*   Visão Comercial: `50` (Mostra propostas).

---

### ETAPA 6: ESCANEABILIDADE (3 SEGUNDOS)

*   **Clientes VIP:** `EXCELENTE` (Destaque em dourado).
*   **Clientes Inativos:** `RUIM` (Inexistente).
*   **Clientes Devedores:** `RUIM` (Inexistente).
*   **Clientes em Risco:** `RUIM` (Inexistente).

---

### ETAPA 7: AUDITORIA DE PRIORIZAÇÃO (VALOR OPERACIONAL)

O modelo atual (**MODELO A — Carteira/Ranking**) foca no Ego do dono da empresa ("Veja quanto você vale").
O modelo desejado (**MODELO B — Orientado à Ação**) foca no Bolso e no Tempo ("Veja quem você precisa cobrar e quem você está perdendo").

**Justificativa:** Para um prestador de serviço de campo, o Modelo B é superior. Saber que um cliente VIP não faz serviço há 120 dias é uma oportunidade de venda (Ação). Saber que ele vale R$ 10.000 mas não te liga é apenas um dado triste (Informação).

---

### VEREDITO FINAL

1.  **Pode ser congelado hoje?** **NÃO.**
2.  **Já é um CRM?** **Não.** É uma visualização de cadastro com Timeline.
3.  **O 360 é um Dossiê Executivo?** **Não.** É um log histórico.
4.  **Nota Atual:** `58/100`.
5.  **Nota Potencial:** `100/100` (A fundação de dados é perfeita).

#### Problemas Críticos:
*   Invisibilidade da Inadimplência na lista principal.
*   Invisibilidade da Inatividade (Churn silencioso).

#### Problemas Moderados:
*   Falta de resumo financeiro real (Saldo Aberto) no Dossiê 360.
*   Header excessivamente grande no mobile.

#### Recomendação Final:
Não avançar para "Contratos" ou "Preventivas" sem antes tornar o Workspace Clientes **inteligente**. Ele precisa expor o *Atrito* (Quem deve? Quem sumiu?) para se tornar o motor de crescimento do Aferix.

---
**Auditoria Concluída.** Nenhuma implementação realizada. Fico no aguardo de decisões estratégicas sobre o "Modelo Orientado à Ação".