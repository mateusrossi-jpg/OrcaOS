# Aferix Architecture

## Product Positioning
Aferix is a local-first financial ERP for independent professionals. The current product surface is centered on clients, proposals, service pricing, real profit, receivables, expenses and management reports.

## Local-First Core
- Primary runtime data is stored in browser local storage for offline use.
- Budget drafts, saved proposals, clients, work orders, finance records, profile data and backup metadata remain available without network access.
- Legacy storage namespaces are kept readable to protect existing local installations during the Aferix rebrand.
- Supabase sync remains an integration layer, not the source of truth for the local workflow.

## Financial Engine
- Project margin is calculated with `calculateProjectMargin`.
- Budget persistence stores service total, material cost, operational cost, tax rate and net profit.
- The budget editor validates and saves calculated margin locally before any external sync.

## Interface System
- Visual identity: High-Contrast Dark Professional.
- Main background: `#0A0A0B` / OLED black surfaces where appropriate.
- Data surfaces: `#161618`, `1px solid #27272A`, `12px` radius.
- Primary action and navigation identity: Teal `#2DD4BF`.
- Financial semantics: profit `#10B981`, receivables/warnings `#F59E0B`, expenses `#EF4444`.
- Financial values use tabular numeric typography through the shared mono font stack.

## Main User Flows
- Dashboard: SAP Fiori-style KPI tiles for Net Profit, Cash Flow, Accounts Receivable and Expenses.
- Proposals: Odoo-style two-column editor with item entry on the left and sticky live financial summary on the right.
- Finance: simple local records for income, expenses and profit visibility.
- Backup: local export/import and Google Drive appDataFolder backup while preserving local-first behavior.

## Quality Gates
- `npm run typecheck` must pass before release.
- `npm run build` must pass and keep heavy PDF rendering isolated in a lazy chunk.
- Rebrand scans should keep user-facing text, logos and docs aligned with Aferix.
