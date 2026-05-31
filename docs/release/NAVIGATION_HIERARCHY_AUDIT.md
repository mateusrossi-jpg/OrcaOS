# AUDITORIA DE NAVEGAÇÃO E HIERARQUIA — AFERIX OS

**Status:** Auditoria Concluída
**Perfil:** UX Architect & Front-end Engineer
**Objetivo:** Ajustar a barra de acesso inferior e o fluxo do Workspace "Operações" para respeitar a hierarquia de intenção do Aferix OS.

---

### 1. DIAGNÓSTICO DO ESTADO ATUAL

*   **Conflito de Intenção:** A aba "Operações" (`base`) está funcionando como um gateway para outros serviços (Vendas, Clientes), o que dilui sua função principal: **Execução Técnica**.
*   **Erro de Roteamento Visual:** No `AppShell.tsx`, a lógica de "active" marca a aba Operações como ativa mesmo quando o usuário está em Vendas ou editando um Orçamento. Isso gera desorientação espacial.
*   **Fadiga de Menu:** O botão "Plus" em Operações abre opções que pertencem a outros workspaces (Vendas), quebrando a pureza do pilar.
*   **Limitação da Dock:** Com 5 pilares principais, não há espaço para "Configurações/Mais". Atualmente, as configurações estão escondidas ou inacessíveis.

---

### 2. PROPOSTA DE REESTRUTURAÇÃO (OS 5 PILARES PURITANOS)

Para manter a ordem mental do prestador de serviços, a barra inferior deve ser absoluta:

1.  **Home (Pulse):** Visão geral e Comando.
2.  **Vendas (Conversion):** Propostas, Orçamentos e Follow-up.
3.  **Operações (Execution):** OSs, Agendamentos e Campo.
4.  **Clientes (Strategic):** CRM, Unidades e Inventário.
5.  **Financeiro (Cashflow):** Caixa, Pagamentos e Contratos.

**Mudanças Arquiteturais Sugeridas:**
*   **Extração de Configurações:** Remover "Configurações" da barra inferior. O acesso a Catálogo, Relatórios e Perfil deve ser feito via um ícone de **Menu Executivo** no Header da Home.
*   **Purificação de Operações:** O Workspace de Operações deve mostrar apenas a "Trincheira" (OSs). A criação de orçamentos deve ser exclusividade da aba Vendas.

---

### 3. PLANO DE AÇÃO (CRONOGRAMA)

**PASSO 1: Correção do AppShell (Imediato)**
*   Ajustar a lógica de `active` para que cada tab seja independente.
*   Garantir que `budgets` e `base` não se sobreponham visualmente.

**PASSO 2: Purificação do Workspace Operações**
*   Remover "Novo Orçamento" do botão Plus de Operações.
*   Renomear `ClientsScreen` para `OperationsScreen` (Semanticamente correto).
*   Focar o Hero de Operações 100% em "Trabalho em Campo".

**PASSO 3: O Menu Executivo**
*   Adicionar um ícone de "Avatar/Menu" no header da Home.
*   Este menu abrirá a `MenuScreen` (Catálogo, Loja, Relatórios, Configurações).
*   Isso libera a barra inferior para as 5 intenções de negócio.

---

### 4. VEREDITO TÉCNICO

1.  **Nota de Hierarquia Atual:** `55/100`
2.  **Nota de Hierarquia Alvo:** `100/100`
3.  **Ação Recomendada:** Iniciar imediatamente a refatoração do `AppShell.tsx` e a redistribuição das rotas secundárias.

---
**Auditoria Encerrada.** Nenhuma implementação realizada. Próximo passo: **Implementar a independência total das tabs na barra inferior.**