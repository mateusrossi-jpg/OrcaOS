# AFERIX — FUTURE WORKSPACE ARCHITECTURE DIRECTIVE

## Contexto

O Aferix atual está focado no lançamento do MVP para:
* Prestadores de serviço
* Autônomos
* Clientes
* Orçamentos
* Financeiro
* Relatórios
* Atendimento

O MVP **NÃO** deve implementar neste momento:
* Equipes
* Colaboradores
* Permissões avançadas
* Gestão corporativa
* CRM complexo
* Auditoria avançada

O objetivo primário continua sendo lançar um MVP simples, estável e comercializável. Contudo, é mandatório garantir que o produto possa evoluir para uma plataforma de equipes (multi-tenant) no futuro sem a necessidade de reescrever toda a base de código.

---

## Visão Estratégica de Longo Prazo

O Aferix deverá evoluir futuramente para uma plataforma unificada baseada em **Workspaces**.

Estrutura conceitual futura:
```text
Workspace
├── Users
├── Clients
├── Service Orders
├── Budgets
├── Financial
├── Reports
├── Schedule
├── Audit
└── Settings
```

---

## Perfis Futuros

A arquitetura deve permitir, em momento oportuno, os seguintes perfis, sem que isso force a reescrita do motor principal:
```text
- Owner
- Administrator
- Manager
- Field Technician
- Sales
- Financial
- Viewer
```

---

## Regra Arquitetural Obrigatória

**Toda entidade criada a partir de hoje deve ser projetada considerando que futuramente poderá pertencer a um Workspace.**

Exemplos de entidades:
- `Client`
- `Budget`
- `ServiceOrder`
- `Report`
- `FinancialRecord`
- `ScheduleItem`

**Nota Importante:** Não é para implementar Workspace agora. O MVP ainda é voltado ao autônomo individual. A regra é apenas **evitar decisões arquiteturais que impeçam a introdução fluida dessa camada de Workspace futuramente.**

### Princípios Permanentes de Modelagem
1. **Evitar Acoplamento ao User.ID:** As entidades não devem depender exclusivamente do `userId` diretamente misturado à lógica de domínio para isolamento. O isolamento lógico de banco deverá considerar o pareamento `(workspaceId, id)`.
2. **Separação de Contextos:** Lógica de negócio não deve assumir que há apenas "1 usuário ativo = 1 dono dos dados". 
3. **Escalabilidade Mútua:** Dados globais (ex: catálogo de materiais) poderão ser compartilhados no Workspace, enquanto dados pessoais pertencerão a um usuário.

---

## Regra para Auditoria de Código

Ao revisar, projetar ou implementar qualquer funcionalidade nova, a IA ou engenheiro responsável **deve** responder mentalmente a este checklist:

1. [ ] Esta implementação impede Workspaces futuros?
2. [ ] Esta implementação acopla a posse dos dados diretamente e unicamente ao usuário atual em vez de um contexto organizacional isolável?
3. [ ] Esta implementação exigirá refatoração estrutural massiva no futuro?
4. [ ] Esta implementação continua compatível com uma futura estrutura multiusuário?

Se a resposta indicar risco arquitetural de acoplamento irreversível ou custoso, registre a observação antes de comitar a mudança.

---

## Roadmap Conceitual

### Fase 1 — MVP (Foco Atual)
* Autônomo
* Clientes
* Orçamentos
* Financeiro
* Relatórios

### Fase 2 — Pequenas Equipes
* Workspace
* Usuários
* Permissões básicas

### Fase 3 — Operação de Campo
* Ordens de Serviço
* Técnicos
* Agenda

### Fase 4 — Auditoria
* Fotos
* Checklists
* Assinaturas
* Evidências

### Fase 5 — Comercial
* Leads
* Metas
* Pipeline

---

## Análise do Código Atual e Recomendações

Observando a base de dados em `src/domain/client.ts`, `src/domain/budget.ts` e `src/domain/operationalEvent.ts`, nota-se o seguinte:

- **Isolamento Atual:** As entidades estão globais. Não há o campo explícito de isolamento (`workspaceId`, `tenantId`, ou mesmo `userId` no esquema de Client/Budget local). O isolamento atual depende puramente do banco de dados estar no dispositivo (offline-first, IndexedDB) e a posterior sincronização (via Supabase RLS acoplada ao `auth.uid()`).
- **Ajuste Futuro Necessário:** Quando a Fase 2 for engatilhada, será necessário enriquecer o Supabase (e os payloads locais) com um `workspace_id`.
- **Recomendação Atual para Evitar Retrabalho:** 
  1. Nos repositórios locais (Dexie), não refatore agora as consultas para exigir `workspaceId`, mas garanta que toda requisição de sync passe por uma Factory ou Facade (`SyncService` / `EventStore`). Quando mudarmos para Workspace, apenas esse Facade adicionará o cabeçalho/contexto de Workspace, blindando os componentes de React dessa complexidade.
  2. Qualquer lógica de Autorização (authz) não deve existir solta dentro de componentes React. Se houver alguma checagem de "Dono" do dado, isso deve ser empurrado para o Service Layer.

Esta diretriz entra em vigor imediatamente e **congela** qualquer decisão que adicione acoplamento forte 1:1 entre Usuário e Entidade.
