# AFERIX_SOLO_PROPOSALS_IMPLEMENTATION_PLAN
MISSÃO: Restaurar a visibilidade do módulo de Propostas para o perfil SOLO.

## 1. Arquivos Afetados
* `src/features/workspace/components/RoleShells.tsx`: Definição das abas do Dock para o perfil SOLO.
* `src/app/App.tsx`: Verificação de roteamento e permissões de exibição.

## 2. Componentes Afetados
* `SoloShell`: Componente que encapsula a navegação do operador autônomo.
* `OperationalDock`: Componente visual que renderiza as abas inferiores.

## 3. Alterações Necessárias

### A. src/features/workspace/components/RoleShells.tsx
* Adicionar a aba `budgets` ao array de `tabs` dentro da função `SoloShell`.
* Utilizar o ícone `Target` (padrão do sistema para Propostas).
* Rótulo: `PROPOSTAS`.

### B. src/app/App.tsx
* Validar se o mapeamento de `activeTab === 'budgets'` já renderiza corretamente o `BudgetsScreen` para o perfil SOLO (Evidência preliminar indica que sim, pois o switch de abas é global).

## 4. Riscos Identificados
* **Densidade do Dock:** Ao adicionar a 6ª aba (Meu Negócio, Agenda, Propostas, Financeiro, Clientes, Menu), o Dock pode apresentar compressão visual em dispositivos com telas muito pequenas (iPhone SE, etc.).
* **Sobreposição de Ações:** Garantir que o botão de "Novo Orçamento" na Home e a nova aba no Dock não gerem confusão de fluxo, mas sim caminhos complementares (Criação vs. Gestão).

## 5. Estimativa de Implementação
* **Esforço:** Baixo (Surgical Edit).
* **Tempo:** ~15 minutos.
* **Complexidade:** 1/10.

## 6. Próximos Passos (Pós-Aprovação)
1. Editar `RoleShells.tsx`.
2. Verificar renderização em modo SOLO.
3. Validar se a lista de propostas carrega os dados reais do banco local.

---
*Plano de Engenharia - Gemini CLI*
