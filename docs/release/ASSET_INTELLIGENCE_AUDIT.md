# AUDITORIA DE INTELIGÊNCIA DE ATIVOS E SERVIÇOS — AFERIX OS

**Status:** Auditoria Concluída (READ-ONLY)
**Perfil:** Solutions Architect & Service Delivery Strategist
**Objetivo:** Avaliar a viabilidade e necessidade do domínio "Asset" (Patrimônio Técnico) como fundação para a recorrência e fidelização no Aferix.

---

### ETAPA 1: AUDITORIA DOS DOMÍNIOS ATUAIS (VAZAMENTOS)

Mapeamento de domínio vs. Retenção de dados técnicos:

| Domínio | Foco Principal | O que é perdido após o encerramento? |
| :--- | :--- | :--- |
| **Vendas** | Conversão | Detalhes do levantamento técnico (ficam presos em `technicalNotes`). |
| **Operações** | Execução | Qual unidade exata foi reparada (ex: qual dos 10 ACs do cliente). |
| **Financeiro** | Fluxo de Caixa | A relação entre o lucro e o custo de manutenção de um equipamento específico. |
| **Timeline** | Auditoria | O rastro é por "OS", não por "Equipamento". O rastro técnico é "cego". |

*   **Informações em Texto Livre:** `Budget.technicalNotes`, `WorkOrder.description`, `BudgetItem.description`.
*   **Informações sem Entidade:** Equipamento, Número de Série, Modelo, Localização (Tag), Garantia de Peça, Plano de Manutenção.

---

### ETAPA 2: AUDITORIA DE MEMÓRIA TÉCNICA

O sistema consegue responder hoje?

1.  **Quais equipamentos o cliente possui?** **NÃO.** (O sistema sabe o que foi vendido/reparado, mas não possui um inventário do cliente).
2.  **Quantos equipamentos existem?** **NÃO.**
3.  **Último serviço por ativo?** **NÃO.** (Sabe a última OS do cliente, mas não de qual motor ou quadro elétrico).
4.  **Ativo que mais gera chamados?** **NÃO.**
5.  **Próxima manutenção?** **NÃO.**

**Justificativa Técnica:** A arquitetura atual é centrada no "Ciclo de Trabalho" (OS/Budget) e no "Ciclo de Valor" (Financeiro). O sistema sofre de **Amnésia de Inventário**. Para o Aferix, cada serviço é um evento isolado no tempo.

---

### ETAPA 3: AUDITORIA DE PREVENTIVAS

Cenário: Cliente com 5 sistemas fotovoltaicos.
*   **Sem domínio Asset:** O sistema teria que criar OSs "no vácuo" ou usar a Home para lembrar o técnico.
*   **Onde armazenar?** Hoje, o equipamento ficaria no título da OS (ex: "Limpeza Painéis Unidade A").
*   **Risco:** Se o técnico errar o texto, o histórico daquela unidade é quebrado. Há risco imenso de redundância e perda de prazos de garantia.

---

### ETAPA 4: AUDITORIA DE CONTRATOS

*   **Maturidade Atual:** **NÍVEL 0 (Financeira).**
*   O sistema hoje saberia apenas QUEM paga e QUANTO paga (via Financeiro).
*   **O QUE está sendo mantido?** É um mistério para o banco de dados. O contrato é apenas um "boleto recorrente" e não um "escopo de serviço".

---

### ETAPA 5: AUDITORIA DO CLIENT 360

O Client 360 atual (Fase 2C.4) conta uma **história comercial brilhante**, mas uma **história técnica pobre**.

*   “Quais equipamentos João possui?” → **RESPOSTA: BUSQUE NAS NOTAS TÉCNICAS DAS 10 ÚLTIMAS OSs.**
*   “Qual equipamento apresentou mais falhas?” → **RESPOSTA: O SISTEMA NÃO SABE.**
*   “O que está em garantia?” → **RESPOSTA: O SISTEMA NÃO SABE.**

---

### ETAPA 6: AUDITORIA DE LONGO PRAZO

*   **1 Ano:** O usuário sentirá falta de saber "onde está a peça que troquei há 6 meses".
*   **3 Anos:** O Aferix será apenas um gerador de orçamentos e não um ERP. O churn aumentará porque o prestador não consegue provar o valor das preventivas.
*   **5 Anos:** Impossível escalar para empresas de manutenção industrial ou predial sem o domínio Asset.

---

### ETAPA 7: PROPOSTA DE DOMÍNIO

O domínio **Asset** deve ser o "Irmão Técnico" do Cliente.

**Arquitetura Sugerida:**
`Asset` (O Equipamento) → Filha de `Client`.
`Asset` → Recebe `TechnicalTimeline` (Histórico de serviços naquele equipamento).
`Asset` → Possui `MaintenancePlan` (A inteligência da recorrência).

**Onde deve ficar?**
Em um **Novo Domínio (Patrimônio Técnico)**, acessível tanto de dentro do Cliente quanto das Operações.

---

### ETAPA 8: VEREDITO EXECUTIVO

1.  **O domínio Asset é necessário?** **SIM. É VITAL.**
2.  **Nota de Prioridade:** `100/100`.
3.  **Pré-requisito para Preventivas?** **Sim.** Sem ativo, a preventiva é apenas um alarme de calendário.
4.  **Pré-requisito para Contratos?** **Sim.** Para sair do "boleto" e ir para o "SLA".
5.  **Pré-requisito para 360 avançado?** **Sim.** É o que separa um app de bolso de um ERP Enterprise.
6.  **Sequência correta:**
    **Asset → Preventivas → Contratos**
    *Justificativa:* Você não pode prevenir o que não cadastrou, e não pode contratar o que não sabe prevenir.

---
**Veredito Final:** O Patrimônio Técnico do Cliente é o "Missing Link" do Aferix. Ele transformará o sistema de um Software de Venda em uma **Plataforma de Gestão de Ativos**, aumentando o LTV do cliente e a barreira de saída do prestador.

**Próximo Passo Recomendado:** Iniciar a Fase 3B (Data Model do Domínio Asset).