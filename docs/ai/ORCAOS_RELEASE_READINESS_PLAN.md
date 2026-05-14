# Aferix — release readiness plan

This plan defines what the app needs before a first external test/public presentation.

## Release goal

Prepare an early but coherent version of Aferix that demonstrates:

- useful professional calculations;
- guided survey by environment;
- guided budget with services/materials/kits;
- catalog registration;
- supplier registration;
- client/work-order context;
- budget/proposal preview;
- technical report foundation.

This does not need to be the final commercial product. It must be stable, understandable and useful enough for early feedback.

## Release principle

Do not publish a feature just because it exists. Publish only what is stable enough and understandable enough.

Unfinished modules can remain visible as “Em breve” only if they do not confuse or break the flow.

## Minimum release checklist

### 1. Stability

Required:

- `npm run typecheck` passes.
- `npm run dev` works.
- App opens on mobile preview.
- No blank screen.
- No critical runtime error in the main tabs.

Nice to have:

- `npm run build` passes.

### 2. Navigation

Required tabs:

- Início;
- Cálculos;
- Levantamento;
- Orçamentos;
- Relatórios;
- Clientes / OS;
- Loja / Pro;
- Configurações.

Each tab must either work or clearly show an “em breve”/prototype state.

### 3. Calculators

Minimum active modules:

- Fundamentos gerais;
- Fundamentos elétricos;
- Construção civil;
- Pintura e acabamento;
- Hidráulica;
- Conversores;
- Orçamento técnico.

Each active module should allow at least one calculation to be sent to:

- levantamento;
- orçamento;
- both.

### 4. Guided survey / budget

Required:

- choose room/environment;
- typed custom environment;
- add service/labor by click;
- add material manually;
- generate automatic kits;
- edit quantity;
- edit unit value;
- duplicate/remove line;
- send to workflow.

Recommended before release:

- group items by environment;
- show subtotal per environment;
- add selected-environment send action.

### 5. Catalog hub

Required:

- register material/part;
- register service;
- register supplier;
- filter catalog items;
- online search helper;
- send catalog item to workflow.

Recommended before release:

- edit item;
- duplicate item;
- import from internal catalog;
- favorite items.

### 6. Budget/proposal

Required:

- budget workspace opens;
- technical items arrive from calculations/guided survey/catalog;
- items can be converted or used in proposal;
- totals are understandable;
- no severe mobile overflow.

Recommended before release:

- company profile;
- logo support;
- CNPJ/phone/address;
- budget validity;
- payment terms;
- grouped items by environment;
- material/labor subtotal split.

### 7. Reports

Required:

- report workspace opens;
- captured items are visible;
- report can show client/work-order context if active.

Recommended before release:

- report type selector;
- environment grouping;
- diagnostic conclusion;
- PDF-safe layout improvements.

### 8. Client / OS

Required:

- client registration works;
- OS/work order registration works;
- active OS context appears in workflow.

Recommended before release:

- clearer active OS indicator;
- search/filter client;
- work-order status improvements.

### 9. Visual quality

Required:

- layout usable on mobile;
- buttons are tappable;
- text does not break badly;
- core identity uses black/white/green;
- screens do not look like raw debug panels.

Recommended before release:

- improve top menu;
- improve icons;
- improve module cards;
- polish guided budget and catalog cards;
- reduce excessive density.

## First external test definition

The first test version is acceptable when a user can do this path:

1. Open app.
2. Create/select client and OS.
3. Go to Levantamento.
4. Select an environment.
5. Add a kit, a manual material and a service.
6. Send items to orçamento.
7. Open Orçamentos.
8. See the items in a proposal-like structure.
9. Open Relatórios.
10. See the technical capture data.

## Known risks

- TypeScript errors from old experimental files.
- Too many large components.
- Mobile layout becoming crowded.
- PDF/report overflow.
- User confusion between levantamento, orçamento and relatório.
- Catalog search being mistaken for real online pricing.

Mitigation:

- keep old experimental files out of active imports;
- do not add real online pricing until there is reliable source strategy;
- label online search as support/reference;
- keep user-facing wording clear.

## Release labels

Use wording such as:

- “Versão inicial”;
- “Protótipo funcional”;
- “Dados salvos localmente neste dispositivo/navegador”;
- “Cálculos preliminares: valide condições reais da instalação”.

Avoid overpromising:

- do not claim final engineering compliance;
- do not claim automatic regulatory sizing;
- do not claim live supplier price accuracy.

## Suggested next release sprint

Sprint 1 — Stabilize and organize

- Run typecheck.
- Fix current errors.
- Smoke test main tabs.
- Group guided budget items by environment.

Sprint 2 — Catalog usability

- Edit/duplicate catalog item.
- Supplier edit.
- Internal catalog import.

Sprint 3 — Proposal readiness

- Company profile.
- Proposal header.
- Item grouping.
- Payment terms.

Sprint 4 — Report readiness

- Report type selector.
- Environment grouping.
- Better preview layout.

Sprint 5 — Visual polish

- Guided budget and catalog mobile polish.
- Module card polish.
- Header/menu polish.

## Stop condition before publication

Do not present/publish if:

- app does not typecheck;
- main screen is blank;
- guided budget cannot send items;
- budget workspace crashes;
- mobile layout is unusable;
- user cannot understand what to do next.
