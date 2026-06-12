# AFERIX ROLE HARDENING AUDIT
**Data da Auditoria:** 02 de Junho de 2026
**Status do Projeto:** UX Execution Mode (Final Polish)

---

## 1. OBJETIVO DA AUDITORIA E EXECUÇÃO
Transformar a arquitetura de acesso e visibilidade atual baseada no modelo `OWNER, MANAGER, SALES, FIELD, CUSTOMER` num modelo fortificado e expandido com o papel `SOLO`. O objetivo é garantir um confinamento estrito de funcionalidades, prevenindo vazamentos de interface, além de introduzir uma experiência simplificada para prestadores independentes.

---

## 2. AUDITORIA DAS PERMISSÕES (MATRIZ FINAL)
A estrutura interna `AferixRole` foi atualizada de 5 para 6 perfis base. As features foram remapeadas estritamente no `RoleFeatureMatrix`:

| Perfil | Acesso Permitido | Acesso Bloqueado (UX Guarded) |
| :--- | :--- | :--- |
| **FIELD** | Agenda, Checklist, Ativos (vinculados), Assinaturas | Faturamento, Clientes (Global), Estoque (Global), Contratos, Equipe, Propostas (Drafting), Dashboard Executivo |
| **SALES** | Pipeline, Revenue Inbox, Propostas, Clientes | Configurações Críticas, Equipe, Fluxo Financeiro, Dispatch Operacional, Roteirização |
| **MANAGER** | Agenda, Dispatch, Operações (Triagem), Equipe, Contratos (SLA), Relatórios | Licenças, Faturamento Executivo, Cobrança, Assinaturas de Segurança (Cloud/Backup) |
| **OWNER** | **Acesso Total** | - |
| **CUSTOMER**| Portal, Laudos, Propostas (Aprovação), Contratos | Toda a parte de retaguarda técnica e financeira do sistema |
| **SOLO** *(Novo)*| **Acesso Total (UX Simplificada)**. Une Field + Owner. | Dashboard desenhado focado em "Meu Negócio". Sem separação hierárquica visível na UI. |

---

## 3. AUDITORIA DOS ROLESHELLS E ROTAS

O roteamento e as cascas (`RoleShells.tsx` e `App.tsx`) foram totalmente refatorados para espelhar a Matriz de Permissões:

### Rotas Ativas por Perfil
- **FIELD:** 
  - Execução (`/base`)
  - Ativos (`/assets`)
  - Laudos (`/diagnostics`)
  - Ajustes
- **SALES:** 
  - Pipeline (`/pipeline`)
  - Anomalias (`/anomalies`)
  - Propostas (`/budgets`)
  - Clientes (`/clients`)
  - Ajustes
- **MANAGER:** 
  - Mapa (`/map`)
  - Dispatch (`/dispatch`)
  - Agenda (`/agenda`)
  - Equipe (`/team`)
  - Ajustes
- **OWNER:** 
  - Empresa (`/dashboard`)
  - Financeiro (`/money`)
  - Clientes (`/clients`)
  - Equipe (`/team`)
  - Ajustes
- **CUSTOMER:** 
  - Home (`/home`)
  - Laudos (`/reports`)
  - Propostas (`/budgets`)
  - Contratos (`/contracts`)
  - Ajustes
- **SOLO (Novo Perfil):** 
  - Meu Negócio (`/dashboard`)
  - Agenda/OS (`/agenda` / `/base`)
  - Financeiro (`/money`)
  - Clientes (`/clients`)
  - Ajustes

---

## 4. VAZAMENTOS ENCONTRADOS E CORREÇÕES EXECUTADAS

### Vazamento 1: MenuScreen (Configurações Gerais)
* **Status Anterior:** O `MenuScreen` carregava 100% dos links (Licença, Relatórios, Backup, Segurança) para TODOS os usuários, incluindo Técnicos e Comerciais.
* **Correção Executada:** Refatoração dinâmica no `MenuScreen.tsx`. O array `menuGroups` agora é gerado em tempo de execução via `useRole()`. 
  * Técnicos (FIELD) não enxergam mais **nada** operacional global, apenas o botão de logout.
  * Vendedores (SALES) e Gestores (MANAGER) enxergam apenas base de clientes e catálogo.
  * Gestores (MANAGER) têm acesso aos Relatórios, mas NÃO têm acesso a Licença, Assinatura e Backup na nuvem.
  * Apenas OWNER e SOLO veem os quadros de Licença, Proteção e Backup de forma integral.

### Vazamento 2: Ausência do perfil SOLO no Banco de Dados Local
* **Status Anterior:** O modelo de permissões no IndexedDB (`Dexie`) aceitava apenas os 5 perfis iniciais, impossibilitando autenticação de profissionais autônomos.
* **Correção Executada:** Atualização no Schema do `dexieDatabase.ts` (`version(27)`). A tabela `teamMembers` e a interface do TypeScript agora suportam a *role* `SOLO`.

### Vazamento 3: Seed Account (Ambiente de Teste para Autônomo)
* **Status Anterior:** Só havia o usuário `admin@aferix.com` no mock.
* **Correção Executada:** Atualizado o `AuthService.ts` para automaticamente popular uma conta `solo@aferix.com` no boot, permitindo testes nativos na nova UX do autônomo.

---

## 5. PENDÊNCIAS RESTANTES (P2 - Refinamento)

1. **Dashboard Unificado para o SOLO:** A rota `dashboard` atualmente aponta para o mesmo `HomeScreen` do OWNER. Para o perfil SOLO, a "Visão Executiva" pode ser ligeiramente pesada. Uma variação do card de "Equipe" deve ser oculta quando o usuário logado for `SOLO`.
2. **Rota 'agenda' do SOLO:** O `App.tsx` precisa tratar a navegação `/agenda` que também existe para o Manager. O SOLO deve focar em sua própria agenda e cair direto na visão `FieldWorkspace` (`/base`) ao clicar numa OS.
3. **Bloqueio de API (Backend):** Toda essa fortificação foi feita via Interface e Roteamento Local. Ao ativar o Supabase Auth em produção, é mandatório replicar essas mesmas travas via *Row Level Security (RLS)* no banco PostgreSQL.
