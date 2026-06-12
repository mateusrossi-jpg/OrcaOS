# AFERIX — OFFICIAL VISUAL RULES & DESIGN AUTHORITY
**ERP PREMIUM • EXECUTIVE OS V5 • DESIGN SPECIFICATION**

## 1. CORE PHILOSOPHY
> "A interface deve parecer um sistema operacional executivo premium, não um dashboard."

O Aferix não é um site nem um ERP tradicional. É uma **ferramenta de autoridade**. O design deve ser invisível, calmo e caro. Ele deve transmitir a sensação de um software proprietário rodando em hardware de luxo.

### DNA EMOCIONAL
- **Calma:** Nada grita. Nada brilha sem motivo.
- **Clareza:** O dado principal é sempre o herói.
- **Luxo Discreto:** Qualidade através de proporção e profundidade, não ornamentação.
- **Confiança:** Estabilidade visual que sugere precisão matemática.
- **Operacionalidade:** Feito para ser usado com uma mão, em campo, sob pressão.

---

## 2. OFFICIAL TOKENS (Source: design-system.css)

### BACKGROUNDS & ATMOSPHERE
- **Primary Base:** `oklch(0.14 0.005 260)` (Cinematic Graphite) — Jamais use preto puro (#000).
- **Surface:** `oklch(0.18 0.006 260)` — A camada padrão para cards.
- **Atmosphere:** Sempre utilize a `system-vignette` para criar profundidade de campo.

### ACCENTS (RESTRICTED PALETTE)
- **Gold (Primary):** `oklch(0.82 0.14 85)` — Usado para ações principais e lucro.
- **Green (Success):** `oklch(0.78 0.16 155)` — Usado para tendências positivas e "Em Execução".
- **Red (Alert):** `oklch(0.68 0.2 25)` — Usado apenas para erros críticos e prejuízo.

---

## 3. SUPERFÍCIES E PROFUNDIDADE

### REGRAS DE CARDS
- **Raio:** Sempre `24px` (variável `--radius-card`).
- **Borda:** Sempre `1px solid white/[0.04]` (variável `--border-soft`). Nunca use bordas grossas ou coloridas.
- **Gradiente:** Sempre `linear-gradient(180deg, white/[0.06] 0%, transparent 100%)`. Isso cria o efeito de "vidro sólido".
- **Shadow:** Use `var(--shadow-soft)` para objetos padrão e `var(--shadow-card)` para modais/hover.

---

## 4. TIPOGRAFIA (TYPOGRAPHY)

### HIERARQUIA
1. **Headline:** Semibold/Bold, tracking `-0.03em`. Máxima clareza.
2. **Metadata:** Medium, tracking `0.15em`, Uppercase. Sempre secundário.
3. **Números:** Utilize sempre a classe `.num` (`tabular-nums`). Valores financeiros devem ter autoridade visual.

### PESOS
- **Títulos:** Bold (700) ou Semibold (600).
- **Corpo:** Medium (500).
- **Suporte:** Regular (400) com opacidade reduzida.
- **NUNCA** use pesos Light ou Thin (perda de legibilidade operacional).

---

## 5. SPACING (RITMO OPERACIONAL)

### REGRAS ABSOLUTAS
- **Margem de Tela:** Sempre `24px` ou `32px` no desktop/tablet, `16px` no mobile.
- **Section Spacing:** Sempre `48px` (variável `--spacing-section`).
- **Card Internal Padding:** Mínimo de `24px`. O conteúdo deve respirar.
- **Stacking:** Use `12px` para itens relacionados e `24px` para blocos independentes.

---

## 6. MOTION & GLOW

### ANIMAÇÕES
- **Velocidade:** Lenta e fluida (`300ms` a `500ms`).
- **Easing:** Sempre `cubic-bezier(0.16, 1, 0.3, 1)`. Movimento orgânico, estilo iOS.
- **Comportamento:** Fade-in com leve deslocamento de 4px no eixo Y.

### GLOW CINEMATOGRÁFICO
- O glow deve ser **subconsciente**.
- Use apenas em elementos de alto valor (Lucro, Botão Principal).
- Opacidade máxima do glow: `15%` a `25%`.

---

## 7. O QUE FAZER (THE DO LIST)
- ✅ **Layering:** Sobreponha superfícies grafite para criar hierarquia.
- ✅ **Tabular Nums:** Alinhe decimais perfeitamente em listas financeiras.
- ✅ **Soft Focus:** Use blurs de fundo (`32px`) em modais e navegação.
- ✅ **Tactile Buttons:** Botões devem ter `16px` de radius e sombra suave.
- ✅ **Editorial Titles:** Subtítulos devem ser frases curtas e explicativas em cinza suave.

## 8. O QUE NÃO FAZER (THE DON'T LIST)
- ❌ **Pure Black:** Nunca use fundo #000. Destrói a profundidade cinematográfica.
- ❌ **Hard Borders:** Jamais use bordas coloridas ou com opacidade alta.
- ❌ **Information Density:** Não tente colocar tudo na mesma tela. Use sub-páginas ou modais.
- ❌ **Startup Energy:** Evite cores neon, emojis excessivos ou ilustrações cartunescas.
- ❌ **Mechanical Symmetry:** Não force grades perfeitas se o fluxo operacional pedir assimetria natural.

---

## 9. COMPOSIÇÃO DE TELA PADRÃO
1. **Header:** Título grande (32px), Eyebrow Gold, Subtítulo Soft.
2. **Hero:** O dado mais importante em um card de destaque com glow suave.
3. **Context:** Lista de itens usando `ListItem` (16px spacing entre itens).
4. **Action:** FAB circular ou Barra de Ações Fixa na base.

---
**AFERIX DESIGN AUTHORITY**
*Qualquer alteração visual que viole estas regras será considerada uma regressão técnica.*
