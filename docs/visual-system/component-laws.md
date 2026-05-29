# AFERIX COMPONENT LAWS — THE ARCHITECTURAL PATTERNS
**Status: MANDATORY | Focus: ANATOMY**

## 1. CARDS (AFERIX OBJECTS)
- **Base:** Sempre herdar de `SurfaceCard`.
- **Fundo:** `var(--surface-gradient)`.
- **Radius:** `24px` (`var(--radius-card)`).
- **Padding:** `24px` no mobile, `32px` no desktop.
- **Interação:** Adicione `transition-all duration-300` e `active:scale-[0.98]`.

## 2. INPUTS (EMBEDDED FIELDS)
- **Fundo:** `var(--bg-surface-glass)`.
- **Borda:** `var(--border-subtle)`.
- **Focus:** `border-color: var(--accent-gold)`.
- **Typography:** Pesos Medium ou Semibold (600).
- **Radius:** `16px` (`var(--radius-button)`).
- **Altura Mínima:** `48px`.

## 3. BOTÕES (TACTILE ACTIONS)
- **Primário:** `var(--accent-gold)` com texto preto e `var(--shadow-button)`.
- **Secundário:** `var(--bg-surface-glass)` com borda `var(--border-soft)`.
- **Raio:** `16px` para botões padrão, circular para FABs.
- **Comportamento:** Sombras sutis e luz suave. Sem o efeito "ripple" do Android antigo.

## 4. MODAIS E BOTTOM SHEETS
- **Transparência:** `bg-surface/95` com `backdrop-blur-xl`.
- **Radius Superior:** `32px` (`var(--radius-modal)`).
- **Padding:** Generoso. O conteúdo não deve tocar as bordas.

## 5. LISTAS E TABELAS
- **Regra:** Tabelas tradicionais são proibidas. Use `ListItem`.
- **Hierarchy:** Headline -> Descrição Soft -> Valor tabular-nums.
- **Gaps:** Use `8px` entre itens na mesma categoria, `16px` entre blocos.
