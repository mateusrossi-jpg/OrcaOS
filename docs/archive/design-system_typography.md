# AFERIX DESIGN SYSTEM: TYPOGRAPHY

A tipografia do Aferix não usa múltiplos tamanhos arbitrários. Ela foi desenhada para leitura escaneável de 1 segundo ("Glanceable"), focando em números gigantes e labels sutis.

## 1. Value Displays (Display)
Usados para responder "O que importa aqui?"
- **Display Hero:** `text-[28px] font-semibold tracking-tight leading-none` (Ex: R$ 18.420 faturado)
- **Display Medium:** `text-[26px] font-semibold tracking-tight mb-0.5` (Ex: 14:30)
- **Display Small:** `text-[20px] font-medium tracking-tight` (Ex: Bom dia, Mateus)

## 2. Body & Content
- **Body Strong:** `text-[15px] font-medium` (Ex: Título da obra, valor destacado em linha)
- **Body Base:** `text-[15px]` (Ex: Label de uma linha de lista)
- **Body Small:** `text-[14px]` (Raramente usado, geralmente com font-medium para ênfase)
- **Caption:** `text-[13px]` (Sub-labels, descritores de local)

## 3. Structural Labels (Labels)
Esta tipografia carrega a arquitetura da tela. Nunca deve gritar.
- **Section Label:** `text-[11px] uppercase tracking-widest font-semibold ml-1 text-white/40` (Ex: 1. HOJE, 2. PENDÊNCIAS)
- **Action Label:** `text-[11px] font-medium tracking-wide` (Ex: Textos dos botões do Menu)

## 4. Typography Rules
- **Tracking Tight:** Sempre aplique `tracking-tight` em displays acima de 20px para agrupar visualmente o valor.
- **Tracking Widest:** Sempre aplique `tracking-widest` em labels de seção UPPERCASE (11px).
- **Font Weights:** Use apenas `font-medium` e `font-semibold`. Evite `font-bold` extremo ou `font-light` ilegível.
