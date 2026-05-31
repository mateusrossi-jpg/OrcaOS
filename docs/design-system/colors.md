# AFERIX DESIGN SYSTEM: COLORS & SPACING

Este sistema de tokens de cores e espaçamento foi extraído exclusivamente da Home Oficial Aprovada (V24). É estritamente proibido criar novas cores absolutas ou HEX arbitrários nas interfaces do Aferix.

## 1. Global Background
O fundo absoluto do aplicativo que dita o tom premium e repousante.
- **App Background:** `bg-[#0B0B0C]`

## 2. Text Colors
A hierarquia de leitura se baseia primariamente em opacidade do branco, não em cinzas hardcoded.
- **Value / Highlight:** `text-white` (Valores numéricos, dados críticos)
- **Primary Text:** `text-white/90` (Nomes, títulos de agenda, saudação)
- **Secondary Text:** `text-white/80` (Itens de lista, rótulos de métricas)
- **Muted Text 1:** `text-white/50` (Descritores, metadados)
- **Muted Text 2:** `text-white/40` (Labels arquiteturais, dias da semana, fallbacks)
- **Faint Text:** `text-white/30` (Ações inativas ou secundárias)

## 3. Surface & Border
Os cards e superfícies não usam cinzas opacos. Usam branco translúcido para reagir ao fundo.
- **Surface Primary:** `bg-white/[0.03]`
- **Border Primary:** `border-white/[0.05]`
- **Surface Hover:** `hover:bg-white/[0.02]` (Utilizado para listas dentro de cards)
- **Surface Active/Click:** `active:bg-white/[0.05] transition-colors`

## 4. Semantic Colors
- **Accent (Atenção/Blockers):** `text-accent-gold` (Cor ouro, pré-definida globalmente)
- **Success (Metas/Progresso):** `text-emerald-400`
- **Danger (Dinheiro Travado):** `text-[#F87171]` (Red)

## 5. Spacing System
O espaçamento extraído da Home dita o ritmo "Executive Panel" sem scroll:
- **space-0.5:** `2px` (Distância íntima entre valor e subtítulo)
- **space-1:** `4px` (Margens pequenas de ícones)
- **space-2:** `8px` (Gap entre título de seção e bloco)
- **space-3:** `12px`
- **space-4:** `16px` (Padding horizontal das linhas de lista)
- **space-5:** `20px` (Padding interno dos blocos SurfaceCard)
- **space-6:** `24px` (Gap principal entre blocos de informação)

## 6. Radius System
O arredondamento premium evita cantos vivos e "esquinas de ERP".
- **radius-md:** `rounded-[12px]` (Botões de ação primária)
- **radius-lg:** `rounded-[20px]` (SurfaceCard, listas arredondadas)
- **radius-full:** `rounded-full` (Dock buttons, avatares)
