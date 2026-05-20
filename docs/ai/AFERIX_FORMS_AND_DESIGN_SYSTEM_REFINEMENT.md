# AFERIX — Forms and Design System Refinement

## Context
The Aferix premium dark visual identity is evolving correctly in major cards and highlighted areas, but form controls and auxiliary components still look disconnected from the rest of the product.

Goal:
Unify inputs, selects, dropdowns, category cards, filters and auxiliary blocks under the same premium mobile-first design system.

Do not add new features.
Do not change business logic.
Focus only on visual consistency, mobile comfort and premium refinement.

## 1. Main problem

Currently there are two mixed visual systems:

### Premium system
- large premium cards
- elegant yellow highlights
- strong typography
- dark premium identity
- visual presence

### Generic system
- small selects
- thin inputs
- compressed dropdowns
- weak padding
- desktop-like form controls
- administrative appearance

Result:
Form controls feel like another application.

Objective:
All components must feel part of the same premium design system.

## 2. Selects / dropdowns / menus

Affected fields:
- Tipo
- Fornecedor
- Fabricante
- Categoria
- Origem
- Uso
- Regime

Current problems:
- too short
- too small
- weak visual weight
- insufficient padding
- default HTML feeling

Required fixes:
- increase minimum height
- increase vertical and horizontal padding
- improve internal alignment
- improve touch area
- use same radius as premium cards
- use same dark visual language
- improve dropdown arrow alignment
- improve visual hierarchy

Target:
All selects must feel premium and mobile-first.

## 3. Standardize form controls

Consolidate one unified premium form visual language.

Suggested conceptual component:
FormControlPremium

All controls should share:
- same height
- same padding
- same radius
- same background
- same typography
- same hierarchy
- same mobile behavior

Apply to:
- inputs
- selects
- textareas
- dropdowns
- filters
- menus

## 4. Mobile touch comfort

Current controls still feel desktop-compressed.

Fix:
- minimum height between 56px and 64px
- comfortable touch area on iPhone
- avoid narrow controls
- avoid administrative ERP appearance

## 5. Category cards

Affected cards:
- Materiais
- Mao de obra
- Servicos compostos
- Deslocamento
- Taxas
- Personalizados

Main issue:
Servicos compostos visually looks like another component.

Problems:
- inconsistent line breaking
- inconsistent padding
- inconsistent alignment
- inconsistent hierarchy
- inconsistent spacing

Required:
- same width
- same height
- same alignment
- same baseline
- same padding
- same typography
- same value positioning

All cards must feel part of the same grid system.

## 6. Value alignment

Problems:
- displaced values
- compressed numbers
- inconsistent positioning
- alignment divergence

Fix:
- text alignment
- justify-content
- baseline consistency
- line-height
- internal spacing
- flex/grid consistency

All numbers should align visually.

## 7. Markup and margin text block

Current issue:
The text block:
- Margem liquida alvo
- Encargos estimados

looks compressed and badly wrapped.

Fix:
- improve container width
- improve spacing
- improve readability
- improve line-height
- improve information hierarchy

Suggested visual structure:

Margem liquida alvo:
30%

Encargos estimados:
41%

Goal:
Cleaner premium reading experience.

## 8. Yellow premium card reference

The yellow highlighted card already represents the desired premium quality.

Use it as reference for:
- spacing
- hierarchy
- padding
- typography
- proportions
- visual weight

Other components should evolve toward this quality level.

## 9. Mobile-first mandatory

Validate on:
- iPhone Safari
- Android Chrome

Fix:
- horizontal overflow
- compressed controls
- touch discomfort
- desktop grids
- visual inconsistency
- spacing issues

## 10. Final experience

The result should communicate:
- premium software
- professional tool
- consistency
- stability
- mobile comfort
- unified design system

The user must never feel:
random components mixed together.

All components must feel:
part of the same product.

## 11. Important rules

Do not:
- add features
- change business rules
- refactor architecture unnecessarily
- add heavy libraries
- create corporate dashboard style

Do:
- refine
- consolidate
- align
- standardize
- improve mobile UX
- preserve build stability
- preserve performance
- preserve Aferix dark premium identity
