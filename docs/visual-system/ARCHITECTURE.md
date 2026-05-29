# AFERIX VISUAL ARCHITECTURE — THE 3-LAYER SYSTEM
**Status: AUTHORITATIVE | Focus: SIMPLICITY & POLISH**

To ensure absolute consistency and premium quality without artificial complexity, Aferix is built on three core layers.

---

## LAYER 1: VISUAL IDENTITY (The DNA)
**Source:** `AFERIX_VISUAL_RULES.md` & `src/styles/design-system.css`

- **Tokens:** Colors (oklch), Spacing, Radii (24px-32px).
- **Surfaces:** Cinematic Graphite gradients and atmospheric shadows.
- **Typography:** Bold sans-serif hierarchy (Inter/SF Pro).
- **Motion:** Fluid iOS-style easings.

---

## LAYER 2: SEMANTIC RUNTIME (The Behavior)
**Source:** `src/ui/runtime/` & `<SemanticScreen />`

Instead of styling screens manually, we define the **context**. The runtime infers the rest.

- **Dashboard:** Cinematic, maximum breathing (64px), high atmosphere.
- **Operational:** Fast scanning, 32px rhythm, tactical density.
- **Finance:** Institutional calm, 24px rhythm, numerical precision (tabular-nums).
- **Timeline:** Temporal ergonomics, sequential cadence.

---

## LAYER 3: ATTENTION PRIORITY (The Focus)
**Source:** `src/ui/attention/` & `<Priority.P* />`

Orchestrates what the user sees first, protecting them from cognitive fatigue.

- **P0 (Critical):** Errors, immediate actions. (Glow, Contrast).
- **P1 (Primary):** The hero data of the screen.
- **P2 (Secondary):** Supporting context, lists.
- **P3 (Ambient):** Metadata, versioning, background texture.

---

## 🚨 THE GOLDEN RULE (Simplicity First)
Para evitar que a arquitetura sufoque a criatividade e a velocidade, uma tela **NÃO PODE** possuir mais de:
- **1** `<SemanticScreen />` (O contexto)
- **1** Layout component (A estrutura)
- **0 a 3** `<Priority.P* />` zones (O foco)

Qualquer coisa além disso é considerada **over-engineering** e deve ser simplificada.

---

## 🎯 MISSION: VISUAL CONVERGENCE
A partir de agora, a **Home** é o padrão absoluto de qualidade. O objetivo único é fazer com que todas as outras telas pareçam ter nascido do mesmo DNA:

- **Operações:** Deve parecer **Linear/Command Center**, não um Kanban genérico.
- **Financeiro:** Deve parecer **Apple Wallet Pro/Mercury**, não uma planilha.
- **Agenda:** Deve parecer **Fantastical/Linear Timeline**, não uma lista de eventos.
- **Clientes:** Deve parecer um **Intelligence Workspace**, não um cadastro.
- **Relatórios:** Deve parecer **Executive Intelligence**, não um BI de template.

**Critério de Sucesso:** Se um usuário ver a Home e depois o Financeiro, ele deve ter certeza absoluta de que está no mesmo produto premium.

---
