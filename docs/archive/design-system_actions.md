# AFERIX DESIGN SYSTEM: ACTIONS

Os botões e ações no Aferix são minimalistas. A hierarquia de uma ação deve ser óbvia instantaneamente, mas nunca barulhenta.

## 1. Primary Action (O Foco Absoluto)
Gera uma ação de negócio principal (INICIAR, FINALIZAR).
- **Background:** `bg-white` (Preto no branco para máximo contraste no tema dark).
- **Texto:** `text-black font-semibold text-[13px]`
- **Dimensões:** `h-10 px-4 rounded-[12px]`
- **Exemplo:** `[ INICIAR ]`

## 2. List Action (Clickable Row)
Toda linha do `SurfaceListContainer` atua como um GhostButton que carrega a navegação profunda.
- **Background:** Translúcido absoluto.
- **Hover/Active State:** `hover:bg-white/[0.02] cursor-pointer`
- **Padding:** `p-4`
- **Bottom Border:** Opcionalmente `border-b border-white/[0.02]` se houver mais linhas, exceto a última.

## 3. Quick Action Button (O Menu)
Usado nas ações perenes no rodapé.
- **Estrutura:** Um container mãe (`group`) envolvendo um Ícone e um Label.
- **Label:** `text-[11px] font-medium text-white/50 tracking-wide`
- **Icon Container:** `w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05]`
- **Interação:** `group-active:scale-95 transition-transform` (Redução elástica agradável, física).

## 4. Regras de Ação
- Nunca crie "Secondary Buttons" cinzas ou azuis opacos, se não é primário, provavelmente é uma ação de texto sutil ou Ghost.
- Toda área clicável deve possuir feedback tátil via `active:scale-95` ou `active:bg-white/[0.05]`. Sem feedback = UI quebrada.
