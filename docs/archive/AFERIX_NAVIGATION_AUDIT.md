# AFERIX NAVIGATION AUDIT

## AUDITORIA DE NAVEGAÇÃO

### 1. Rotas Órfãs e Páginas Escondidas
* **Settings/MenuScreen:** Registrada em `App.tsx` (`activeTab === 'settings'`), porém o `AppShell.tsx` **removeu** o ícone do menu inferior (NAV_TABS tem apenas Pulse, Atendimentos, Propostas, Execução, Financeiro). O usuário não tem como acessar Configurações/Perfil.
* **ClientsWorkspace:** Em `App.tsx`, existe `activeTab === 'clients'`, mas a aba correspondente no AppShell foi retirada.
* **CatalogScreen:** Registrado em `App.tsx` (`activeTab === 'catalog'`), com navegação via "Settings", que por sua vez está órfã.
* **ReportsScreen:** Órfã. Depende de Settings.
* **StoreScreen:** Órfã. Depende de Settings.
* **QuickServiceForm:** `new-quick-service` abre um absolute modal gigante ocultando navegação global sem saída clara a não ser concluir ou voltar.

### 2. Páginas Duplicadas e Menus Redundantes
* **Budgets vs Atendimento Detail:** O `AttendanceDetailScreen` exibe os orçamentos e leva para `new-budget`, mas há também a aba global "PROPOSTAS". Pode causar duplicidade mental sobre por onde começar.
* **OperationsScreen vs Atendimento:** O App permite ver a "Fila de Atendimentos" no Execução (OperationsHubWorkspace) e também na aba global "ATENDIMENTOS". Isso causa redundância: O técnico vai na aba Atendimento ou na aba Execução?

### 3. Funções Repetidas
* **Despachar OS vs Ver Agenda:** No OperationsHubWorkspace, ambos levam o usuário para criar e ver eventos. As fronteiras estão fluidas.

### 4. Atalhos Quebrados
* Em `App.tsx`, a função `goTo` lida com `new-budget` e `new-quick-service`, contudo o botão "Entrar na Empresa" na Home navega para `pulse` de novo.

## PARECER DA AUDITORIA
A navegação do sistema sofre de "Síndrome do Atalho". Foram criados muitos painéis consolidados (como o OperationsHubWorkspace e o AttendanceDetailScreen), o que é bom, mas o Menu de Navegação Global (AppShell Menu) não reflete as telas existentes. As funções de retaguarda (Catálogo, Configurações, Relatórios, Clientes) foram acidentalmente "enterradas" vivas.
