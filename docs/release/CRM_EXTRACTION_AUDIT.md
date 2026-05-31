# AUDITORIA DE EXTRAÇÃO CRM — AFERIX

**Status:** Auditoria Concluída (Pronto para Refatoração)
**Objetivo:** Mapear elementos de CRM/Inteligência dentro do `OperationsHubWorkspace` para extração definitiva em um novo Workspace dedicado a Clientes e Relacionamento.

---

### 1. ELEMENTOS IDENTIFICADOS PARA EXTRAÇÃO

Dentro de `src/features/clients/components/OperationsHubWorkspace.tsx`, os seguintes blocos foram marcados para migração:

**A. Aba de Inteligência (HubTab = 'intelligence'):**
*   **Card: Patrimônio em Carteira:** Soma do `creditLimit` de todos os clientes. (Atualmente alimentado pelo array de clientes).
*   **Card: Relacionamentos:** Contador total de clientes na base.
*   **Card: Recorrência:** KPI de fidelidade (Atualmente mockado em 78%).
*   **Seção: Base de Dados Estratégica:** Listagem de clientes com Rating (A+) e Valor de Patrimônio individual.

**B. Dependências de Dados:**
*   `boardData` vindo de `operationalReadModelService.getBoardProjection()`: Contém o cruzamento de orçamentos e OSs, misturando o comercial com o operacional.
*   `clientService.getAll()`: Usado para alimentar o ranking.

---

### 2. COMPONENTES REUTILIZÁVEIS MAPEADOS
A extração não criará novos estilos. Os componentes abaixo serão "clonados" ou movidos para o `ClientsWorkspace`:
*   `Card` (Átomo local): Estrutura de elevação e bordas.
*   `Label` (Átomo local): Tipografia DM Mono para rótulos técnicos.
*   `OpsChip`: Para métricas de saúde da carteira.
*   `SearchInput`: Para busca na base estratégica.
*   `MoneyValue` e `SemanticBadge`: Para exibição de patrimônio e ratings.

---

### 3. PLANO DE "PURIFICAÇÃO" (CLEANSE)

**Passo 1: Criação do `ClientsWorkspace.tsx`**
*   Receberá a responsabilidade de "Relacionamento".
*   Exibirá o **Patrimônio em Carteira** como Hero.
*   Exibirá a **Base Estratégica** (Lista de Clientes) como corpo principal.
*   Injetará o ponto de entrada para o **Client 360**.

**Passo 2: Limpeza do `OperationsHubWorkspace.tsx`**
*   Remover o estado `activeTab` e a alternância entre Ação/Carteira.
*   Remover a importação de `boardData` (que lê Budgets).
*   Manter exclusivamente as 4 seções de OS: Preparação, Agendadas, Execução e Histórico.

**Passo 3: Ajuste de Navegação (`App.tsx`)**
*   A Tab "Operações" passará a abrir o `OperationsHubWorkspace` purificado.
*   O menu principal (ou a Home) passará a ter um atalho direto para o novo `ClientsWorkspace`.

---

### 4. RISCOS E MITIGAÇÕES
*   **Risco:** Quebrar o fluxo de "Nova OS Avulsa".
*   **Mitigação:** Manter a factory de criação de OS dentro da Facade e apenas garantir que o componente de Seleção de Cliente continue acessando o `clientService`.
*   **Risco:** Confusão de rotas.
*   **Mitigação:** Documentar a mudança no `appTypes.ts` antes de alterar o `AppShell`.

---
**Auditoria de Extração Encerrada.** Nenhuma implementação realizada. Próximo passo: Codificar a separação.