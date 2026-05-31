# AUDITORIA ESTRATÉGICA: CAMADA DE INTELIGÊNCIA CRM — AFERIX OS

**Status:** Auditoria Concluída (READ-ONLY)
**Perfil:** CRM Strategist & ERP Architect
**Objetivo:** Projetar a camada de inteligência e ação necessária para transformar o Workspace Clientes em um verdadeiro motor de crescimento e retenção, utilizando a fundação de Event Sourcing já existente.

---

### ETAPA 1: O QUE O CRM DEVE RESPONDER? (EM < 5 SEGUNDOS)

Para um prestador de serviço de campo, o CRM não é um arquivo morto; é um radar. As perguntas que a tela deve responder são:

1.  **[P0] Quem me deve dinheiro e quanto?** (Urgência Financeira)
2.  **[P0] Quem são meus clientes VIP que sumiram?** (Prevenção de Perda)
3.  **[P1] Quem está esperando um retorno meu?** (Fluxo de Vendas)
4.  **[P1] Qual o "clima" da relação com este cliente?** (Sentimento/Status)
5.  **[P2] Quanto eu já ganhei com este cliente?** (Histórico/Valor)
6.  **[P2] Onde este cliente mora/está localizado?** (Logística)

---

### ETAPA 2: MAPA DE ATRITOS (DETECÇÃO DE ANOMALIAS)

Auditando a arquitetura de dados atual (Fases 1A-1D), verificamos a viabilidade de detecção automática de problemas:

| Atrito / Anomalia | Já existe Dado? | Falta Projeção? | Falta UI? | Diagnóstico Técnico |
| :--- | :---: | :---: | :---: | :--- |
| **Cliente Inativo** | ✅ | ✅ | ✅ | Requer cálculo de `Date.now() - last_event_timestamp`. |
| **Cliente Devedor** | ✅ | ✅ | ✅ | Requer soma de `openBalance` de `FinancialRecords`. |
| **VIP Inativo** | ✅ | ✅ | ✅ | Cruzamento de `LTV` alto com tempo de inatividade. |
| **Orçamento Parado** | ✅ | ✅ | ✅ | Detecção de budgets `sent` sem movimentação há 7 dias. |
| **Frequência em Queda**| ✅ | ✅ | ✅ | Requer análise de densidade de eventos nos últimos 12 meses. |
| **Risco de Churn** | ✅ | ✅ | ✅ | Inatividade + Orçamento Recusado. |

**Conclusão:** O sistema é "rico em dados e pobre em projeções". Toda a inteligência está trancada dentro dos eventos brutos.

---

### ETAPA 3: REORGANIZAÇÃO DO TOPO (MODELO OPERACIONAL)

O modelo atual (**MODELO A — Carteira**) celebra o passado.
O modelo sugerido (**MODELO B — Ação**) foca no futuro.

*   **Veredito:** O **MODELO B** gera 5x mais valor operacional. 
*   *Justificativa:* O prestador de serviço ganha dinheiro executando e cobrando. Ver o "Patrimônio" é bom para o ego, mas ver "3 Clientes Devedores" e "2 VIPs sumidos" é bom para o caixa. O topo da tela deve ser um **Alert Hub** de relacionamento.

---

### ETAPA 4: AUDITORIA DA LISTA (O CARD DE CLIENTE)

Hoje o card exibe: Nome, Telefone e Patrimônio (creditLimit).
**O que deveria estar visível para decisão imediata:**

1.  **Status de Relação (Essencial):** `Ativo`, `Inativo`, `Devedor`.
2.  **Saldo em Aberto (Essencial):** O valor real que ele deve agora.
3.  **Último Contato (Desejável):** "Há 15 dias".
4.  **LTV (Desejável):** O quanto ele já rendeu na história.
5.  **Rating (Dispensável):** Pode ser movido para dentro do Dossiê.

---

### ETAPA 5: AUDITORIA DO CLIENT 360 (RESUMO EXECUTIVO)

O Dossiê deve ter um "Cockpit de Relação" antes de exibir a Timeline.
**Layout Conceitual Sugerido:**

1.  **Nível 1 (Financeiro):** `Saldo Devedor` (Destaque Vermelho) | `Total Pago` (Destaque Verde).
2.  **Nível 2 (Operacional):** `Serviços Realizados` | `Ticket Médio`.
3.  **Nível 3 (Relacionamento):** `Tempo de Casa` | `Data do Último Serviço`.
4.  **Nível 4 (Timeline):** O log cronológico completo de eventos.

---

### ETAPA 6: CRM SCORE (0-100)

*   **Cadastro:** `100` (Dexie/Schema sólido).
*   **Carteira:** `80` (LTV básico funciona).
*   **Relacionamento:** `20` (Invisível).
*   **Retenção:** `0` (Não há alertas de churn).
*   **Cobrança:** `10` (Só existe se o usuário procurar).
*   **Inteligência:** `30` (Dados existem, mas não são projetados).
*   **Ação:** `10` (A UI não convida à ação comercial).

---

### ETAPA 7: ROADMAP DE EVOLUÇÃO (CRM INTELLIGENT)

**FASE 2C.3: Camada de Projeção (Back-end)**
*   Criar `getClientCRMProjection`.
*   Extrair `lastInteractionAt`, `openBalanceTotal`, `inactivityDays` e `LTV`.
*   *Esforço: Baixo | Impacto: Alto.*

**FASE 2C.4: Visualização de Alertas (Lista de Clientes)**
*   Substituir o Rating estático (A+) por Chips dinâmicos: `INATIVO`, `DEVEDOR`, `VIP`.
*   Exibir o Saldo em Aberto diretamente no card da lista.
*   *Esforço: Médio | Impacto: Crítico.*

**FASE 2C.5: O Cockpit 360 (Interface Executiva)**
*   Implementar o resumo financeiro/operacional no topo do Modal 360.
*   Adicionar o botão "Registrar Contato" (Evento manual).
*   *Esforço: Médio | Impacto: Estratégico.*

---

### ETAPA 8: VEREDITO EXECUTIVO

Hoje o Workspace Clientes parece mais: **B) Carteira.**
*Justificativa:* Ele exibe a "foto" da riqueza do usuário, mas não o ajuda a gerenciar o dia a dia da relação. É contemplativo, não operacional.

Se as melhorias propostas forem aplicadas, a nota potencial do CRM sobe de **40 para 95**.

**Recomendação Final:**
O Workspace Clientes não deve ser congelado. Ele é o "Coração do ERP" e hoje bate em ritmo lento. É necessário executar a Fase 2C.3 (Projeções) e 2C.4 (UI de Alertas) para que o sistema se pague através da recuperação de cobranças e reativação de clientes.

---
**Auditoria Encerrada.** Nenhuma implementação realizada. Próximo passo sugerido: Iniciar a Fase 2C.3 (A Inteligência por trás da lista).