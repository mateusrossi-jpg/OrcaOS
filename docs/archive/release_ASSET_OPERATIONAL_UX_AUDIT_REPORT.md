# RELATÓRIO DE AUDITORIA: EXPERIÊNCIA OPERACIONAL ASSET (UX) — AFERIX OS

**Status:** Auditoria Concluída (READ-ONLY)
**Perfil:** Lead Product Designer & Operational UX Auditor
**Objetivo:** Garantir que a introdução do patrimônio técnico (Site e Asset) não degrade a velocidade de execução em campo, preservando a essência "mobile-first" e "zero fricção" do Aferix.

---

### ETAPA 1: IMPACTO NA CRIAÇÃO DE OS

A introdução de novos domínios corre o risco de burocratizar o app.

*   **Fluxo Atual:** 2 Cliques (Novo -> Selecionar Cliente).
*   **Fluxo Futuro (Standard):** 4 Cliques (Novo -> Cliente -> Site -> Asset).
*   **Atrito Identificado:** Aumentar em 100% os cliques para um reparo simples (ex: "Troca de lâmpada") é inaceitável.

**Decisão Recomendada:**
1.  **Auto-seleção de Site:** Se o cliente possuir apenas 1 Site, o sistema deve selecioná-lo automaticamente.
2.  **Asset Opcional:** O campo Asset deve ser opcional na abertura da OS para serviços genéricos.

---

### ETAPA 2: O CONCEITO "FAST WORK ORDER"

Para serviços de emergência ou diagnóstico rápido, o sistema deve ignorar a hierarquia técnica completa.

*   **Modo Rápido:** Abertura direta via Home ou Operações.
*   **Regra:** Exige apenas `Client` e `Título`.
*   **Vínculo Retroativo:** O técnico pode vincular o `Asset` e o `Site` durante o checkout ou após a execução, garantindo que o histórico técnico seja alimentado sem travar a entrada.
*   **Meta:** Abertura em menos de 15 segundos.

---

### ETAPA 3: CADASTRO DE ASSET EM CAMPO (MOBILIDADE)

Cenário: Técnico chega e o equipamento não existe na base.

*   **Fluxo Vencedor:** **B) Cadastrar Asset DENTRO da OS.**
*   *Justificativa:* O técnico não deve ser forçado a "sair" do seu fluxo de trabalho (a OS) para alimentar o inventário. O cadastro do ativo deve ser uma ação natural da execução (ex: "Adicionar Equipamento atendido nesta OS").

---

### ETAPA 4: WORKSPACE DE ASSETS (POSICIONAMENTO)

**Onde o domínio Asset deve viver?**
*   **Veredito:** **Nested (Aninhado) dentro de Clientes.**
*   *Justificativa:* Ter um 6º pilar na barra de navegação geraria fadiga cognitiva e diluiria a atenção. O "Patrimônio Técnico" é uma propriedade do Cliente/Site. 
*   **Escalabilidade:** Para 5.000 ativos, usaremos o **"Asset Discovery"** dentro do Site (Busca/Filtro técnico), mantendo a barra de navegação limpa.

---

### ETAPA 5: HOME (INTELIGÊNCIA DE ALERTA)

Novos gatilhos para o `useHomeAttentionStack`:

| Alerta | Severidade | Motivo |
| :--- | :---: | :--- |
| **Preventiva Vencida** | **P0 (Vermelho)** | Receita recorrente em risco e risco de falha. |
| **Ativo em Estado CRITICAL** | **P0 (Vermelho)** | Parada de produção/conforto do cliente. |
| **Garantia de Serviço Vencendo** | **P1 (Ouro)** | Oportunidade de renovação/visita. |
| **Contrato sem Preventiva agendada** | **P1 (Ouro)** | Falha de conformidade contratual. |
| **Novo Ativo Detectado** | **P2 (Azul)** | Informativo de atualização de base. |

---

### ETAPA 6: SEPARAÇÃO DEFINITIVA (360)

**Client 360 (Quem?):**
*   Relationship Score.
*   Total Pago (LTV).
*   Saldo Devedor.
*   Lista de Unidades (Sites).

**Asset 360 (O quê?):**
*   Manual Técnico / Fotos.
*   Histórico de Falhas (MTBF).
*   Garantias ativas.
*   Próxima manutenção agendada.

---

### ETAPA 7: ROADMAP UX-DRIVEN

Para garantir a adoção, a sequência deve ser:

1.  **Fase 3B (Sites):** Mover endereços para Sites (Invisível para o usuário).
2.  **Fase 3C (Assets):** Cadastro rápido de ativos e visualização no Dossiê.
3.  **Fase 3D (Fast OS):** Permitir abertura de OS vinculando ativos de forma fluída.
4.  **Fase 3E (Inteligência):** Preventivas e Health Score baseados nos dados colhidos.

---
**Conclusão:** O maior risco da Fase 3 é a "Burocracia Técnica". Se o técnico sentir que o app ficou lento, ele parará de usar o inventário. A estratégia de **"Asset como Opcional"** e **"Cadastro Contextual"** é o que garantirá o sucesso do ERP Aferix em campo.

**Veredito Final:** A arquitetura está validada e protegida. Podemos prosseguir para a implementação física.