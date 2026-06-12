# MODELAGEM ARQUITETURAL: DOMÍNIO ASSET — AFERIX OS

**Status:** Modelagem Concluída (READ-ONLY)
**Perfil:** Chief Architect & Service Operations Strategist
**Objetivo:** Projetar a fundação do Patrimônio Técnico do Cliente (Domínio Asset), eliminando a "Amnésia de Inventário" e preparando o Aferix para o mercado de manutenção profissional.

---

### ETAPA 1: DEFINIÇÃO DE DOMÍNIO (O QUE É UM ASSET)

No Aferix OS, um **Asset** é o objeto real sobre o qual recai o serviço técnico. É um item durável, passível de manutenção, rastreabilidade de garantia e histórico de falhas.

*   **O que É Asset:** Equipamentos com número de série ou TAG (Ar-condicionado, Inversor Solar, DVR, Motor, Bomba, Elevador, Painel Elétrico).
*   **O que NÃO É Asset:** Consumíveis (Gás, Parafusos, Fios), Serviços (Mão de obra), Orçamentos ou o próprio Cliente.

---

### ETAPA 2: MODELAGEM CONCEITUAL (RELAÇÕES)

A hierarquia de domínio deve ser estrita:
1.  **Client (1) → (N) Asset:** Um cliente possui vários equipamentos.
2.  **Asset (1) → (N) WorkOrder:** Uma OS deve obrigatoriamente apontar para qual(is) ativo(s) está atendendo.
3.  **Asset (1) → (N) MaintenancePlan:** O plano de preventiva nasce e morre com o Ativo.
4.  **Asset (1) → (N) Warranty:** A garantia é uma propriedade do Ativo.

---

### ETAPA 3: IDENTIDADE DO ATIVO (DATA MODEL)

Campos mínimos para a entidade `Asset`:

| Campo | Classificação | Objetivo |
| :--- | :---: | :--- |
| `id` | **Obrigatório** | UID do sistema. |
| `clientId` | **Obrigatório** | Vínculo de posse. |
| `name` | **Obrigatório** | Apelido legível (Ex: "AC Suíte Master"). |
| `category` | **Obrigatório** | Agrupamento técnico. |
| `serialNumber` | **Desejável** | Rastreabilidade do fabricante. |
| `tag` | **Desejável** | Identificador interno (QR Code / Patrimônio). |
| `manufacturer` | **Opcional** | Marca. |
| `model` | **Opcional** | Versão/Referência. |
| `location` | **Desejável** | Onde o item está fisicamente. |
| `installDate` | **Opcional** | Início da vida útil. |

---

### ETAPA 4: ESTRATÉGIA MULTIATIVO (IDENTIFICAÇÃO)

Para evitar OSs genéricas ("Manutenção AC" duplicada), o sistema adotará o **"Double-Link Identification"**:
1.  **Tagging:** Cada ativo terá uma TAG única (Ex: `QR-123`).
2.  **Contextual Name:** O nome deve carregar a localização (Ex: "AC Central - 1º Andar").
*No momento da abertura da OS, o sistema deve obrigar a seleção de um Ativo existente ou o cadastro rápido de um novo.*

---

### ETAPA 5: TIMELINE DO ATIVO (TECHNICAL MEMORY)

O Asset herda a arquitetura de **Event Sourcing** da Fase 1D.
*   **Eventos:** `ASSET_REGISTERED`, `ASSET_MOVED`, `TECHNICAL_FAILURE_REPORTED`, `PREVENTIVE_DONE`, `WARRANTY_EXPIRED`.
*   **Veredito:** O Ativo terá sua própria Timeline técnica, que será injetada no Client 360.

---

### ETAPA 6: CLIENT 360 TÉCNICO

O Dossiê 360 (Fase 2C.4) será expandido com uma nova tab: **"Patrimônio"**.
*   Exibirá a lista de ativos, o estado de saúde de cada um (Score de Manutenção) e o histórico de intervenções exclusivo daquela unidade.

---

### ETAPA 7: ORIGEM DAS PREVENTIVAS

**As preventivas devem nascer do ASSET.**
*Justificativa:* Planos de manutenção são baseados em especificações técnicas do fabricante e tempo de uso do equipamento, e não em dados do cliente. Você não mantém "o João", você mantém "o Inversor do João".

---

### ETAPA 8: CONTRATOS (SLA & SCOPE)

O Contrato deve vincular **Cliente + Assets**.
*Um contrato sem lista de ativos é apenas um seguro financeiro; um contrato com ativos é um contrato de manutenção profissional (SLA).*

---

### ETAPA 9: WORKSPACE (ESCALABILIDADE)

O domínio Asset deve viver em um **Novo Workspace Próprio (Patrimônio Técnico)**.
*   **Motivo:** Para 100 ativos, Clientes daria conta. Para 5.000 ativos (ex: manutenção de um condomínio ou shopping), o domínio de Ativos exige filtros técnicos (marca, modelo, status de funcionamento) que poluiriam o CRM.

---

### ETAPA 10: VEREDITO EXECUTIVO

1.  **Asset é domínio raiz?** **SIM.**
2.  **Merece entidade própria?** **SIM.** (Tabela `Assets` no Dexie).
3.  **Precisa de Event Sourcing/Timeline?** **SIM.** É a fundação para Garantia.
4.  **Obrigatório antes de Preventivas/Contratos?** **SIM.**
5.  **Obrigatório para 360 avançado?** **SIM.**

**Sequência de Evolução Recomendada:**
1.  **FASE 3B (Foundation):** Schema `Asset` + Eventos `ASSET_*` + CRUD de Inventário.
2.  **FASE 3C (Intelligence):** Vínculo OS ↔ Asset + Timeline Técnica do Ativo.
3.  **FASE 3D (Preventive):** Planos de Manutenção + Gatilhos de Agendamento.
4.  **FASE 3E (Contract):** Gestão de Contratos sobre Inventário.

---
**Conclusão:** O domínio Asset é o "Cérebro Técnico" do Aferix. Sua implementação encerra a era da "Execução Isolada" e inicia a era da "Gestão de Ciclo de Vida". O sistema deixa de ser um bloco de notas digital e passa a ser uma plataforma de engenharia de serviços.

**Próximo Passo:** Executar a Fase 3B (Criação do Schema e Eventos de Ativos).