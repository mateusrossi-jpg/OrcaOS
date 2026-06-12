# AUDITORIA DE PIPELINE DE VENDAS E EXPERIÊNCIA COMERCIAL — AFERIX OS

**Status:** Auditoria Concluída (READ-ONLY)
**Perfil:** Product Architect & ERP Designer
**Objetivo:** Validar o fluxo de "Venda e Conversão" do Aferix frente aos pilares de excelência já estabelecidos na Home e Operações.

---

### ETAPA 1: AUDITORIA DE INTENÇÃO (O CONFLITO)

Ao abrir o fluxo comercial (`BudgetsScreen.tsx`), identificou-se uma **Contaminação de Nomeclatura**:
*   **O Problema:** O header da tela de orçamentos está intitulado como **"Operações."**.
*   **O Impacto:** Isso quebra o princípio "Um Workspace = Uma Intenção". O usuário entra para vender, mas o sistema diz que ele está operando.
*   **A Mistura:** A tela mistura "Execução Presente" (R$) com "Aprovados" no mesmo card Hero. O comercial deve focar em **"Potencial de Venda"** e **"Velocidade de Conversão"**, não em capacidade produtiva.

---

### ETAPA 2: AUDITORIA DO FUNIL (GARGALOS)

Mapeamento do fluxo real:
1.  **Orçamento (Draft):** 11 passos de criação (Fluxo técnico profundo).
2.  **Proposta (Sent):** Geração de link público.
3.  **Aprovação:** Status muda para `approved` e gera OS `draft` (Fase 1A).

**Achados:**
*   **Redundância:** O Orçamento e a Proposta são entidades que clonam dados. No MVP isso é aceitável para segurança, mas gera "cliques duplos" na gestão.
*   **Etapa Morta:** O status `em_revisao` no orçamento raramente é usado na UI de forma acionável.

---

### ETAPA 3: AUDITORIA DE FOLLOW-UP (A REAÇÃO)

O sistema possui inteligência de sobra, mas a UI não a utiliza.
*   **Quem está sumido?** O `CRMAlertHubProjection` já sabe (enviados há > 3 dias), mas essa informação não aparece com destaque na tela de Vendas, apenas na aba de Clientes/CRM.
*   **Quem visualizou?** O status `viewed` existe no banco, mas na lista de orçamentos ele é exibido apenas como mais um `StatusPill`. Não existe uma seção "Visualizados: Ligue agora!".
*   **Veredito:** O usuário leva mais de 5 segundos para priorizar follow-ups porque precisa filtrar manualmente por "ENVIADOS".

---

### ETAPA 4: AUDITORIA DE UX (USO EM CAMPO)

*   **Escaneabilidade:** Boa. Os cards são limpos.
*   **Densidade:** Média-Alta. O Hero Card ocupa muito espaço (30% da tela) com informações que já aparecem na Home.
*   **Tempo para gerar orçamento:** **CRÍTICO.** 11 passos (`BUDGET_WORKFLOW_MAP`) é um tempo muito alto para um orçamento rápido de "troca de tomada". O Aferix precisa de um "Fast Budget" para o futuro.

---

### ETAPA 5: AUDITORIA DE WORKSPACE (POSICIONAMENTO)

**O Comercial merece um Workspace próprio? SIM.**
*   *Justificativa:* Venda é sobre **Persuasão e Follow-up**. Operação é sobre **Checklist e Prazo**.
*   Atualmente o comercial está "disfarçado" de operação. Ele deve ser renomeado para **"Vendas"** ou **"Pipeline"** e focar exclusivamente em converter `draft -> sent -> approved`.

---

### ETAPA 6: AUDITORIA DE ESCALABILIDADE

*   **Ponto de Ruptura (500+ orçamentos):** A `BudgetsScreen.tsx` faz um `.map()` direto sobre todo o array de orçamentos filtrados. Sem paginação ou virtualização, o aplicativo apresentará lentidão severa ao rolar a lista de "Finalizados".

---

### ETAPA 7: VEREDITO FINAL

1.  **Nota atual do Comercial:** `72/100`
2.  **Principais gargalos:** Nomeclatura confusa ("Operações" no header de Vendas) e fluxo de criação longo (11 passos).
3.  **Principais desperdícios:** Espaço do Hero com KPIs duplicados da Home.
4.  **O fluxo está pronto para MVP?** **SIM.** É robusto e funcional.
5.  **O Comercial merece congelamento?** **NÃO.** Precisa de uma limpeza de identidade (Renomear para Vendas) e da introdução do card de "Prioridade de Follow-up".
6.  **Próxima evolução:** Implementar o **"Sales Hub"** — uma versão simplificada da lista que prioriza orçamentos visualizados pelo cliente.

---
**Auditoria Concluída.** O Aferix opera melhor do que vende. A infraestrutura de dados da Fase 1 sustenta o comercial, mas a interface precisa de "sangue nos olhos" para ajudar o prestador a fechar negócios mais rápido. 

Recomendo uma **Fase 2D.1 (Vendas Purificadas)** para renomear o domínio e ajustar os KPIs de conversão.