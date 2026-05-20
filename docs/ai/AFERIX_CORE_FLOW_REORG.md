# AFERIX Core Flow Reorganization

This note defines the intended product separation for the Aferix beta.

## Goal
Separate the main responsibilities that became mixed in the current experience.

Aferix should keep three clear areas:

1. Budgets
2. Closures
3. Reports

## Budgets
Budgets are for creating and sending the commercial estimate.

Official order:

Client -> Service -> Items -> Costs -> Review -> Document/PDF

Budget area should handle:

- create budget
- edit budget
- select client
- describe service
- add items
- define costs
- review
- generate PDF
- send to client

Budget is not closure.
Budget is not management reporting.
Budget is not business performance.

## Closures
Create a dedicated area named Fechamentos.

Purpose:
register the real final result of completed services.

It should compare planned versus actual values.

Suggested fields:

- planned value
- received value
- planned expenses
- real expenses
- planned profit
- real profit
- final difference
- payment status

Behavior:

- when a service or budget is concluded, allow creating a closure
- planned values can come from the original budget
- the user fills real received values and real expenses
- the app calculates real profit and final difference

Keep this simple. Do not turn it into accounting software.

## Reports
Reports are for business management.

Reports should show consolidated performance, such as:

- monthly revenue
- total profit
- average ticket
- completed services
- expenses
- general performance

Reports should not duplicate budgets, closures, or attendances.

## Suggested main menu

- Painel
- Clientes
- Atendimentos
- Orcamentos
- Fechamentos
- Relatorios
- Financeiro

## Rules

- keep the app mobile-first
- avoid duplicated information
- avoid corporate ERP complexity
- avoid desktop grids on iPhone
- avoid horizontal overflow
- use large readable cards
- preserve beta stability

## Implementation approach
First generate architecture and UX proposal.
Do not implement code before validating real files, current props, current routes, package scripts, and build impact.
