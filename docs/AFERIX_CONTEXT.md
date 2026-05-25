# AFERIX — CONTEXTO OFICIAL DO PROJETO E REGRAS PARA AGENTES IA

Este documento é a ÚNICA fonte de verdade sobre a arquitetura e fluxo atual do Aferix. Qualquer informação contrária (em prompts antigos, documentação legada ou código morto) deve ser ignorada e reportada.

## 1. Visão do Produto
* **Produto**: Aferix.
* **Foco atual**: Orçamento, gestão financeira e operação para prestadores de serviço / autônomos.
* **Identidade Visual**: Dark Premium com amarelo/dourado como accent principal. Tema claro não existe. Sem teal/cyan como destaque.

## 2. Arquitetura Oficial
* O React **nunca** acessa o banco de dados/storage diretamente.
* **Fluxo Oficial**: UI -> Hooks -> Services -> Repositories -> Storage.
* **SSOT (Single Source of Truth)**: Dexie (IndexedDB) é a única fonte de verdade para orçamentos.

## 3. Fluxo Oficial de Orçamento e Persistência
* **Interface**:
  * `src/pages/BudgetForm.tsx` (Form de criação/edição oficial)
  * `src/pages/BudgetHistoryPage.tsx` (Lista/histórico oficial)
* **Hooks**:
  * `src/hooks/useBudgetForm.ts`
  * `src/hooks/useBudgetHistory.ts`
* **Services**:
  * `budgetService.ts`, `BudgetPersistenceService.ts`
* **Repository/Storage**:
  * `dexieBudgetRepository.ts`, `dexieDatabase.ts`
* **Migração**:
  * `LegacyBudgetMigrationService.ts` é o único local autorizado a ler o localStorage legado e persistir no Dexie. Roda no bootstrap.

## 4. Arquivos e Padrões Proibidos no Fluxo Oficial
* **Storage Antigo**: `localStorage` (`savedBudgetsStorage.ts`) é APENAS LEGACY (somente-leitura para migração). Proibido salvar novos dados.
* **Telas Legadas Removidas**: `BudgetHistoryScreen.tsx`, `BudgetWorkspace.tsx`, `BudgetDetailWorkspace.tsx`, `BudgetDetailScreen.tsx`. Nenhum componente deve usar `saveBudgetRecord`.
* **Sincronização**: Proibido bridges bi-direcionais ou sync silencioso "fire-and-forget" entre LocalStorage e Dexie.
* **Complexidade**: Proibido overengineering (DI complexa, CQRS, event buses, factories gigantes).

## 5. Termos e Conceitos Banidos (NÃO USAR)
* **Nomes antigos**: OrcaOS, OrçaOS, ORSLS, WarSLS.
* **Contextos fora do ERP financeiro**: ENDAP, CLP, EasyCLP, bobinagem, calculadora técnica, automação residencial (como foco principal do software).
* **Identidade antiga**: teal, cyan, verde neon, amber (como cor principal), tema claro.
* **Planejamento antigo**: P30, P36, arquivos `task.md`, `implementation_plan.md`, `walkthrough`, `audit_report`.

## 6. Regras para Agentes IA
* Siga rigorosamente a Arquitetura e o Fluxo Oficial.
* Não recrie fluxo de orçamento. O fluxo já está validado.
* Não mexa na lógica financeira (a menos que seja correção de comentários/tipos).
* Não tente criar bridges de sincronização entre Dexie e LocalStorage. Dexie é a fonte única.

## 7. Estado de Validação
* `typecheck` ── **OK** (Compilador TSC sem falhas).
* `build` ── **OK** (Compilação para produção Vite estável).
* `Playwright` ── **OK** (Suite E2E testada e aprovada).
* `Dexie SSOT` ── **OK** (Persistência isolada e garantida).
