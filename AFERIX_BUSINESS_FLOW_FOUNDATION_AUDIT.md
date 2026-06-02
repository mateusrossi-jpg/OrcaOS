# AFERIX BUSINESS FLOW FOUNDATION AUDIT
**Data da Auditoria:** 02 de Junho de 2026
**Auditor:** Principal Product Architect
**Status:** Arquitetura Estrutural Congelada

---

## 1. ESTRUTURA ATUAL ENCONTRADA (LEGACY MODULAR)
Atualmente, o Aferix está organizado em "Módulos" que são disparados por uma variável `activeTab` global. A visibilidade é filtrada por cascas (`RoleShells`), mas a lógica ainda é centrada na entidade (ex: "Tela de Clientes", "Tela de OS") e não no fluxo de negócio.

---

## 2. ESTRUTURA NOVA APLICADA (BUSINESS FLOWS)
A arquitetura agora é regida por **6 Fluxos Oficiais**. Nenhuma nova tela ou funcionalidade pode existir fora destes eixos:

### [A] VISÃO EXECUTIVA
*   **Propósito:** Resposta imediata sobre saúde do negócio e gargalos.
*   **Donos do Fluxo:** `OWNER`, `MANAGER`, `SOLO`.
*   **Componentes:** `OwnerWorkspace`, `ManagerWorkspace` (Home View), `ExecutiveSummaryGrid`.

### [B] OPERAÇÃO
*   **Propósito:** Execução técnica, conformidade e evidências.
*   **Donos do Fluxo:** `FIELD`, `MANAGER_OPERATIONS`, `OWNER`, `SOLO`.
*   **Componentes:** `FieldWorkspace`, `ChecklistExecutionPanel`, `DiagnosticsWorkspace`, `DispatchBoardPage`.

### [C] COMERCIAL
*   **Propósito:** Prospecção, orçamentação e conversão de anomalias em receita.
*   **Donos do Fluxo:** `SALES`, `MANAGER_COMMERCIAL`, `OWNER`, `SOLO`.
*   **Componentes:** `SalesWorkspace`, `RevenueInboxPage`, `ProposalGeneratorPage`, `ClientsWorkspace`.

### [D] ESTOQUE
*   **Propósito:** Disponibilidade de peças para garantir a execução de propostas aprovadas.
*   **Donos do Fluxo:** `MANAGER_INVENTORY`, `OWNER`, `SOLO`.
*   **Componentes:** `InventoryDashboard` (Visual), `InventoryReservationService`.

### [E] FINANCEIRO
*   **Propósito:** Controle de caixa, lucro real e comissões.
*   **Donos do Fluxo:** `MANAGER_FINANCIAL`, `OWNER`, `SOLO`.
*   **Componentes:** `FinancialScreen`, `SimpleFinanceWorkspace`.

### [F] ADMINISTRAÇÃO
*   **Propósito:** Governança, infraestrutura e gestão de time.
*   **Donos do Fluxo:** `OWNER`, `MANAGER` (Apenas visualização de usuários), `SOLO`.
*   **Componentes:** `TeamWorkspace`, `MenuScreen`, `StoreScreen`, `LocalBackupWorkspace`.

---

## 3. FLUXOS MAPEADOS & ROTAS

| FLUXO | ROTA (AppTab) | TELA PRINCIPAL | ACESSO |
| :--- | :--- | :--- | :--- |
| **EXECUTIVO** | `dashboard` | `HomeScreen` | OWNER, MANAGER, SOLO |
| **OPERAÇÃO** | `base` / `agenda` | `FieldWorkspace` | FIELD, OWNER, SOLO |
| **OPERAÇÃO** | `map` / `dispatch`| `ManagerWorkspace`| MANAGER, OWNER |
| **OPERAÇÃO** | `assets` | `AssetsWorkspace` | FIELD, OWNER, SOLO |
| **COMERCIAL** | `pipeline` | `SalesWorkspace` | SALES, OWNER, SOLO |
| **COMERCIAL** | `anomalies` | `RevenueInboxPage` | SALES, OWNER, SOLO |
| **COMERCIAL** | `clients` | `ClientsWorkspace` | SALES, OWNER, SOLO |
| **FINANCEIRO** | `money` | `FinancialScreen` | OWNER, SOLO |
| **ADMIN** | `team` | `TeamWorkspace` | OWNER, MANAGER |
| **ADMIN** | `settings` | `MenuScreen` | TODOS (Visão filtrada) |

---

## 4. PERMISSÕES POR PAPEL (HARDENING)

### ROLE: FIELD (Técnico)
- **Fluxo Permitido:** OPERAÇÃO.
- **Veto Absoluto:** Comercial (R$), Financeiro, Estoque Global, Admin.
- **Inconsistência:** O botão de "Menu" no `FieldShell` ainda permite abrir uma tela com links redundantes.

### ROLE: SALES (Vendedor)
- **Fluxo Permitido:** COMERCIAL.
- **Acesso de Apoio:** ESTOQUE (Consulta apenas).
- **Veto Absoluto:** Configurações Críticas, Operações de Dispatch, Financeiro Avançado.

### ROLE: MANAGER (Gestor)
- **Especializações (Permissions):**
    - `MANAGER_OPERATIONS`: Gerencia Dispatch/Agenda.
    - `MANAGER_COMMERCIAL`: Triagem de Anomalias.
    - `MANAGER_INVENTORY`: Gestão de compras/movimentação.
    - `MANAGER_FINANCIAL`: Visualiza Relatórios (Sem alterar Assinatura).
- **Veto Absoluto:** Alterar Assinatura do Sistema, Deletar Workspace.

### ROLE: SOLO (Autônomo)
- **Experiência:** Unifica todos os fluxos.
- **Peculiaridade:** Remove as tabelas de "Time" e "Dispatch de Outros". A agenda é sempre a sua própria.

---

## 5. INCONSISTÊNCIAS ENCONTRADAS (REALIDADE DO CÓDIGO)

1.  **Telas Órfãs:** 
    - `CalculationsScreen.tsx`: Existe mas não está mapeada em nenhum fluxo de negócio oficial. Deve ser integrada ao Fluxo FINANCEIRO ou deletada.
    - `QuickServiceForm.tsx`: Componente de atendimento rápido não está plugado no fluxo de OPERAÇÃO do Field.
2.  **Funcionalidades Sem Fluxo:**
    - O módulo de **Garantias** está solto na UI mas deveria ser uma sub-visão dentro de OPERAÇÃO ou COMERCIAL (Renovação).
3.  **Vazamento de UX Solo:**
    - O `SoloShell` hoje utiliza o `OwnerWorkspace`, que exibe KPIs de "Equipe". Para um profissional SOLO, isso é ruído cognitivo.
4.  **Menus Redundantes:**
    - O `MenuScreen` repete links que já estão na Bottom Bar (ex: Clientes). Viola a regra de "Acesso em 1 clique para Uso Diário".

---

## 6. ROADMAP DE PENDÊNCIAS (CONGELAMENTO)

- [x] **P0 - Solo UX Hardening:** Criar condicional no `OwnerWorkspace` para esconder cards de "Membros do Time" quando a Role for `SOLO`.
- [x] **P1 - Unificação Comercial:** Mover `ContractControlCenter` de um módulo isolado para ser uma aba de alto nível dentro do fluxo COMERCIAL.
- [x] **P1 - Integração QuickService:** Plugar o formulário de serviço rápido no botão "Novo Atendimento" do Field.
- [x] **P2 - Limpeza de Menu:** Remover do `MenuScreen` itens que não são de ADMINISTRAÇÃO (ex: Catálogo e Clientes já estão nos fluxos).

---

## VEREDITO ARQUITETURAL
O sistema Aferix agora possui um **Esqueleto de Negócio Inquebrável**. O código será refatorado para que os componentes não se chamem "Telas de Dados", mas sim "Workspaces de Fluxo". A fundação técnica suporta a distinção INDIVIDUAL vs COMPANY através do papel `SOLO`.

**AUDITORIA ENCERRADA.**
