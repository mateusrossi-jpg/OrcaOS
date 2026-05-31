# AFERIX DESIGN SYSTEM: SURFACES

As superfícies definem a profundidade da interface. O Aferix usa o princípio "Glass & Translucency" para evitar a estética pesada de caixas cinzas de sistemas legados.

## 1. SurfaceCard (O Bloco Protagonista)
Usado para envolver grandes pedaços de informação (Hoje, Pendências, Resultados).
- **Estilo Base:** `bg-white/[0.03] border border-white/[0.05]`
- **Bordas:** `rounded-[20px]`
- **Padding Interno:** `p-5`
- **Interativo:** Se o card for clicável inteiro, adicionar `cursor-pointer active:bg-white/[0.05] transition-colors`

## 2. SurfaceListContainer
Quando um card contém múltiplas linhas clicáveis.
- **Estilo Base:** `bg-white/[0.03] border border-white/[0.05]`
- **Bordas:** `rounded-[20px] overflow-hidden` (Garante que o hover dos filhos não vaze as bordas)
- **Padding:** Nenhum padding global (`p-0`), o padding pertence às linhas.

## 3. SurfaceFloating (O Dock)
Usado para barras que flutuam sobre o conteúdo, garantindo contexto e navegação rápida.
- **Estilo Base:** `bg-[#0B0B0C]/90 backdrop-blur-xl border-t border-white/[0.03]`
- **Sombra/Elevação:** Não usa box-shadow pesado, depende do desfoque (`backdrop-blur-xl`) e da borda translúcida para separar do fundo.

## 4. SurfaceIconAction (Ícones Clicáveis)
Usado nos botões flutuantes ou dock actions.
- **Estilo Base:** `w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.05]`
- **Comportamento:** Englobado por um botão `group` com `group-active:scale-95 transition-transform`.
