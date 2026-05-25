# Relatório de Consolidação da SSOT do Orçamento (Budget)

## Objetivo
Criar uma Única Fonte de Verdade (SSOT) para a entidade `Budget` e remover ambiguidades, aliases legados e duplicações.

## Ações Realizadas (Fase 2)
1. **Unificação do Arquivo Oficial:** O arquivo `src/domain/budget.ts` foi expandido e agora é a **Única Fonte de Verdade** (SSOT) para as tipagens de orçamento no Aferix.
2. **Eliminação de Duplicidades em `core/types/business.ts`:**
   - Removidos: `BudgetItem`, `CoreBudgetStatus`, `LegacyBudgetStatus`, `BudgetStatus`, e `Budget`.
   - Adicionado import direto no topo de `business.ts` puxando as definições oficiais de `domain/budget.ts`.
3. **Consolidação de Tipos de Status:**
   - O objeto `BUDGET_STATUS` agora contém `EM_REVISAO` e `EM_EXECUCAO`, alinhados perfeitamente com os arrays antigos de validação.
   - Foram mantidos os status legados sob a tipagem `LegacyBudgetStatus` apenas para fins de mappers nas bordas (banco/dados antigos).
4. **Propriedades Opcionais de Migração:** Aliases de tipagem como `discount` vs `discounts`, e `taxRate` vs `aliquota_imposto` foram explicitamente anotados com `// alias` e `// legacy alias` dentro da interface principal para futura remoção no Eradication Roadmap.

## Resultado
- **1 Único `Budget` oficial** em toda a aplicação.
- **1 Único `BudgetStatus` oficial** unindo as camadas.
- Eliminação total de divergências de *typing* (menos necessidade de casts de escape).
