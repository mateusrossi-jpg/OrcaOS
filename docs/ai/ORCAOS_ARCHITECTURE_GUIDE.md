# OrçaOS — architecture guide for AI/Copilot

## Stack

- React
- TypeScript
- Vite
- CSS modules/global CSS files
- localStorage for current prototype persistence

Do not add backend assumptions unless asked. The current product is a frontend prototype/app foundation.

## Current entry points

- `src/main.tsx` imports `App` from `src/app/AppOrcaNextOrganized.tsx`.
- `src/app/AppOrcaNextOrganized.tsx` is the current app composition root.
- `src/app/components/AppShell.tsx` is the main navigation shell.

## Main domains

### App shell

Path:

- `src/app/components/AppShell.tsx`

Responsible for:

- top navigation/header;
- active tab rendering;
- app structure;
- mobile/desktop behavior.

### Access and taxonomy

Path:

- `src/core/access/featureAccess.ts`

Responsible for:

- calculator module type union;
- access plan type;
- calculator access rules for electrical calculators.

When adding modules, make sure the `CalculatorModule` union remains compatible with AppOrcaNextOrganized and calculator workspaces.

### Shared workflow types

Path:

- `src/core/types/workflow.ts`

Responsible for workflow data shared by calculations, guided survey, budgets and reports.

Important shared concept: `CalculationCapture`.

A capture should represent something reusable in the workflow, not only a calculation result.

Recommended fields when creating captures:

- `id`;
- `module`;
- `moduleLabel`;
- `calculatorLabel`;
- `destination`;
- `createdAt`;
- `summary`;
- `details`;
- `itemType` when service/material/observation;
- `editableDescription` when it will become a budget line;
- `quantity` and `unitValue` when it is budgetable;
- `shouldGenerateBudgetItem`;
- `convertedToBudgetItem`;
- `reportReady`.

### Calculators

Paths:

- `src/features/calculators/components/GeneralFundamentalsWorkspace.tsx`
- `src/features/calculators/components/ElectricalCalculatorWorkspace.tsx`
- `src/features/calculators/components/GeneralCalculatorWorkspace.ts`
- `src/features/calculators/components/StableGeneralCalculatorWorkspace.tsx`
- `src/features/calculators/components/UnifiedHydraulicsWorkspace.tsx`

`GeneralCalculatorWorkspace.ts` is a bridge that exports the current stable general calculator workspace.

Hydraulics should be opened through `UnifiedHydraulicsWorkspace.tsx`; the stable hydraulics workspace remains an internal basic tab.

Avoid using experimental older files unless intentionally fixing/refactoring them.

### Guided survey / budget

Paths:

- `src/features/workflow/components/GuidedBudgetCart.tsx`
- `src/features/workflow/components/GuidedBudgetCartPro.tsx`
- `src/features/workflow/components/TechnicalCaptureList.tsx`

`GuidedBudgetCart.tsx` is currently a bridge to `GuidedBudgetCartPro.tsx`.

The guided cart should support different modes:

- `catalog` for services/labor;
- `parts` for materials/kits/catalog;
- `manual` for manual notes/items;
- `all` if a combined experience is needed.

### Budget workspace

Path:

- `src/features/budgets/components/BudgetWorkspace.tsx`

Responsible for turning technical captures into commercial proposal items.

When changing capture structure, validate that budget item conversion still works.

### Reports

Path:

- `src/features/reports/components/ReportWorkspace.tsx`

Responsible for report/diagnostic output. It should eventually generate printable/PDF-safe layouts.

### Clients and Work Orders

Paths:

- `src/features/clients/components/ClientWorkOrderWorkspace.tsx`
- `src/features/clients/storage/clientWorkOrderStorage.ts`
- `src/core/types/business.ts`

Work orders should become the anchor for field work. Calculations and guided budget captures can be attached to the active work order.

### Catalog parts

Path:

- `src/data/parts/catalogParts.ts`

This is the internal starting catalog. It should support search by query, brand and category. Future online catalog integration should not break the internal catalog fallback.

## Styling

Current styles are split across several global files in `src/styles/` plus component CSS files.

Important design direction:

- mobile first;
- professional black/white/green identity;
- subtle gradients;
- consistent spacing;
- no rough-looking cards;
- avoid crowded screens;
- tabs and blocks must be visually clear.

When adding CSS:

- reuse existing classes when possible;
- avoid overly broad selectors;
- validate mobile layout;
- avoid text overflow in cards;
- use consistent border radius and spacing.

## Stability rule

Do not create large all-in-one rewrites unless requested. Prefer:

- bridge file;
- stable replacement file;
- small incremental component;
- clear migration path.

If a large file becomes difficult to maintain, create a smaller stable replacement and update imports, but document why.

## TypeScript rules

- Keep strict type compatibility.
- Avoid `any` unless there is no better option.
- Avoid stale imports.
- If a new module is added, update type unions.
- If a field is optional, handle undefined safely.
- Do not rely on disabled typecheck for new code.

## Local storage

Current prototype uses localStorage. Preserve existing keys when possible:

- calculation captures;
- clients/work orders;
- active work order.

When changing storage format, provide a safe parser or migration.

## Common implementation pattern

For a new guided item:

1. Define item UI.
2. Create a `CalculationCapture` or compatible item.
3. Include room/environment when applicable.
4. Include editable description.
5. Include quantity and unit value.
6. Allow destination: levantamento, orçamento, or both.
7. Test in guided survey.
8. Confirm it appears in budget workspace.
9. Confirm it can appear in reports.

For a new calculator:

1. Add it to the correct module.
2. Add fields with sane defaults.
3. Compute result with validation.
4. Show result cards.
5. Allow sending to levantamento/orçamento/both.
6. Keep formulas practical and easy to understand.
7. Add warning/note if it is preliminary.
