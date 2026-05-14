# Aferix — testing checklist for AI/Copilot

Use this checklist after changes.

## Basic commands

Run when possible:

```bash
npm install
npm run typecheck
npm run dev
npm run build
```

At minimum, keep `npm run typecheck` passing before considering a task complete.

## Manual app smoke test

### Startup

- App opens without blank screen.
- Console has no blocking runtime error.
- Navigation opens on mobile preview.
- Top menu and tabs are usable on iPhone/Safari/Codespaces preview.

### Main navigation

Check these tabs:

- Início;
- Cálculos;
- Levantamento;
- Orçamentos;
- Relatórios;
- Clientes / OS;
- Loja / Pro;
- Configurações.

### Calculations

Open and test at least one item in each active group:

- Fundamentos gerais;
- Fundamentos elétricos;
- Instalações elétricas;
- Construção civil;
- Pintura e acabamento;
- Hidráulica;
- Conversores;
- Orçamento técnico.

For each tested calculator:

- Open calculator.
- Change at least one input.
- Confirm result updates.
- Click “Adicionar ao levantamento”.
- Click “Adicionar ao orçamento”.
- Click “Adicionar aos dois”.
- Confirm items appear in the correct downstream tab.

### Guided survey / orçamento guiado

Open:

- Levantamento → Serviços;
- Levantamento → Peças;
- Levantamento → Bloco manual;
- Levantamento → Itens salvos.

Test:

- select an environment;
- type a custom environment;
- add one labor/service item;
- change quantity and unit value;
- add a manual part;
- add an internal catalog part;
- generate the double outlet 4x2 kit;
- send items to levantamento/orçamento/both;
- verify they appear in Itens salvos and Orçamentos.

### Budget workspace

Open Orçamentos.

Check:

- technical items appear;
- proposal editor still opens;
- company data is visible/editable if available;
- item conversion does not crash;
- totals are coherent;
- no text overflow on mobile.

### Reports

Open Relatórios.

Check:

- captured items appear;
- report sections render;
- preview does not overflow badly;
- fields wrap safely;
- no broken layout with long text.

### Clients / OS

Open Clientes / OS.

Check:

- create/select client;
- create/select work order;
- active work order context appears in other flows;
- new captures can attach to active work order.

## Visual checklist

- Text is readable on mobile.
- Cards have consistent spacing.
- No clipped labels.
- No giant empty areas.
- Buttons are tappable.
- Header/menu does not overlap content.
- Dark/light theme remains coherent if applicable.
- Brand direction remains black/white/green.

## Regression watchlist

Be careful with these files:

- `src/app/AppOrcaNextOrganized.tsx`
- `src/main.tsx`
- `src/core/types/workflow.ts`
- `src/core/access/featureAccess.ts`
- `src/features/workflow/components/GuidedBudgetCartPro.tsx`
- `src/features/budgets/components/BudgetWorkspace.tsx`
- `src/features/reports/components/ReportWorkspace.tsx`

Changing shared types can break many flows. Validate carefully.

## Acceptance criteria for a small feature

A small feature is acceptable when:

- it compiles;
- it is reachable from UI;
- it uses Portuguese labels;
- it works on mobile layout;
- it connects to workflow if applicable;
- it does not duplicate unrelated logic;
- it does not remove existing features.
