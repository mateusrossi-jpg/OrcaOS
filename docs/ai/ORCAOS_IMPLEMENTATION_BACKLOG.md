# OrçaOS — implementation backlog for AI/Copilot

This backlog is intentionally practical. Use it to pick the next small implementation steps.

## Critical stability

- Keep `npm run typecheck` passing.
- Keep `npm run dev` usable in Codespaces preview.
- Do not break mobile layout.
- Avoid modifying multiple large files at once unless necessary.
- Prefer small commits/PRs grouped by feature.

## Current near-term focus

1. Improve guided budget by environment.
2. Add more automatic kits.
3. Improve material/service item editing.
4. Improve budget proposal flow.
5. Improve report/PDF layout safety.
6. Refine visual polish after functionality is stable.

## Guided budget backlog

### Existing foundation

The guided budget already supports:

- environment/room selection;
- typed custom environment;
- labor/service templates;
- typed quantity and unit value;
- manual material/part entry;
- internal catalog search;
- automatic double outlet 4x2 kit;
- send to levantamento, orçamento or both.

### Next kits to implement

Add these as automatic kits in `GuidedBudgetCartPro.tsx` or future split files:

1. Simple outlet kit 4x2
   - 1 chassis/support 4x2;
   - 1 outlet module 2P+T;
   - 1 plate 4x2 single.

2. Double outlet kit 4x2 — already exists, can be improved
   - 1 chassis/support 4x2 per point;
   - 2 outlet modules per point;
   - 1 double plate per point.

3. Simple switch kit
   - 1 chassis/support 4x2;
   - 1 switch module;
   - 1 single plate.

4. Parallel switch kit
   - 2 switch modules parallel/tree-way;
   - 2 supports/plates if in different boxes;
   - optional cable/service notes.

5. Lighting point kit
   - service: lighting point installation;
   - optional lamp/socket/spot/luminaire;
   - optional connector.

6. Spot LED kit
   - spot LED unit;
   - connector;
   - installation service;
   - optional driver if applicable.

7. Dedicated air-conditioner circuit kit
   - circuit service;
   - breaker;
   - cable estimate placeholder;
   - conduit/channel note;
   - outlet/isolator where applicable.

8. Breaker circuit kit
   - breaker;
   - label/identification;
   - service in panel;
   - note to validate DR/DPS and conductor sizing.

9. External outlet kit
   - weather-resistant box;
   - outlet module;
   - plate/cover;
   - sealing note;
   - service.

10. Data/low-voltage point kit
   - keystone/RJ45;
   - wall plate;
   - box/support;
   - cable meters placeholder;
   - certification/test note.

### Guided budget improvements

- Add service category filters.
- Add material category filters.
- Add quick buttons: +1, +5, +10.
- Add duplicate item action.
- Add room summary grouped by environment.
- Add subtotal per environment.
- Add option to send only selected items.
- Add option to keep items after sending.
- Add custom kit builder.
- Add saved frequently used kits.

## Catalog backlog

### Internal catalog

Expand `src/data/parts/catalogParts.ts` gradually with realistic categories:

- electrical outlets;
- switches;
- plates;
- supports/chassis;
- breakers;
- DR/RCD;
- DPS/SPD;
- cables;
- conduits/channels;
- connectors;
- lighting;
- refrigeration accessories;
- hydraulic materials.

Each catalog item should ideally include:

- id;
- title;
- brand;
- category;
- subcategory;
- line;
- model/reference;
- current;
- voltage;
- estimatedPrice;
- application;
- description.

### Future online search

Prepare the UI for online search, but keep it disabled/fallback until a reliable implementation exists.

Potential manufacturer/reference targets:

- Schneider;
- Margirius;
- Tramontina;
- WEG;
- Steck;
- Intelbras;
- Tigre;
- Amanco;
- Deca;
- Lorenzetti.

Do not scrape or depend on unstable pages without explicit implementation planning. For now, user input + internal catalog is acceptable.

## Calculator backlog

### Fundamentals gerais

Keep free and useful. Possible additions:

- percentage increase/decrease;
- rule of three;
- area rectangle/circle/triangle;
- volume cube/cylinder;
- cost per square meter;
- productivity per day/hour;
- unit conversion basics.

### Electrical

Planned or existing groups:

- current;
- power;
- Ohm;
- consumption;
- voltage drop;
- cable/disjuntor recommendation;
- conduit fill;
- transformer sizing;
- AWG conversion;
- lighting;
- refrigeration BTU;
- motors;
- industrial analog scaling.

### Construction civil

Possible additions:

- mortar mix estimator;
- plaster/render by wall;
- concrete by slab/beam/column;
- floor and tile boxes;
- grout;
- baseboard;
- roof tile estimate;
- block/tile count;
- waste/loss calculator.

### Painting

Possible additions:

- wall area with openings;
- paint liters;
- sealer;
- putty;
- labor price per m²;
- time estimate;
- room-level budget;
- exterior/interior factors.

### Hydraulics

Current initial calculations:

- rectangular reservoir;
- cylindrical reservoir;
- daily consumption;
- reservoir autonomy;
- flow conversion;
- fill time;
- pressure/MCA.

Future additions:

- pipe diameter helper;
- pump head preliminary;
- pressure loss placeholder;
- water tank sizing by people/days;
- drain slope;
- rainwater capture;
- sewage box estimate;
- hydraulic material kits.

### Future professional modules

- electronics applied;
- transformers;
- motor rewinding;
- solar photovoltaic;
- refrigeration advanced;
- automation/PLC education.

## Budget/PDF backlog

- Add company profile with fixed data:
  - logo;
  - CNPJ;
  - phone;
  - address;
  - default notes;
  - validity;
  - payment terms.
- Add editable budget templates.
- Add multiple proposal models.
- Add paid template structure in the future.
- Fix PDF font overflow and field wrapping.
- Ensure PDF preview uses safe margins and mobile-friendly preview.
- Add item groups by environment.
- Add material/labor subtotal separation.
- Add discount and payment conditions.

## Reports backlog

- Add diagnostic report model.
- Add technical visit report.
- Add before/after photo placeholders.
- Add preventive maintenance reminder fields.
- Add client-facing conclusion text.
- Add report sections by environment.

## Visual backlog

- Improve icon system.
- Use fewer symbolic rough icons where possible.
- Apply subtle black/white/green brand polish.
- Reduce clutter on home screen.
- Improve module selection cards.
- Improve top-left menu aesthetics.
- Standardize tabs and section blocks.
- Ensure dark mode and light mode remain coherent.

## Recommended task style for Copilot

When implementing, use this pattern:

1. Read relevant docs in `docs/ai/`.
2. Inspect current component/file.
3. Make the smallest useful change.
4. Keep TypeScript strict.
5. Keep user-facing text in pt-BR.
6. Run/consider `npm run typecheck`.
7. Summarize changed files and test path.
