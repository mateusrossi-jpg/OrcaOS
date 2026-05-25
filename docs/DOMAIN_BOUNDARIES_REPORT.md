# Relatório de Limites de Domínio (Boundaries)

## Dependências Atuais e Acoplamento de Features

Durante a auditoria, identificamos que as *features* estão se comunicando rompendo os limites arquiteturais, injetando dependências diretas de storage de outras *features*.

### Mapeamento Atual:
1. **clientPortal** -> Importa `settings/storage/professionalProfileStorage`
2. **reports** -> Importa `finance/storage/simpleFinanceStorage`
3. **reports** -> Importa `settings/storage/professionalProfileStorage`
4. **reports** -> Importa `settings/components/ProfessionalIdentityCard`
5. **settings** -> Importa `budgets/storage/businessProfileStorage`
6. **settings** -> Importa `budgets/budgetTemplatesVisual`

## Classificação do Acoplamento

### 🔴 Dependências Proibidas (Violação Crítica)
- `reports` lendo diretamente do banco de dados/storage de `finance` (`simpleFinanceStorage`).
- `clientPortal` e `reports` lendo diretamente de storages de `settings`.
- `settings` manipulando `businessProfileStorage` que pertence a `budgets`.
*Motivo:* Se o modelo de storage do financeiro mudar (ex: migração de localStorage para Dexie), o módulo de relatórios quebrará silenciosamente.

### 🟡 Dependências Perigosas
- `reports` importando componentes de UI de `settings` (`ProfessionalIdentityCard`).
*Motivo:* UI deve ser agnóstica ou receber dados via *props* (DTOs). Componentes engessam a feature e criam *spaghetti code*.

### 🟢 Dependências Aceitáveis
- Compartilhamento via `core/` (como `core/types` ou `core/pricing`).
- Adaptadores (`core/adapters/`) que orquestram a comunicação.
- Passagem de dados via *props* no nível de página (`App.tsx` ou Router injetando DTOs).

## Proposta de Resolução
Implementar o padrão de **Facades** ou **Event Bus** (se necessário, mas evitado pelo guideline anti-overengineering) ou injetar um **Serviço de Agregação** na raiz e passar apenas DTOs para os *Workspaces*.

**Regra a aplicar via ESLint futuramente:**
Nenhuma pasta dentro de `features/*` pode importar de `features/<outra_feature>`. Toda comunicação deve ser abstraída para o `core` ou para o componente orquestrador (`app/`).
