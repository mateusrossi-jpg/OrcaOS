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

## 🏛️ THE EXECUTIVE COMPOSITION MANDATE
A arquitetura de material está resolvida. Agora, o foco é a **Composição**. Nenhuma tela deve parecer um Dashboard; cada tela deve ser um **Objeto Operacional Único**.

### 1. HERO DOMINANCE
Toda tela deve possuir **um único herói visual indiscutível**. Se dois elementos competem pela atenção, a hierarquia falhou. O Herói (P0) deve dominar pelo menos 30% da massa visual inicial.

### 2. OBJECT-FIRST DESIGN
Não construímos "telas de lista" ou "telas de cadastro". Construímos a visualização de um **Objeto**:
- **Operação:** O objeto é o Pipeline.
- **Financeiro:** O objeto é o Livro-Razão.
- **CRM:** O objeto é a Inteligência do Cliente.

### 3. CARD REDUCTION (Visual Continuity)
Evite o "Grid de Cards" estilo ERP antigo. Busque a **continuidade visual**:
- Use superfícies maiores e contínuas.
- Prefira separadores `hairline` em vez de bordas de cards independentes em listas.
- Agrupe métricas dentro do material do Herói ou do Contexto.

### 4. OPERATIONAL NARRATIVE (Context > Metrics)
Métricas isoladas são dashboarding. No Aferix, o **Contexto** precede os dados:
1. **Contexto:** O que estamos operando?
2. **Objeto:** Qual o estado atual?
3. **Ação:** O que precisa ser feito?
4. **Dados:** Quais os números que sustentam isso?

---

## 🎯 MISSION: VISUAL CONVERGENCE (RECALIBRATED)
A meta não é apenas o material Lovable, mas a **Composição Editorial** das referências:

- **Operações:** Deve parecer **Linear/Command Center**, com foco no fluxo contínuo.
- **Financeiro:** Deve parecer **Mercury/Stripe**, onde a tipografia numérica é a interface.
- **Agenda:** Deve parecer **Fantastical**, onde o "Tempo" é o material.

---
