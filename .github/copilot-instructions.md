# Copilot instructions — Aferix

Use these instructions whenever working on this repository.

## Product identity

The product is **Aferix** — with cedilha. Do not rename it to Aferix in user-facing labels unless it is a technical file/package name that cannot use special characters.

Aferix is intended to be a professional mobile-first platform for technicians and service providers. It starts as a practical calculator and guided quotation app, but must be architected to evolve into a broader business/ERP-style platform for:

- technical calculations;
- guided surveys / levantamento;
- guided budgets / orçamento;
- product and service catalog;
- client registration;
- work orders / OS;
- diagnostic reports;
- PDF proposals;
- future paid modules and templates.

The first target audience is electricians and low-voltage professionals, but the architecture must support additional trades: civil construction, painting, plumbing/hydraulics, refrigeration, industrial automation, electronics, transformer/rewinding, solar and other service professions.

## Main development priorities

1. Keep the app buildable at all times.
2. Prefer small, safe, incremental changes.
3. Run or preserve compatibility with:
   - `npm run typecheck`
   - `npm run dev`
   - `npm run build` when possible.
4. Do not introduce new dependencies unless clearly justified.
5. Preserve mobile usability, especially on iPhone/Safari/Codespaces preview.
6. Keep calculation, survey, budget and report flows connected.
7. Avoid creating isolated features that do not send data to survey/budget/report flows.

## Important current architecture

The app is React + TypeScript + Vite.

Important areas:

- `src/app/AppOrcaNext.tsx`: current main app entry used by `src/main.tsx`.
- `src/app/components/AppShell.tsx`: main shell/navigation.
- `src/core/access/featureAccess.ts`: calculator module access/taxonomy types.
- `src/core/types/workflow.ts`: shared calculation/survey/budget item types.
- `src/features/calculators/components/`: calculator workspaces.
- `src/features/workflow/components/GuidedBudgetCart.tsx`: public import bridge for guided budget/survey.
- `src/features/workflow/components/GuidedBudgetCartPro.tsx`: current guided budget by environment.
- `src/features/budgets/components/BudgetWorkspace.tsx`: budget/proposal editor.
- `src/features/reports/components/ReportWorkspace.tsx`: report/PDF preview flow.
- `src/features/clients/components/ClientWorkOrderWorkspace.tsx`: clients and work orders.
- `src/data/parts/catalogParts.ts`: internal parts/material catalog.

There are stable replacement calculator files:

- `StableGeneralCalculatorWorkspace.tsx`
- `StableHydraulicsCalculatorWorkspace.tsx`

Older experimental files may exist but should not be used unless intentionally refactored.

## UI and design direction

The desired visual identity is professional, clean and premium, using:

- black / white / green as core brand colors;
- subtle gradients only;
- flat but refined cards;
- strong spacing and hierarchy;
- rounded borders with consistent radii;
- clear typography;
- mobile-first layouts;
- no visually noisy or toy-like interface.

Avoid rough/generic design. Avoid excessive icons. Prefer clear cards, tabs and action buttons.

## Guided budget concept

The guided budget / survey flow must be one of the product pillars.

It should support:

- choosing or typing the current environment/room;
- adding labor/services by click;
- typing quantity manually;
- editing unit values;
- adding material/parts manually;
- choosing brand/model/reference;
- searching internal catalog;
- later integrating online catalogs/manufacturer references;
- creating automatic kits by room.

Example: if the room has four double outlets, the app should be able to generate:

- 4 chassis/supports 4x2;
- 8 outlet modules;
- 4 double plates 4x2;
- optional labor/service items.

This guided budget must send items to:

- levantamento;
- orçamento;
- or both.

## Calculator module taxonomy

Keep modules coherent by professional sector, not vague categories.

Current and planned modules:

- fundamentosGerais;
- fundamentos elétricos;
- instalações elétricas;
- iluminação;
- refrigeração;
- motores;
- automação industrial;
- construção civil;
- pintura e acabamento;
- hidráulica;
- conversores;
- orçamento técnico;
- eletrônica aplicada;
- transformadores;
- solar fotovoltaico;
- rebobinagem.

Do not mix unrelated calculations into random categories. If adding a calculation, place it in the correct module and ensure the module label and UI copy are coherent.

## Data flow rule

Whenever a calculation, guided service, material or kit is created, it should be able to become a `CalculationCapture` or compatible workflow item. It should include:

- module;
- moduleLabel;
- calculatorLabel;
- destination;
- createdAt;
- summary;
- details;
- editableDescription when useful;
- quantity and unitValue when it represents a budget item;
- itemType when useful: service, material, technicalObservation, etc.

The goal is to avoid duplicated work: a calculation or survey item should be reusable in the budget and report.

## Safety and quality rules

- Never remove working modules without replacing them.
- Do not silently change public labels from Portuguese to English.
- Keep user-facing app text in Brazilian Portuguese.
- Keep code identifiers in English when practical.
- Avoid large rewrites unless asked.
- Avoid moving files unless necessary.
- Preserve localStorage compatibility when possible.
- Keep TypeScript strict mode clean.
- Prefer explicit types for shared data structures.

## Before finishing a task

Check whether the change affects:

- navigation;
- calculation modules;
- guided budget;
- budget workspace;
- reports;
- mobile layout;
- type definitions;
- localStorage shape.

If a change introduces a new module or workflow, update documentation in `docs/ai/` when appropriate.
