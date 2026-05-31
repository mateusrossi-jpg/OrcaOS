# AFERIX DESIGN SYSTEM: NAVIGATION

A navegação no Aferix nunca "rouba" espaço vertical, ela enquadra o conteúdo principal.

## 1. TopBar Context (Header)
O cabeçalho não tem logo gigante nem barras estruturais densas.
- **Estrutura:** `flex flex-col`
- **Label de Contexto:** `text-[11px] text-white/40 uppercase tracking-widest font-semibold`
- **Title (Onde estou):** `text-[20px] font-medium text-white/90 tracking-tight`
- **Comportamento:** Mantém contexto, não se move, não possui background opaco, funde-se perfeitamente com o fundo da página.

## 2. QuickActionDock (Bottom Navigation)
Substitui a clássica Bottom Tab Bar por um dock centralizado.
- **Wrapper:** `w-full bg-[#0B0B0C]/90 backdrop-blur-xl pt-3 pb-6 px-4 border-t border-white/[0.03] sticky bottom-0 z-50`
- **Layout:** `flex items-center justify-around gap-2`
- **Conteúdo:** Ícones vitais da operação (Orçamento, OS, Cliente).

## 3. Hierarchy Drill-Down (Navegação Profunda)
Quando o usuário vai de Home → Módulo.
- Toda "Pendência" em um painel `SurfaceListContainer` é uma porta de entrada para um Drill-Down.
- O clique no container completo (ListAction) carrega a próxima rota. Sem setas agressivas. Apenas expectativa natural.
