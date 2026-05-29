# AFERIX VISUAL LINT RULES — THE TECHNICAL VALIDATOR
**Status: MANDATORY | Focus: ENFORCEMENT**

## 1. BANIMENTO DE VALORES HARDCODED
É terminantemente proibido o uso de valores fixos para:
- `color` (Use `var(--text-*)` ou `var(--accent-*)`)
- `background` (Use `var(--bg-*)` ou `var(--surface-*)`)
- `border-radius` (Use `var(--radius-*)`)
- `padding` / `margin` (Use `var(--spacing-*)` ou `var(--sz-*)`)

## 2. PROIBIÇÃO DE ESTILOS INLINE
Atributos `style={{ ... }}` em componentes React devem ser evitados ao máximo. Use classes utilitárias baseadas em Tailwind que consomem o Design System.
- **Exceção:** Cálculos dinâmicos de largura/posicionamento (ex: Sparklines, Progress bars).

## 3. AS CORES "MALDITAS" (DO NOT USE)
- **#000000 / black:** Cria um visual "morto". Use `var(--bg-primary)`.
- **#FFFFFF / white:** Muito agressivo. Use `var(--text-primary)`.
- **Shadows pretas fortes:** Use `var(--shadow-soft)`.

## 4. CONVENÇÃO DE CLASSES (CN UTILITY)
Sempre utilize a utilidade `cn()` para compor classes.
- **Correto:** `className={cn("bg-surface", featured && "glow-gold")}`
- **Errado:** `className={`bg-surface ${featured ? "glow-gold" : ""}`}`

## 5. LINTING CHECKLIST
Antes de salvar qualquer arquivo CSS ou TSX:
1. [ ] Removi todos os `oklch(...)` ou `rgba(...)` locais?
2. [ ] Substituí por variáveis do `design-system.css`?
3. [ ] O border-radius é pelo menos `16px`?
4. [ ] Existe algum `border: 1px solid black`? (Se sim, remova).
5. [ ] Verifiquei se o componente está herdando a tipografia do sistema?
