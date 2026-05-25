# AFERIX — CONTEXTO OFICIAL DO PROJETO

Aferix é um ERP financeiro mobile-first projetado especificamente para autônomos e pequenos prestadores de serviço (como eletricistas, instaladores e técnicos de manutenção).

---

## 1. Visão do Produto
* **Regra Principal**: Tudo gira em torno do orçamento.
* **MVP Foco**: Orçamento, custos, lucro real, margem de projeto, clientes, histórico e controle financeiro simples.
* **Identidade Visual**: Dark Premium com amarelo/dourado como accent principal. Sem teal/cyan como destaque.

---

## 2. Arquitetura Oficial
A aplicação segue um fluxo local-first rigorosamente desacoplado. O React **nunca** acessa o banco de dados diretamente.

```text
React (Pages/Components) 
  ──> Custom Hooks (useBudgetForm, useBudgetHistory)
        ──> Services (BudgetService, BudgetPersistenceService)
              ──> Repositories (BudgetRepository / DexieBudgetRepository)
                    ──> Storage (Dexie / IndexedDB)
```

---

## 3. Fluxo Oficial de Orçamento e Persistência
* **SSOT (Single Source of Truth)**: **Dexie (IndexedDB)** é a única e absoluta fonte de verdade oficial do projeto.
* **localStorage**: Mantido apenas de forma **legada e somente-leitura** para migração inicial (`savedBudgetsStorage.ts`). Nenhum fluxo ativo grava no localStorage.
* **Composição de Dependências**: Hooks oficiais consomem apenas os Serviços. Toda instanciação dos Repositórios é feita por padrão e de forma limpa nos construtores dos próprios Serviços (`new DexieBudgetRepository()`).

---

## 4. Arquivos Principais do Fluxo
* **Interface**:
  * [BudgetForm.tsx](file:///home/remoto/OrcaOS/src/pages/BudgetForm.tsx) — Form de criação e edição.
  * [BudgetHistoryPage.tsx](file:///home/remoto/OrcaOS/src/pages/BudgetHistoryPage.tsx) — Histórico oficial da aplicação.
* **Hooks**:
  * [useBudgetForm.ts](file:///home/remoto/OrcaOS/src/hooks/useBudgetForm.ts) — Encapsula a lógica reativa do form, com controle reativo de erros e proteção de concorrência.
  * [useBudgetHistory.ts](file:///home/remoto/OrcaOS/src/hooks/useBudgetHistory.ts) — Estado de listagem e controle de erros.
* **Serviços**:
  * [BudgetPersistenceService.ts](file:///home/remoto/OrcaOS/src/services/BudgetPersistenceService.ts) — CRUD puramente físico em IndexedDB.
  * [budgetService.ts](file:///home/remoto/OrcaOS/src/services/budgetService.ts) — Execução de regras de negócio (cálculos de margens e transições de status).
  * [LegacyBudgetMigrationService.ts](file:///home/remoto/OrcaOS/src/services/LegacyBudgetMigrationService.ts) — Roda uma vez no bootstrap do `App.tsx` para importar dados legados de localStorage sem apagar os mesmos.
* **Repositórios e Storage**:
  * [budgetRepository.ts](file:///home/remoto/OrcaOS/src/repositories/budgetRepository.ts) — Interface de acesso.
  * [dexieBudgetRepository.ts](file:///home/remoto/OrcaOS/src/repositories/dexieBudgetRepository.ts) — Implementação concreta em Dexie.
  * [dexieDatabase.ts](file:///home/remoto/OrcaOS/src/storage/dexieDatabase.ts) — Esquemas físicos IndexedDB.

---

## 5. Proibições Absolutas
* **PROIBIDO** criar contêineres de DI, providers ou factories para injeção de repositórios.
* **PROIBIDO** reintroduzir sincronizações silenciosas (bridges) bidirecionais entre localStorage e Dexie.
* **PROIBIDO** ler ou salvar orçamentos diretamente pelo repositório ou pelo `savedBudgetsStorage.ts` fora do fluxo legacy.
* **PROIBIDO** o uso da tela antiga `BudgetHistoryScreen.tsx` (descontinuada/legada).

---

## 6. Termos Legados e Obsoletos (NÃO USAR)
* **OrcaOS / OrçaOS / ORSLS / WarSLS**: Nomes de marca antigos do ERP. O nome oficial único do produto é **Aferix**.
* **Calculadoras Técnicas / CLP / EasyCLP / ENDAP**: Conceitos descontinuados. Foco é ERP financeiro.
* **Teal / Cyan**: Cores antigas da identidade visual. O accent principal agora é Amarelo/Dourado.

---

## 7. Estado de Validação do Checkpoint
* `typecheck` ── **OK** (Compilador TSC sem falhas).
* `build` ── **OK** (Compilação para produção Vite estável).
* `Playwright` ── **OK** (Suite E2E mobile-first testada e 100% aprovada).
* `Dexie SSOT` ── **OK** (Persistência unificada no IndexedDB).
