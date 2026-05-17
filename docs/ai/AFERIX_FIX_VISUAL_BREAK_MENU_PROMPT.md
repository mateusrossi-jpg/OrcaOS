# FIX: Quebra Visual e Refinamento do Menu Hub (Aferix)

O Aferix passou por uma simplificação radical na navegação (11 itens -> 4 eixos). 
O novo Menu Hub (`MenuScreen.tsx`) precisa de refinamento visual para manter a identidade Dark Premium sem quebras de layout no mobile e desktop.

## Diagnóstico
- [ ] O Grid de menu pode quebrar em telas muito pequenas (abaixo de 360px).
- [ ] O contraste das linhas simples de menu (`simple-menu-row`) precisa ser ajustado para profundidade.
- [ ] A transição entre abas secundárias no Menu deve ser suave.

## Tarefas de Correção
1. **Grid Responsivo:** Ajustar `.menu-grid` para `grid-template-columns: repeat(2, 1fr)` fixo em mobile e `repeat(auto-fill, minmax(160px, 1fr))` em desktop.
2. **Estética Premium:**
   - Adicionar `backdrop-filter: blur(8px)` aos cards de menu.
   - Refinar bordas e hover states com `var(--aferix-primary)`.
3. **Menu Simples:** Melhorar o espaçamento interno e o alinhamento dos ícones/setas.

## Código Alvo
- `src/app/screens/MenuScreen.tsx`
- `src/styles/aferixTheme.css`

## Instrução para a IA
Aplique as correções visuais acima focando em estabilidade e estética premium. Garanta que o menu não transborde e que os cards tenham altura consistente.
