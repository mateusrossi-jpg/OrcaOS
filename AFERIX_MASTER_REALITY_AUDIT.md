# AFERIX / ORÇAOS — MASTER REALITY AUDIT
**Data da Auditoria:** 02 de Junho de 2026
**Status do Projeto:** UX Execution Mode (Final Polish)

---

## FASE 1 — MAPA DO REPOSITÓRIO

### O que realmente existe hoje
* **Estrutura de Pastas:** O repositório segue uma arquitetura baseada em features (`src/features/`), domínios (`src/domain/`), repositórios de dados (`src/repositories/`) e serviços (`src/services/`). A UI é segregada em primitivas de sistema (`src/ui/system/`).
* **Stack Utilizada:** React 18+, TypeScript, Vite, Tailwind CSS, Lucide React (Ícones). O projeto está configurado para Capacitor (Mobile Híbrido).
* **Gerenciamento de Estado:** Fortemente atrelado ao React Context e Hooks (`useRole`, `useAppClients`, `useCalculationCaptures`), com estado persistente delegado ao banco local.
* **Banco Local:** **Dexie.js (IndexedDB)**. É a espinha dorsal do sistema. O banco `AferixDatabase` possui 27 versões e dezenas de tabelas para suportar operações offline-first (Orçamentos, Clientes, OS, Contratos, Equipe, etc.).
* **Sync & Cloud:** `CloudSyncService.ts` existe e tenta realizar sincronização em background a cada 30 segundos (`App.tsx`). A conexão utiliza `@supabase/supabase-js`.
* **Autenticação:** **Parcial/Local MVP.** O Supabase Auth está configurado no projeto e é chamado no `CloudSyncService`, mas a trava de interface (`RoleSelectionScreen`) atua sobre um modelo local (`AuthService.ts`) validando e-mails contra a tabela `teamMembers` do Dexie.
* **Roteamento:** Não utiliza React Router. É um roteador customizado baseado em estado (`activeTab`) gerenciado dentro de `App.tsx` e injetado pelas cascas de permissão (`RoleShells.tsx`).
* **Services & Domínio:** Alta densidade de serviços focados em lógica de negócio (ex: `BudgetCalculatorService`, `SlaService`, `MaintenanceSchedulerService`).

---

## FASE 2 — FUNCIONALIDADES IMPLEMENTADAS

### CRM
* **Existe?** Sim (`ClientsWorkspace.tsx`).
* **Quais telas?** Lista de clientes, dossiê do cliente (visão 360).
* **Quais CRUDs?** Leitura e criação rápida.

### Clientes
* **Existe?** Sim.
* **Status:** Implementação parcial (CRUD básico presente, integração profunda com financeiro em evolução).

### Ativos
* **Existe?** Sim (`Asset360Modal.tsx`, `AssetsWorkspace.tsx`).
* **Status:** Implementação parcial. Criação via prompt rápido implementada; visualização 360 presente.

### Ordens de Serviço (OS)
* **Existe?** Sim (`OperationsScreen.tsx`, `ExecutionWorkspace.tsx`).
* **Status:** Completo. Fluxo de execução, checklist e tela de encerramento (`ExecutionClosingFlow.tsx`) presentes.

### Diagnóstico
* **Existe?** Sim (`DiagnosticsWorkspace.tsx`).
* **Status:** Implementação parcial (UI estruturada, mas dependente de preenchimento manual do field).

### Anomalias
* **Existe?** Sim (`AnomalyBottomSheet.tsx`, `RevenueInboxPage.tsx`).
* **Status:** Completo. O técnico reporta na OS e a anomalia cai na "Inbox" (RevenueInbox) do comercial.

### Propostas (Budgets)
* **Existe?** Sim (`ProposalGeneratorPage.tsx`, `BudgetsScreen.tsx`).
* **Status:** Completo. Geração de PDF (`AferixBudgetPdf.tsx`) e motor de precificação presentes.

### Contratos
* **Existe?** Sim (`ContractControlCenter.tsx`, `RecurringRevenueDashboard.tsx`).
* **Status:** Implementação parcial. Dashboards construídos, mas lógica de cobrança recorrente automatizada (Stripe) órfã/não conectada.

### Estoque
* **Existe?** Sim (`InventoryDashboard.tsx`).
* **Status:** UI sem backend robusto. O painel existe visualmente.

### Garantias
* **Existe?** Sim (`WarrantyTimeline.tsx`).
* **Status:** Implementação parcial (UI focada na linha do tempo).

### Timeline
* **Existe?** Sim (`ClientTimeline.tsx`, `AssetTimeline.tsx`).
* **Status:** Completo (Exibe logs transacionais).

### Portal Cliente
* **Existe?** Sim (`ClientPortalPage.tsx`).
* **Status:** Implementação parcial. UI base presente, mas carece de testes de stress de autenticação externa para o cliente final.

### Financeiro
* **Existe?** Sim (`SimpleFinanceWorkspace.tsx`).
* **Status:** Completo (Para a gestão de caixa local).

### Dashboard
* **Existe?** Sim (`OwnerWorkspace.tsx`).
* **Status:** Completo (Focado em Receita, Risco e Ação).

---

## FASE 3 — SISTEMA DE ROLES

**Existe sistema real de permissões?** 
**Implementação Parcial.** Existe um sistema rígido de roteamento baseado na variável de sessão do usuário (gerida pelo `AuthService` e `Dexie`). Se o usuário logar como `FIELD`, a casca `FieldShell` só renderiza as abas permitidas. No entanto, por ser um aplicativo predominantemente local/client-side, não há uma barreira forte de backend (`RLS` do Supabase testado ativamente contra todas as mutações no ambiente atual).

### Técnico (FIELD)
* **Acessa:** Execução (Base), Ativos, Laudos (Diagnostics), Menu de Ajustes.
* **Vazamento:** Não tem acesso visual a faturamento. Blindagem de UI funciona.

### Vendedor (SALES)
* **Acessa:** Pipeline (SalesWorkspace), Anomalias (RevenueInbox), Propostas (Budgets), Clientes, Menu.

### Gestor (MANAGER)
* **Acessa:** Mapa (ManagerWorkspace), Dispatch, Agenda, Equipe (TeamWorkspace).

### Dono (OWNER)
* **Acessa:** Empresa (Dashboard), Financeiro, Clientes, Equipe (TeamWorkspace).

### Cliente (CUSTOMER)
* **Acessa:** Home (ClientPortal), Laudos, Propostas, Contratos.

### Autônomo
* **Existe?** **Não existe.** O sistema pressupõe o uso da conta `OWNER` como perfil de autônomo, não havendo um shell específico chamado "AUTÔNOMO".

---

## FASE 4 — NAVEGAÇÃO

| ROTA (AppTab) | TELA | ACESSO |
| :--- | :--- | :--- |
| `dashboard` | `HomeScreen` / `OwnerWorkspace` | OWNER |
| `money` | `FinancialScreen` | OWNER |
| `clients` | `ClientsWorkspace` | OWNER, SALES |
| `team` | `TeamWorkspace` | OWNER, MANAGER |
| `settings` | `MenuScreen` | TODOS |
| `base` | `OperationsScreen` / `FieldWorkspace` | FIELD |
| `assets` | `AssetsWorkspace` | FIELD |
| `diagnostics` | `DiagnosticsWorkspace`| FIELD |
| `pipeline` | `SalesWorkspace` | SALES |
| `anomalies` | `RevenueInboxPage` | SALES |
| `budgets` | `BudgetsScreen` / `ProposalGeneratorPage` | SALES, CUSTOMER |
| `map` | `ManagerWorkspace` | MANAGER |
| `dispatch` | `DispatchBoardPage` | MANAGER |
| `contracts` | `ContractControlCenter` | OWNER, CUSTOMER |
| `home` | `ClientPortalPage` | CUSTOMER |

**Identificações:**
* As rotas estão rigorosamente amarradas aos `RoleShells`.
* Telas órfãs: Foram removidos os *stubs* (mensagens de "Em Construção") no último commit. Todas as rotas mapeadas ativam um componente real.

---

## FASE 5 — SCROLL-FIRST AUDIT

*A arquitetura propõe scroll-first para evitar fadiga cognitiva.*

* **Componentes de Tabs encontrados:** `SegmentedTabs` (`src/ui/primitives/Editorial.tsx`).
* **Wizards/Steppers encontrados:** `WorkflowStepper` (`src/app/components/ui/WorkflowStepper.tsx`).

**Status Geral das Telas:** **Parcialmente Scroll First.**
Enquanto a maioria das telas como `OwnerWorkspace` e `SalesWorkspace` são fluidas e baseadas em scroll contínuo (Cards empilhados), telas complexas como a geração de propostas e fluxos de atendimento ainda utilizam o `WorkflowStepper` e abas (`SegmentedTabs`) para organizar informações densas.

---

## FASE 6 — EXECUTION AUDIT (Passo a Passo Real)

1. **Abertura:** O app carrega (`App.tsx`). Executa o `LegacyBudgetMigrationService` e outros no `useEffect`.
2. **Login:** A tela `RoleSelectionScreen` intercepta. O usuário insere um e-mail (ex: `admin@aferix.com`).
3. **Validação:** `AuthService.login()` checa o Dexie. Se o e-mail existir com status 'active', o token é gravado no `localStorage`.
4. **Roteamento:** A variável de estado recarrega o `AppShell` correspondente ao Role. Se for Dono (`OWNER`), a tela `OwnerWorkspace` monta, exibindo 3 cards: Faturamento (mock/cálculos), MRR em Risco e Alertas de Ação.
5. **Navegação:** O menu inferior de doca (Bottom Bar) exibe os ícones limitados ao perfil. Ao clicar, o `activeTab` muda no `App.tsx` e o componente filho é trocado imediatamente.

---

## FASE 7 — MVP BLOCKERS

*O que impede vender isso amanhã?*

* **P0 (Impede Venda): Sincronização Cloud vs Local.** O aplicativo é tão focado em Offline-First via Dexie que a ponte para a nuvem (`CloudSyncService`) não está testada para concorrência real multi-usuário. Vender isso para uma empresa com 5 técnicos significa que conflitos de sincronização entre dispositivos inevitavelmente ocorrerão no estado atual da lógica de reconciliação.
* **P0 (Impede Venda): Checkout e Assinaturas (SaaS).** O código não tem a barreira do Stripe ativada para cobrar dos prestadores. Eles podem usar a aplicação de graça eternamente.
* **P1 (Gera atrito grave): Ausência de Backend Forte de Notificações.** O app confia no device para disparar lógicas de SLA e alertas. Se o app estiver fechado, o alarme de OS estourada pode não disparar para o Gestor a tempo.
* **P2 (Refinamento):** Formulário de criação de ativo via `window.prompt` (Feito no último fix) é rudimentar e precisa virar um BottomSheet ou modal nativo amigável.

---

## FASE 8 — UX BLOCKERS

* **Fluxo Ruim:** O uso contínuo de Modais e BottomSheets uns sobre os outros na hora de criar uma Proposta a partir de uma Anomalia ainda é denso.
* **Navegação Ruim:** Apesar da doca inferior, acessar as "Configurações" exige ir até o `MenuScreen` que é longo e mistura "Seu Perfil" com "Backup" e "Licença".
* **Telas Técnicas Demais:** A tela de Diagnósticos (`DiagnosticsWorkspace.tsx`) exige que o técnico entenda muitos jargões caso não seja preenchida de forma guiada e simplificada.

---

## FASE 9 — REALIDADE VS PROMPTS

| FUNCIONALIDADE | PROMETIDA | EXISTE? | STATUS |
| :--- | :--- | :--- | :--- |
| Login Supabase Auth | Sim | **NÃO** | O Login atual é simulado validando um e-mail contra o Dexie local. |
| Role-Based UX | Sim | **SIM** | Funcional. A navegação barra o acesso às áreas não permitidas. |
| Offline-First (Dexie) | Sim | **SIM** | O banco inteiro está estruturado no browser. |
| Cloud Sync (Multi-player) | Sim | **PARCIAL** | Serviço existe, mas a robustez para evitar perda de dados em conflitos não tem evidência matemática de segurança no repositório. |
| RLS (Segurança de Nuvem) | Sim | **SEM EVIDÊNCIA** | As políticas SQL não podem ser validadas analisando apenas o código frontend React. |
| Stripe Checkout | Sim | **NÃO** | Código órfão ou inexistente no fluxo principal. |

---

## FASE 10 — ROADMAP REAL (O Que Fazer)

**Se Mateus tivesse 7 dias:**
1. **Refatorar o Cloud Sync (P0):** Garantir que a via Dexie <-> Supabase não gere duplicação de IDs ou sobreposição de dados quando o `FIELD` e o `MANAGER` editam a mesma OS.
2. **Polir o Onboarding:** Trocar os `window.prompt` por modais nativos da interface (`Dialog` ou `BottomSheet`) para criação de Ativos e Clientes.

**Se Mateus tivesse 14 dias:**
1. **Ativar Stripe/Assinaturas:** Plugar o bloqueio de "Free Trial" real no `MenuScreen` -> Licenças. Se a conta expirar, o banco Dexie bloqueia mutações.
2. **Dashboard de Gestor:** Fazer o Gantt Chart/Calendário do Dispatch funcionar com Drag & Drop real (atualmente a UI existe mas falta a fricção zero na manipulação dos cards temporais).

**Se Mateus tivesse 30 dias:**
1. **Backend Serverless de SLA:** Tirar o peso do celular. Colocar Cloud Functions (Supabase Edge Functions) monitorando as OSs e mandando Push Notifications reais para o Gestor quando uma OS vai atrasar.
2. **Finalizar o Supabase Auth:** Matar o login simulado do Dexie. Conectar o `RoleSelectionScreen` diretamente à API de OTP/Magic Link do Supabase para garantir autenticação real e segura na web.