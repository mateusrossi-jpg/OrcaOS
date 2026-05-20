# AFERIX Splash and Visual Fix

## Splash Fix

Remove the first standalone A intro completely.

Keep only the AFERIX wordmark intro.

Current problem:
- broken logo on splash
- X wrapping below AFERI
- mobile alignment inconsistent

Expected:
AFERIX always on a single line.

The yellow X must:
- stay inline
- stay aligned
- never wrap below
- preserve premium branding

Apply:
- white-space nowrap
- inline-flex wordmark
- no flex-wrap
- no block display on X
- centered mobile alignment

## Header

The brand/logo should feel centered on iPhone.

Fix:
- symmetrical spacing
- centered wordmark
- balanced menu spacing

## Buttons and chips

Improve:
- height
- padding
- touch area
- active state
- consistency

## Catalog and cards

Improve:
- spacing
- alignment
- proportions
- hierarchy
- mobile usability

Avoid:
- compressed cards
- misaligned values
- disconnected styles

## Closures screen

Refine Fechamentos visual implementation.

Focus:
- planned vs actual
- large readable cards
- integrated Aferix visual identity
- premium mobile-first feel

## Category alignment

Fix category alignment for:
- Mao de obra
- Materiais
- Servicos completos
- Deslocamento

Fix zero value alignment bug inside Servicos completos.

## Mobile-first

Validate on:
- iPhone Safari
- Android Chrome

Fix:
- overflow
- spacing
- touch comfort
- readability
- safe areas

## Acceptance criteria

- splash fixed
- first broken A removed
- X never breaks below
- header centered
- chips/buttons premium
- cards coherent
- closures integrated visually
- values aligned
- build works
