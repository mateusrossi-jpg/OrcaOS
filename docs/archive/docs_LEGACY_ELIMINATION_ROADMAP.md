# Roadmap de Eliminação do Legado (Fase 8)

## 1. Catálogo de Resíduos e Classificação

| Resíduo | Localização | Classificação | Ação Recomendada |
| :--- | :--- | :--- | :--- |
| Prefixo `orcaos:` | `localStorage` (Keys) | **Precisa manter** | Manter até que 100% dos usuários migrem para a arquitetura Dexie. |
| Campos Híbridos (ex: `total_servicos`) | `domain/budget.ts` | **Pode migrar** | Remover da interface principal e manter apenas em mappers de importação. |
| `LegacyBudgetMigrationService` | `services/` | **Precisa manter** | Essencial para o primeiro boot de usuários antigos. |
| `savedBudgetsStorage.ts` | `features/budgets/storage/` | **Pode remover em breve** | Mover lógica para dentro do serviço de migração e deletar o arquivo de storage. |
| Status `draft`, `sent`, etc. | `domain/budget.ts` | **Pode migrar** | Converter integralmente para os novos status no momento da carga. |
| Comentários `// LEGACY` | Diversos arquivos | **Remover agora** | Limpar comentários de "todo" que já foram resolvidos. |

## 2. Roadmap de Execução

### Etapa 1: Limpeza Imediata (Sprint Atual)
- [ ] Mover `mapToNewBudget` do `savedBudgetsStorage.ts` para um utilitário de migração isolado.
- [ ] Remover campos legados (`aliquota_imposto`, etc.) da interface `Budget` principal, movendo-os para uma interface `LegacyBudget` usada apenas na migração.
- [ ] Padronizar todos os `localStorage.getItem` para usar um wrapper `SafeStorage` que logue acessos legados.

### Etapa 2: Consolidação (Próximo Mês)
- [ ] Implementar a remoção automática do `localStorage` após migração bem-sucedida para Dexie (limpeza de disco).
- [ ] Substituir o prefixo `orcaos:` por `aferix:` em novas configurações que não dependam de dados históricos.

### Etapa 3: Depreciação Total (Q3 2026)
- [ ] Remover `LegacyBudgetMigrationService`.
- [ ] Tornar a Dexie o único mecanismo de persistência suportado.

## 3. Conclusão
A transição para o Aferix está 90% completa do ponto de vista técnico, mas o "fantasma" do OrcaOS ainda reside nas chaves do `localStorage` e nos nomes de campos. A manutenção desses resíduos é um mal necessário para a compatibilidade, mas deve ser isolada em camadas de adaptação.
