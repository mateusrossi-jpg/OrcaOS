# Relatório de Boundaries de Domínio (Fase 6)

## 1. Mapa de Dependências Cruzadas (Violações)

As seguintes dependências cruzadas entre "features" foram detectadas e violam o isolamento de domínio:

| Origem (Feature) | Destino (Feature/Storage) | Tipo de Acoplamento | Risco |
| :--- | :--- | :--- | :--- |
| `reports` | `finance/storage` | Import direto de Storage | **Alto**. Reports depende da implementação interna de Finance. |
| `reports` | `settings/storage` | Import direto de Storage | Médio. Acesso a perfil profissional. |
| `reports` | `settings/components` | Import de Componente UI | Baixo. Reuso de UI. |
| `clientPortal` | `settings/storage` | Import direto de Storage | Médio. |
| `settings` | `budgets/storage` | Import direto de Storage | **Alto**. Settings manipulando dados de Budget diretamente. |
| `settings` | `budgets/logic` | Import de constante visual | Baixo. |
| `finance` | `hooks/useBudgetHistory` | Dependência de Hook Global | Médio. |

## 2. Violações Proibidas Confirmadas
- **UI -> Repositories diretos**: Não detectado (conforme Fase 1).
- **Features -> Storage interno de outra feature**: **DETECTADO EXPLICITAMENTE** em múltiplos locais (ex: `reports` acessando `simpleFinanceStorage`).
- **Finance -> Storage Budgets**: Detectado indiretamente via `useBudgetHistory` no `SimpleFinanceWorkspace`.

## 3. Estratégia de Mitigação
- **Fachadas (Facades)**: Criar Services globais (ex: `ProfileService`, `FinanceService`) que exponham apenas o necessário, impedindo que `reports` importe `src/features/finance/storage/*`.
- **DTOs**: Definir interfaces de transferência de dados no `src/core/types` ou `src/domain` para que as features não troquem entidades internas brutas.
- **Inversão de Dependência**: O componente de `Reports` deve receber os dados necessários via Props ou via um Hook de Service, nunca importando a persistência de outra feature.

## 4. Próximos Passos
Consolidar os Storages espalhados em Repositories reais e Services, forçando o uso desses Services via ESLint (já iniciado na Fase 2).
