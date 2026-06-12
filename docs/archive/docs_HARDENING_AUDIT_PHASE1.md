# Relatório de Auditoria Arquitetural (Fase 1)

## 1. UI importando Repository
**Resultado:** Nenhuma violação direta encontrada nos componentes React importando `*repository`.
**Classificação:** Permitido. A regra principal parece estar sendo respeitada neste aspecto específico.

## 2. UI importando Dexie
**Resultado:** Nenhuma violação direta encontrada. A biblioteca `dexie` está isolada nas pastas `src/storage` e `src/repositories`.
**Classificação:** Permitido.

## 3. UI acessando Storage Legado / localStorage diretamente
**Resultado:** Foram encontradas diversas instâncias de componentes importando funções de módulos `*Storage.ts` que manipulam `localStorage`.
- `src/app/App.tsx` acessa `clientWorkOrderStorage` e `calculationCapturesStorage`.
- `src/features/catalog/components/PremiumCatalogWorkspace.tsx` acessa `catalogHubStorage`.
- `src/features/finance/components/SimpleFinanceWorkspace.tsx` acessa `simpleFinanceStorage`.
- `src/features/reports/components/ReportWorkspace.tsx` acessa `simpleFinanceStorage`.
- `src/features/settings/components/ProfessionalProfileWorkspace.tsx` acessa `businessProfileStorage`.
**Classificação:** Violação Crítica. A UI está pulando a camada de Services e acessando persistência diretamente.

## 4. Hooks importando Storage Legado
**Resultado:** Encontrado em `src/app/hooks/useAppClients.ts` e `useAppCaptures.ts`, que importam diretamente de `clientWorkOrderStorage.ts`.
**Classificação:** Precisa refatorar. Hooks deveriam usar Services.

## 5. Services acessando window/localStorage
**Resultado:** `LegacyBudgetMigrationService.ts` importa `loadSavedBudgets` e outras funções do `savedBudgetsStorage.ts` (que usa localStorage). Ele também importa `db` diretamente de `dexieDatabase`.
**Classificação:** Legado Isolado / Precisa Refatorar. Embora seja um serviço de migração, ele fura a barreira do repository acessando `db` diretamente e lida com o localStorage via outro módulo.

## 6. Lógica de Domínio / Imports Cruzados (Visão Preliminar)
**Resultado:** Há imports cruzados arbitrários. Por exemplo, `ReportWorkspace.tsx` (features/reports) importando `simpleFinanceStorage.ts` (features/finance). Components da UI como `ClientProposalWorkspace.tsx` orquestram lógica complexa como `buildClientProposalFromCaptures`.
**Classificação:** Violação Crítica. Falta coesão de domínio.

## Conclusão da Fase 1
O fluxo `UI -> Hooks -> Services -> Repositories -> Dexie` está quebrado, principalmente pelo uso disseminado do "Storage Legado" (módulos `*Storage.ts` baseados em `localStorage`) que são importados diretamente pela UI e Hooks, ignorando Services/Repositories.

O diagnóstico está concluído e pronto para a FASE 2.
