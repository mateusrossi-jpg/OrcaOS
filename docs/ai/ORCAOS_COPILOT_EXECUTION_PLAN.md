# OrçaOS — Copilot execution plan

This file organizes the work so Copilot/Agent, ChatGPT, or a human developer can continue from the same direction.

## Current execution rule

Work in small, safe increments. The app must remain usable after each step.

Preferred validation after each step:

```bash
npm run typecheck
npm run dev
```

When possible, also run:

```bash
npm run build
```

## Current app foundation

The current app flow is:

- `src/main.tsx` imports `App` from `src/app/AppOrcaNextOrganized.tsx`.
- `AppOrcaNextOrganized.tsx` controls the main screens.
- The guided survey/budget public bridge is `src/features/workflow/components/GuidedBudgetCart.tsx`.
- Guided budget currently points to an integrated version with kits and catalog support.
- Captures use `CalculationCapture` from `src/core/types/workflow.ts`.

## Execution phases

### Phase 0 — Stability checkpoint

Goal: make sure the current repository is stable before adding more features.

Tasks:

1. Run `npm run typecheck`.
2. Fix any TypeScript errors before continuing.
3. Run `npm run dev` and open the app.
4. Smoke test:
   - Início;
   - Cálculos;
   - Levantamento;
   - Orçamentos;
   - Relatórios;
   - Clientes / OS.
5. Confirm `Levantamento → Serviços` and `Levantamento → Peças` open without runtime error.

Acceptance:

- No TypeScript errors.
- No blank screen.
- Guided budget loads.
- Catalog section loads.

### Phase 1 — Guided budget by environment

Goal: make the guided budget strong enough for real field use.

Already implemented:

- environment/room selection;
- typed custom environment;
- labor templates;
- kits:
  - simple outlet 4x2;
  - double outlet 4x2;
  - simple switch 4x2;
  - lighting point;
  - spot LED;
  - dedicated air-conditioner circuit;
  - external outlet;
- editable quantity and unit value;
- duplicate and remove item;
- send to levantamento/orçamento/both.

Next tasks:

1. Add grouping by environment in the mounted items summary.
2. Add subtotal per environment.
3. Add filter by environment.
4. Add button to send only selected environment.
5. Add quick buttons `+1`, `+5`, `+10` for kit quantity.
6. Add option to keep items after sending.

Recommended first task:

> Implement environment grouping and subtotal inside `GuidedBudgetCartNext.tsx`, without changing the external API.

Acceptance:

- Items are visually grouped by environment.
- Each environment shows quantity and subtotal.
- Existing send flow still works.

### Phase 2 — Professional catalog hub

Goal: create a reusable product/service/supplier catalog for the professional.

Already implemented:

- catalog storage in localStorage;
- items/services registration;
- suppliers registration;
- online search URL builder;
- send catalog item to workflow;
- integration into guided budget area.

Next tasks:

1. Add edit item action.
2. Add duplicate item action.
3. Add edit supplier action.
4. Add favorite items.
5. Add import from internal catalog `src/data/parts/catalogParts.ts`.
6. Add category chips.
7. Add direct button: “Adicionar ao kit/orçamento guiado”.
8. Add supplier-specific online search presets.

Recommended first task:

> Add edit and duplicate actions for catalog items in `CatalogHubWorkspace.tsx`, preserving localStorage compatibility.

Acceptance:

- User can edit an existing item.
- User can duplicate an existing item.
- No data loss in localStorage.

### Phase 3 — Budget/proposal editor

Goal: make the orçamento printable and commercially useful.

Tasks:

1. Company profile:
   - logo;
   - business name;
   - CNPJ/CPF;
   - phone;
   - address;
   - default notes;
   - budget validity.
2. Fixed company data automatically appears in the proposal.
3. Add editable proposal templates.
4. Add environment grouping in proposal items.
5. Add material/labor subtotal separation.
6. Add discount/payment terms.
7. Add PDF-safe layout.
8. Prevent text overflow in PDF preview.

Recommended first task:

> Add company profile persistence and render fixed company data in `BudgetWorkspace.tsx`.

Acceptance:

- User can edit/save company data.
- Company data appears in the proposal preview.
- Data persists after reload.

### Phase 4 — Reports and diagnostic output

Goal: make reports useful for client-facing diagnostics.

Tasks:

1. Add report type selector:
   - technical visit;
   - diagnostic;
   - preventive maintenance;
   - delivery report.
2. Add environment sections.
3. Add observations and recommendations.
4. Add photo placeholders for future support.
5. Add PDF-safe layout.
6. Add client/work-order data in report header.

Recommended first task:

> Add report type selector and environment grouping in `ReportWorkspace.tsx`.

Acceptance:

- Report has selectable type.
- Captures are grouped by environment if available.
- Layout remains mobile-safe.

### Phase 5 — More automatic kits

Goal: expand real-world usefulness.

Electrical kits:

1. Single outlet 4x2 — implemented.
2. Double outlet 4x2 — implemented.
3. Simple switch 4x2 — implemented.
4. Parallel switch pair.
5. Intermediate switch.
6. Ceiling fan point.
7. Shower circuit.
8. Cooktop/oven dedicated circuit.
9. Panel/breaker upgrade kit.
10. RJ45 data point.
11. CCTV point.
12. Intercom/electronic lock point.

Hydraulic kits:

1. Bathroom sink point.
2. Kitchen sink point.
3. Toilet point.
4. Shower point.
5. Washing machine point.
6. Water tank/reservoir kit.
7. External faucet point.

Painting kits:

1. Room painting kit.
2. Ceiling painting kit.
3. Putty + sealer + paint kit.
4. External wall painting kit.

Construction kits:

1. Floor installation kit.
2. Wall tile kit.
3. Baseboard kit.
4. Small masonry repair kit.

Recommended first task:

> Add parallel switch kit and shower circuit kit to `GuidedBudgetCartNext.tsx`.

Acceptance:

- New kits appear in the kit selector.
- Generated items include materials and suggested services.
- Items can be edited and sent to workflow.

### Phase 6 — UI polish

Goal: improve perceived quality before public presentation.

Tasks:

1. Improve icon system.
2. Reduce visual noise in Home.
3. Improve top-left menu aesthetics.
4. Improve module cards.
5. Standardize tabs and section cards.
6. Improve guided budget spacing on mobile.
7. Use black/white/green identity consistently.
8. Avoid oversized text and overflowing cards.

Recommended first task:

> Improve guided budget and catalog spacing on mobile without changing logic.

Acceptance:

- More readable on iPhone.
- Buttons are easier to tap.
- Cards do not overflow.

### Phase 7 — Publication readiness

Goal: prepare for external testers / early publication.

Tasks:

1. Ensure all visible placeholders are intentional.
2. Hide unfinished modules behind “em breve”.
3. Add simple onboarding/about screen.
4. Add version label.
5. Add basic privacy/local data note.
6. Add backup/export of local data later.
7. Prepare screenshots.
8. Prepare Play Store roadmap separately.

Recommended first task:

> Add an about/version card in Configurações with current prototype status and local data notice.

Acceptance:

- User understands this is an initial version.
- Local storage/data behavior is transparent.

## Task selection priority

When unsure, choose in this order:

1. Fix TypeScript/build errors.
2. Fix runtime blocking errors.
3. Improve guided budget.
4. Improve catalog.
5. Improve budget/proposal.
6. Improve report/PDF.
7. Improve visual polish.
8. Add more calculators.

## Do not do yet

Avoid these until core flow is stable:

- full backend;
- authentication;
- real payment/subscription logic;
- heavy online scraping;
- complex PDF engine migration;
- large design-system rewrite;
- massive file restructuring.
