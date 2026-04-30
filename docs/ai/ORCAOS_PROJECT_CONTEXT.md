# OrçaOS — project context for AI/Copilot

## Vision

OrçaOS is a professional app for technicians and service providers. The initial product is a mobile-first app for calculations, guided surveys, guided budgets, client management, service orders and reports. The long-term product can evolve into a broader ERP-like platform for different professional trades.

The product should not be treated as a simple calculator. Calculators are only the first entry point. The main value is the connection between:

1. technical calculation;
2. field survey / levantamento;
3. service and material selection;
4. budget/proposal generation;
5. client and work order history;
6. diagnostic/report output.

## Business direction

The free version should be useful and not artificially blocked. A Pro version can unlock additional calculations, advanced templates, advanced reports, identity customization, PDF options, catalogs, and professional modules.

Possible monetization:

- paid professional modules;
- paid budget/report templates;
- Pro subscription;
- future catalog integrations;
- professional account features;
- client/work-order/business management features.

## Product name

Use **OrçaOS** in user-facing product text. It comes from orçamento + OS. Technical package/file names may remain `orcaos` or `OrcaOS` when needed by tooling.

## Target users

Initial users:

- electricians;
- low-voltage technicians;
- residential/commercial installers;
- small service providers;
- students/technicians learning practical calculation and quotation.

Future users:

- plumbers/hydraulic technicians;
- painters;
- civil construction workers;
- refrigeration technicians;
- industrial automation technicians;
- motor/rewinding professionals;
- electronics technicians;
- solar installers.

## UX principle

The app should be easy for non-technical users, but powerful enough for professionals.

Use clear Portuguese labels. Avoid requiring the user to understand internal data structures. Avoid showing excessive technical noise unless it is part of a technical report.

## Current development state

The repository is a React + TypeScript + Vite app.

The app has:

- app shell/navigation;
- calculation modules;
- general fundamentals;
- electrical calculators;
- stable general calculators for construction/pinting/converters/budget;
- stable hydraulics calculators;
- guided budget/survey by environment;
- budget workspace;
- report workspace;
- client/work-order workspace;
- internal catalog parts base.

The current main entry should be `src/app/AppOrcaNext.tsx`, imported by `src/main.tsx`.

## Important recent decisions

1. Keep modules organized by professional sector.
2. Do not use vague category names like only “obras” in user-facing strategy; split into sectors such as construction, painting, hydraulics, electrical, refrigeration, automation, etc.
3. Guided budget must be based on environment/room and support click + typed quantities.
4. Parts/materials should support brand/model/reference.
5. Kits are important: e.g. double outlet kit generates chassis, modules and plates.
6. Online catalog search is a future phase; current internal catalog is acceptable as foundation.
7. Design should move toward premium black/white/green identity.

## Product pillars

### 1. Calculators

Calculators should be practical, fast and connected to the workflow. They should not live isolated from budgets or reports.

### 2. Guided survey / levantamento

A guided field mode where a technician can add services, materials, photos/notes in the future, and structure by room/environment.

### 3. Guided budget / orçamento

The user should build a proposal using service and material items. Items can be added manually, by catalog, by kit, or from calculations.

### 4. Catalogs and kits

Internal catalog now, possible online/manufacturer references later. Kits should generate common groups of materials and services.

### 5. Reports and PDFs

Reports should use the same captured data and generate clean professional output. PDF layout needs special attention for font sizes and field overflow.

### 6. Client and OS management

Client and work-order context should connect to calculations, surveys, budgets and reports.

## Tone and language

Use Brazilian Portuguese for user-facing text.

Keep technical code clean and understandable. Avoid mixing Portuguese and English randomly inside identifiers; prefer English identifiers and Portuguese UI copy.
