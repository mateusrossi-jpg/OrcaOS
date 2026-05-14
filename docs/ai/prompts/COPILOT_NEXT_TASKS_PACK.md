# Copilot next tasks pack — Aferix

Use these prompts one at a time. Do not run all tasks in one large change.

## Mandatory context for every task

Before coding, read:

- `.github/copilot-instructions.md`
- `docs/ai/ORCAOS_PROJECT_CONTEXT.md`
- `docs/ai/ORCAOS_ARCHITECTURE_GUIDE.md`
- `docs/ai/ORCAOS_COPILOT_EXECUTION_PLAN.md`
- `docs/ai/ORCAOS_RELEASE_READINESS_PLAN.md`
- `docs/ai/ORCAOS_TESTING_CHECKLIST.md`

Always keep:

- TypeScript clean;
- app text in pt-BR;
- product name as Aferix;
- mobile-first layout;
- workflow connection between levantamento, orçamento and relatório.

---

## Task 1 — Stability checkpoint

Prompt:

> Run or reason through `npm run typecheck`. Fix the smallest possible set of TypeScript errors. Do not add new features. Do not remove active modules. After fixing, summarize files changed and how to test.

Acceptance:

- Typecheck passes or all remaining errors are clearly listed.
- No feature changes.

---

## Task 2 — Group guided budget by environment

Prompt:

> In `src/features/workflow/components/GuidedBudgetCartNext.tsx`, group mounted items by environment in the summary/list area. Show each environment name, item count and subtotal. Preserve existing edit quantity, edit unit value, duplicate, remove and send flow. Keep the external component API unchanged.

Acceptance:

- Items are grouped by room/environment.
- Each group shows subtotal.
- Sending all items still works.
- Typecheck remains clean.

---

## Task 3 — Add selected environment send action

Prompt:

> Extend `GuidedBudgetCartNext.tsx` so the user can send only the items from a selected environment to the workflow. Keep the existing “Enviar itens ao fluxo” action for all items. Make the UI clear on mobile.

Acceptance:

- Existing send all still works.
- User can send one environment group.
- Sent items are removed or kept according to current behavior, documented in UI.

---

## Task 4 — Catalog item edit and duplicate

Prompt:

> In `src/features/catalog/components/CatalogHubWorkspace.tsx`, add edit and duplicate actions for catalog items. Editing should reuse the existing item form or a simple inline editing state. Duplicating should create a new item with a new id and “cópia” in the title. Preserve localStorage compatibility.

Acceptance:

- User can edit item fields.
- User can duplicate item.
- localStorage still saves/loads.
- Typecheck remains clean.

---

## Task 5 — Supplier edit

Prompt:

> In `CatalogHubWorkspace.tsx`, add edit action for suppliers. Keep the supplier list usable on mobile. Preserve existing remove/site/catalog actions.

Acceptance:

- User can edit supplier.
- Supplier changes persist.
- Existing item supplier relation remains valid by id.

---

## Task 6 — Import from internal parts catalog

Prompt:

> Add an action in `CatalogHubWorkspace.tsx` to import selected items from `src/data/parts/catalogParts.ts` into the professional catalog. Avoid duplicates by title+brand+model. Let the user add one item at a time from the internal catalog search.

Acceptance:

- Internal catalog items can become professional catalog items.
- Duplicates are avoided or clearly handled.
- Imported item can be sent to workflow.

---

## Task 7 — Company profile in budget

Prompt:

> Add a company profile section to `BudgetWorkspace.tsx` with persistence in localStorage. Fields: logo URL/base64 placeholder, business name, CNPJ/CPF, phone, address, default notes, budget validity and payment terms. Render this data in the proposal preview as fixed company data.

Acceptance:

- Company data can be edited/saved.
- Data persists after reload.
- Proposal preview shows the data.
- Layout does not overflow on mobile.

---

## Task 8 — Budget grouping by environment

Prompt:

> In the budget/proposal flow, group technical captures/items by environment when the summary or editableDescription starts with an environment prefix like `Sala - ...` or details include `Ambiente: ...`. Show material subtotal, service subtotal and total per environment if possible.

Acceptance:

- Budget view is easier to read by room.
- Items without environment still appear under “Sem ambiente”.
- Totals remain coherent.

---

## Task 9 — Report type selector

Prompt:

> In `ReportWorkspace.tsx`, add a report type selector with options: Visita técnica, Diagnóstico, Manutenção preventiva, Entrega de serviço. Render the selected type in the report header and persist it locally if the component already persists report state.

Acceptance:

- User can select report type.
- Report preview reflects selected type.
- Existing capture display still works.

---

## Task 10 — Settings version/about card

Prompt:

> Add an about/version card in the Settings screen in `AppOrcaNextOrganized.tsx`. It should explain this is an initial functional version, data is saved locally in the browser/device, and calculations are preliminary and must be validated in the real installation.

Acceptance:

- Settings shows clear version/about information.
- Text is in pt-BR.
- No layout break.

---

## Task 11 — Add parallel switch kit and shower circuit kit

Prompt:

> In `GuidedBudgetCartNext.tsx`, add two automatic kits: Interruptor paralelo and Circuito dedicado chuveiro. Each kit should generate materials and suggested labor/service. Include notes that final cable, breaker and protection must be validated by calculation and real installation conditions.

Acceptance:

- New kits appear in kit selector.
- Generated items can be edited, duplicated, removed and sent to workflow.

---

## Task 12 — Mobile polish for guided budget/catalog

Prompt:

> Improve CSS for guided budget and catalog hub mobile layout. Focus on spacing, tap targets, text wrapping and reducing visual density. Do not change business logic.

Acceptance:

- More readable on iPhone/mobile preview.
- No horizontal overflow.
- Buttons are easy to tap.

---

## Recommended order

1. Task 1
2. Task 2
3. Task 4
4. Task 7
5. Task 8
6. Task 9
7. Task 10
8. Task 11
9. Task 12

## Reporting format after each task

Use this output:

```md
## Summary
- ...

## Files changed
- ...

## Test path
- ...

## Typecheck
- Passed / Not run / Remaining errors
```
