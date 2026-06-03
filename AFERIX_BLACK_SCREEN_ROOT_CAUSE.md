# AFERIX BLACK SCREEN ROOT CAUSE
**Date:** 2026-06-03
**Status:** SOLVED

## Diagnóstico da Tela Preta (Black Screen)

### 1. Causa Raiz: Routing Inexistente (Unhandled activeTab)
A arquitetura do `App.tsx` utiliza renderização condicional baseada na variável de estado `activeTab` (ex: `{activeTab === 'dashboard' && <HomeScreen />}`). Se o sistema tentar navegar para uma rota não declarada explicitamente nesta lista de condições, nenhum componente renderiza.

### 2. Efeito Cascata: Ausência de Background e AppHeader
As cascas de perfil (ex: `SoloShell` em `RoleShells.tsx`) apenas estruturam o layout (Dock inferior e Container principal). Toda a interface gráfica, incluindo a cor de fundo `bg-[var(--bg-primary)]` definida no `ScreenContainer` e o `AppHeader`, é injetada pelos componentes "filhos" (as telas). 
Quando uma rota falha em dar match:
- O `children` passado para a Shell se torna vazio (`null`).
- Como consequência, a página fica sem background explícito e sem cabeçalho, resultando num vazio absoluto (a tela preta) acima do Dock de navegação.

### 3. Fatores Contribuintes
- Mudança ou persistência de abas obsoletas no `localStorage` após a evolução das Fases.
- Uso de perfis corporativos que direcionavam para abas ainda não totalmente implementadas ou com dependências que falhavam silenciosamente.

## Solução Implementada (AFERIX EMERGENCY SOLO RECOVERY)

1. **Forçar Perfil SOLO (Fase 1 e 2):**
   - O hook `useRole.ts` foi bloqueado para ignorar perfis corporativos experimentais e forçar permanentemente a persona `SOLO` na montagem (`AuthService.impersonateRole('SOLO')`).

2. **Aferix Guard (Fase 3 - Fallback de Segurança):**
   - Injetamos um validador de rotas diretamente dentro do `Suspense` em `App.tsx`. 
   - Se o `activeTab` solicitado não estiver na lista de `VALID_TABS`, o sistema agora cancela a renderização do vazio e força imediatamente um redirecionamento (`goTo('dashboard')`), salvando o operador da tela preta.
