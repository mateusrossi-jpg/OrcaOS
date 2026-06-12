# AFERIX ERP PREMIUM — BLUEPRINT DE ARQUITETURA DA FASE 3
`STATUS: EXECUTÁVEL | UX EXECUTION MODE | CONGELADO`
`AUTORES: CTO, PRINCIPAL SOFTWARE ARCHITECT & PRODUCT ARCHITECT`

Este documento apresenta a especificação técnica e o plano executável de engenharia para a **Fase 3 — Segurança, Tenancy e Sincronização Bidirecional Distribuída (Down-Sync)** do Aferix ERP Premium. 

Seguindo as diretrizes da **Constituição Offline-First (Law #01)**, o sistema mantém o banco de dados local como autoridade primária de tempo de execução, delegando à nuvem o papel de consolidação, conciliação e replicação multiempresa em segundo plano.

---

## 1. ARQUITETURA DO DOWN-SYNC ENGINE (PULL INCREMENTAL)

O Down-Sync Engine é um motor de captura reativo, incremental e idempotente projetado para sincronizar em segundo plano as mutações globais do inquilino para o banco de dados local IndexedDB.

### A. Fluxo de Dados Bidirecional (Push / Pull)

O sincronismo opera em duas vias assíncronas independentes gerenciadas pelo `CloudSyncService.ts`:

```text
       +-----------------------+              +-----------------------+
       |   Dispositivo Local   |              |     Nuvem Supabase    |
       |     [IndexedDB]       |              |  [Tabelas + Triggers] |
       +-----------------------+              +-----------------------+
                   |                                      |
                   | ====== FLUXO 1: PUSH (EVENTOS) =====> |
                   | 1. Lê eventos 'pending'              |
                   | 2. Envia envelopes em ordem crono    |
                   |                                      |
                   | <--- 3. Ack com Sequence e ID ------ |
                   | 4. Atualiza local para 'synced'      |
                   |                                      |
                   | <==== FLUXO 2: PULL (ENVELOPES) ==== |
                   | 5. Solicita novos envelopes com:     |
                   |    last_synced_sequence > localSeq   |
                   |                                      |
                   | <--- 6. Retorna lote de envelopes --- |
                   | 7. Valida loop (ignora device_id)    |
                   | 8. Reconciliação LWW e descarte      |
                   | 9. Atualiza tabelas IndexedDB        |
                   | 10. Salva novo cursor de sequência   |
```

### B. Arquitetura em Camadas

A comunicação e a persistência dos dados seguem o modelo rígido de isolamento arquitetural:

```text
+-------------------------------------------------------------------------+
|                              DEVICE (UI)                                |
|        React UI Components  <-->  Operational hooks  <-->  Facade       |
+-------------------------------------------------------------------------+
                                    || (Leitura/Escrita)
                                    \/
+-------------------------------------------------------------------------+
|                               INDEXEDDB                                 |
|            Tabelas Agregadas Dexie (budgets, attendances, etc.)         |
|            Fila de Eventos Locais (operationalEvents)                   |
+-------------------------------------------------------------------------+
                                    || (Sync reativo em background)
                                    \/
+-------------------------------------------------------------------------+
|                           CLOUDSYNCSERVICE                              |
|   - Push: Envia operationalEvents pendentes na ordem rigorosa           |
|   - Pull: Consulta e processa envelopes Supabase baseados em sequência  |
|   - LWW Engine: Reconcilia conflitos e aplica snapshots remotos         |
+-------------------------------------------------------------------------+
                                    || (Conexão Segura WebSockets / HTTPS)
                                    \/
+-------------------------------------------------------------------------+
|                            SUPABASE CLOUD                               |
|   - Tabela 'sync_envelopes' (Audit Log Global base de auditoria)        |
|   - Postgres BIGSERIAL sequence (Garantia de ordem cronológica global)  |
|   - RLS (Row Level Security) protegendo dados contra vazamentos         |
+-------------------------------------------------------------------------+
```

### C. Cursor Incremental e Controle de Sequência

Para evitar problemas de dessincronização temporal causados por *clock drift* nos dispositivos dos técnicos em campo, o controle de ordenação é estritamente baseado no banco de dados na nuvem (Supabase):

1. **`sequence` (BIGSERIAL / Auto-incremental no Postgres):** Toda vez que um envelope de evento é inserido na tabela `sync_envelopes` no Supabase, o Postgres atribui um número sequencial único e monotonicamente crescente.
2. **`last_synced_sequence` (Cursor Local):** O dispositivo armazena na tabela local `settings` a chave `last_synced_sequence`, que indica o maior `sequence` que foi processado e persistido localmente com sucesso.

### D. Algoritmo de Execução do Pull (Incremental & Idempotente)

Implementado no `CloudSyncService.ts`, o motor de pull executa a seguinte lógica:

```typescript
export async function executePullEngine(supabaseClient: any, localDb: any): Promise<void> {
  // 1. Obter o cursor local
  const lastSeqRecord = await localDb.settings.get('last_synced_sequence');
  const lastSeq = lastSeqRecord ? (lastSeqRecord.value as number) : 0;
  
  // 2. Buscar lote incremental de envelopes do inquilino (companyId)
  const { data: envelopes, error } = await supabaseClient
    .from('sync_envelopes')
    .select('sequence, envelope_id, event_id, device_id, aggregate_type, aggregate_id, payload, timestamp')
    .gt('sequence', lastSeq)
    .order('sequence', { ascending: true })
    .limit(100);

  if (error || !envelopes || envelopes.length === 0) return;

  const currentDeviceId = typeof window !== 'undefined' 
    ? ((window as any).AFERIX_INSTALLATION_ID || 'browser') 
    : 'test-environment';

  // 3. Processamento sob transação isolada Dexie
  await localDb.transaction('rw', [
    localDb.budgets,
    localDb.attendances,
    localDb.workOrders,
    localDb.clients,
    localDb.operationalEvents,
    localDb.settings
  ], async () => {
    let maxSequenceProcessed = lastSeq;

    for (const env of envelopes) {
      // Regra de Idempotência e Prevenção de Loops (Echo Prevention)
      if (env.device_id === currentDeviceId) {
        // O evento foi gerado originalmente por este mesmo dispositivo e enviado via Push.
        // O local já está atualizado. Apenas avançamos o cursor sem reprocessar.
        maxSequenceProcessed = env.sequence;
        continue;
      }

      // Verificação Causal e Reconciliação LWW (Last-Write-Wins)
      const remoteTimestamp = new Date(env.timestamp).getTime();
      const targetTable = mapAggregateTypeToTable(env.aggregate_type);
      
      if (targetTable) {
        const localRecord = await localDb[targetTable].get(env.aggregate_id);
        
        // Se o registro local for mais novo e possuir syncStatus 'pending', ignoramos o pull
        // para preservar a alteração local que será enviada no próximo Push
        if (localRecord && 
            localRecord.syncStatus === 'pending' && 
            localRecord.updatedAt && 
            new Date(localRecord.updatedAt).getTime() > remoteTimestamp) {
          
          maxSequenceProcessed = env.sequence;
          continue;
        }

        // Aplica o snapshot remoto recebido no envelope (Idempotente via put)
        const snapshot = env.payload.snapshot;
        if (snapshot) {
          await localDb[targetTable].put({
            ...snapshot,
            id: env.aggregate_id,
            syncStatus: 'synced',
            syncUpdatedAt: Date.now()
          });
        }
      }

      // Adiciona o evento de conciliação concluída para auditoria local
      await localDb.operationalEvents.put({
        id: env.event_id,
        aggregateId: env.aggregate_id,
        aggregateType: env.aggregate_type,
        eventType: 'RECONCILIATION_COMPLETED',
        timestamp: env.timestamp,
        actor: env.payload.actor || 'system-sync',
        syncStatus: 'synced'
      });

      maxSequenceProcessed = env.sequence;
    }

    // Salvar o novo cursor de sequência
    await localDb.settings.put({
      key: 'last_synced_sequence',
      value: maxSequenceProcessed
    });
  });
}

function mapAggregateTypeToTable(aggregateType: string): string | null {
  const norm = aggregateType.toLowerCase();
  if (norm === 'attendance') return 'attendances';
  if (norm === 'budget') return 'budgets';
  if (norm === 'workorder') return 'workOrders';
  if (norm === 'client') return 'clients';
  return null;
}
```

### E. Resiliência a Falhas e Recuperação de Conexão
* **Aborto de Transação:** Em caso de perda de sinal de rede ou crash de hardware do dispositivo no meio do processamento do lote, a transação Dexie de gravação é abortada, revertendo todas as escritas locais. O cursor local (`last_synced_sequence`) **não avança**, fazendo com que o lote seja integralmente re-solicitado e reprocessado de forma segura no próximo ciclo de sincronização.
* **Idempotência Física:** A gravação das entidades utiliza a chave primária UUID estável criada originalmente no dispositivo de origem. A operação `.put()` do Dexie garante que reinserções de dados duplicados não criem duplicidades, apenas sobrescrevam as propriedades de maneira segura.

---

## 2. ESTRATÉGIA DE TENANCY (PARTICIONAMENTO LÓGICO)

Para evitar denormalização excessiva nos agregados locais — o que aumentaria desnecessariamente o consumo de armazenamento local e a complexidade das queries em campo —, dividimos as entidades em três níveis de tenancy baseados no ciclo de vida e propriedade dos dados.

### A. Entidades com `companyId` e `workspaceId` (Agregados Raiz)
Estas tabelas recebem indexação composta obrigatória tanto no IndexedDB quanto no Supabase PostgreSQL. O `companyId` define o inquilino corporativo (faturamento/SaaS) e o `workspaceId` define a filial, departamento ou centro regional de operação técnico-comercial.

* **`Attendance`:** Um atendimento técnico é agendado e executado por uma equipe vinculada a uma filial ou região (`workspaceId`) sob uma conta corporativa (`companyId`).
* **`Budget`:** Propostas comerciais e orçamentos financeiros pertencem a uma filial específica que contabiliza suas metas regionais.
* **`WorkOrder`:** As ordens de serviço operacionais são distribuídas de acordo com as filiais locais.
* **`Contract`:** Contratos de PMOC recorrentes vinculados à filial gestora do contrato.
* **`Client`:** Cadastro de clientes indexado por filial comercial, possibilitando isolamento de base para CRM regionalizado.

### B. Entidades Apenas com `companyId` (Global no Inquilino)
Estas entidades representam cadastros técnicos ou físicos que circulam livremente entre filiais da mesma corporação, evitando duplicação excessiva e isolamento desnecessário.

* **`Site`:** Pontos físicos de prestação de serviços (ex: galpões industriais, salas comerciais). Um técnico de qualquer filial pode precisar atender a um site compartilhado.
* **`Asset`:** Ar condicionado, chillers ou subestações. O equipamento físico pertence ao cliente e à corporação prestadora, independente de qual filial operacional atenda no dia.
* **`CatalogHubItem` / `SupplierProfile`:** O catálogo de insumos técnicos, preços padrão de peças e cadastro de fornecedores é corporativo e compartilhado globalmente por toda a empresa.

### C. Entidades Sem Campos de Tenancy (Herança de Contexto)
Estas tabelas não possuem colunas físicas de tenancy porque estão vinculadas umbilicalmente a um agregado pai que possui o isolamento, ou porque são de escopo estritamente local do dispositivo físico.

* **`BudgetItem`:** Pertence estritamente ao seu pai `Budget`. O isolamento é herdado do pai.
* **`SimpleFinanceRecord`:** Vinculado diretamente via chave estrangeira a uma `WorkOrder` ou `Budget`. A proteção é dada por junção (JOIN) em queries de autorização.
* **`OperationalEvent`:** Armazena apenas o `aggregateId`. O servidor roteia os eventos nos canais de sync fazendo o lookup do agregado raiz.
* **`SettingRecord` / `MigrationRecord`:** Dados estritamente privados do dispositivo físico (ex: token JWT de autenticação do técnico ativo, logs de migrações estruturais do IndexedDB local).

---

## 3. SEGURANÇA MULTIEMPRESA (RLS E PREVENÇÃO DE VAZAMENTO)

Para garantir isolamento absoluto no modelo multiempresa SaaS e bloquear de forma rigorosa qualquer vazamento de dados, implementamos um sistema de proteção de três camadas (*Three-Gate Isolation*).

```text
  +---------------------------------------------------------------------+
  | GATE 1: LOCAL DEVICE WIPE                                           |
  | Se JWT.company_id != IndexedDB.company_id, força limpeza completa.  |
  +---------------------------------------------------------------------+
                                   ||
                                   \/
  +---------------------------------------------------------------------+
  | GATE 2: POSTGRES RLS (SELECT)                                       |
  | Filtra dados do pull na nuvem. Apenas baixa dados correspondentes   |
  | a auth.jwt() ->> 'company_id'. Rejeita forjas de id.                |
  +---------------------------------------------------------------------+
                                   ||
                                   \/
  +---------------------------------------------------------------------+
  | GATE 3: SERVER TRIGGER (INSERT)                                     |
  | Sobrescreve NEW.company_id com o ID extraído diretamente do JWT.    |
  | Impede qualquer inserção forjada por clientes maliciosos.           |
  +---------------------------------------------------------------------+
```

### A. Filtragem no Pull via Row Level Security (RLS) no Supabase
A tabela `sync_envelopes` na nuvem possui políticas nativas que usam a assinatura do JWT de sessão para filtrar os dados em nível de banco de dados.

```sql
-- Habilita RLS na tabela de envelopes de sync
ALTER TABLE sync_envelopes ENABLE ROW LEVEL SECURITY;

-- Política de Leitura (Pull): O usuário autenticado só pode ler envelopes do seu tenant corporativo
CREATE POLICY select_tenant_envelopes ON sync_envelopes
    FOR SELECT
    TO authenticated
    USING (company_id = (auth.jwt() ->> 'company_id')::uuid);
```

Com este mecanismo, qualquer chamada do Pull Engine (mesmo que um usuário mal-intencionado manipule os cabeçalhos HTTP ou o payload via scripts externos) retornará apenas registros correspondentes à empresa vinculada ao seu login ativo.

### B. Proteção no Push via Triggers no Servidor PostgreSQL
Para impedir que um dispositivo infectado envie envelopes contendo um `company_id` forjado de outro cliente, uma trigger no banco de dados na nuvem sobrescreve o valor enviado pelo dispositivo de maneira forçada antes da persistência:

```sql
CREATE OR REPLACE FUNCTION force_tenant_envelope_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Sobrescreve de forma autoritativa o company_id com o valor extraído da sessão autenticada do JWT
    NEW.company_id := (auth.jwt() ->> 'company_id')::uuid;
    
    -- Sobrescreve o user_id com o usuário autenticado real
    NEW.user_id := auth.uid();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_insert_force_tenant
    BEFORE INSERT ON sync_envelopes
    FOR EACH ROW
    EXECUTE FUNCTION force_tenant_envelope_owner();
```

### C. Validação de Ownership Local (Crash Cleanup)
No startup da aplicação, o `DatabaseRecoveryService.ts` realiza uma validação de correspondência de sessão. Se o token JWT do usuário ativo apresentar um `companyId` diferente do cadastrado no banco local IndexedDB (ex: após logout e novo login com conta de outra empresa), o serviço de recuperação dispara um *Wipeout total*:

```typescript
// Implementado no DatabaseRecoveryService.ts
export async function validateLocalCompanyOwnership(currentUserCompanyId: string): Promise<boolean> {
  const localMeta = await db.settings.get('active_company_id');
  
  if (localMeta && localMeta.value !== currentUserCompanyId) {
    aferixLogger.warn('DatabaseRecovery', 'Detecção de incompatibilidade de empresa no dispositivo! Iniciando WIPE local de segurança.');
    
    // Deleta o banco de dados IndexedDB fisicamente para evitar vazamento
    await db.delete();
    
    // Recria a estrutura do banco
    window.location.reload();
    return false;
  }
  
  if (!localMeta) {
    await db.settings.put({ key: 'active_company_id', value: currentUserCompanyId });
  }
  
  return true;
}
```

---

## 4. MODELO DE PERMISSÕES OPERACIONAL (RBAC LOCAL & CLOUD)

Projetamos um modelo de controle de acessos pragmático para prestadores de serviço em campo, bloqueando o acesso técnico a dados financeiros e garantindo velocidade de operação.

### A. Matriz de Acesso por Papel (Role)

| Papel (Role) | O que visualiza (Read) | O que edita (Write) | Acesso Proibido (Forbidden) |
| :--- | :--- | :--- | :--- |
| **Owner** | Toda a base do inquilino (financeiro consolidado, clientes, OSs, contratos, configurações). | Toda a base do inquilino sem restrições. | Nenhuma restrição. |
| **Admin** | Toda a base operacional e comercial. Configurações gerais da empresa e catálogos. | Orçamentos, Ordens de Serviço, Contratos, Clientes e Equipes. | Configurações financeiras e dados bancários mestre (propriedade do Owner). |
| **Manager** | Clientes, OSs de todas as equipes, Orçamentos comerciais aprovados e PMOC. | Agendamentos, Atribuição de OS, Clientes, checklists técnicos e Sites. | Margens de lucro corporativas brutas consolidadas. |
| **Technician** | OSs que lhe foram atribuídas para o dia, Sites, Ativos e checklists associados. | Preenchimento de checklists técnicos, upload de evidências fotográficas, assinatura de conclusão da OS. | **Orçamentos (`budgets`), faturamentos ou registros financeiros (`simpleFinanceRecords`).** |
| **Financial** | Fluxo de caixa consolidado, orçamentos emitidos, faturamento de contratos PMOC. | Lançamento de despesas, conciliação de faturas, snapshots de faturamento financeiro. | Alteração de checklists técnicos de campo ou dados estruturais de sites. |

### B. Mecanismos de Enforcamento (Enforcement Local)
1. **Repository Guard (Local Dexie Interceptor):**
   Para impedir que dados de faturamento sejam expostos ao técnico mesmo em modo offline, as consultas do repositório local interceptam chamadas se a role ativa for `Technician`:
   ```typescript
   // Em SimpleFinanceService.ts / Repository
   export async function listFinanceRecordsForActiveRole(role: string): Promise<SimpleFinanceRecord[]> {
     if (role === 'Technician') {
       aferixLogger.warn('SecurityGuard', 'Tentativa de leitura financeira bloqueada localmente para papel Técnico.');
       return []; // Retorna lista vazia imediatamente sem tocar no IndexedDB
     }
     return await db.simpleFinanceRecords.toArray();
   }
   ```
2. **UI Routing & Rendering Guards:** Os menus de "Finanças" e "Margem Comercial" são condicionalmente omitidos da árvore DOM em nível de aplicação com base na decodificação local do JWT do usuário.

---

## 5. ROADMAP TÉCNICO DE IMPLEMENTAÇÃO (FASE 3)

```text
========================================================================================
                                ROADMAP DE IMPLEMENTAÇÃO
========================================================================================
S1 [Tenancy & Dexie Schema] ---> S2 [Down-Sync Engine] ---> S3 [PMOC Multi-Asset] ---> S4 [RBAC & RLS]
========================================================================================
```

### SPRINT 1: Modelagem e Tenancy Master
* **Objetivo:** Injetar as propriedades de isolamento e segmentação física (`companyId` e `workspaceId`) nos esquemas e agregados Dexie e Supabase.
* **Arquivos Impactados:** `src/storage/dexieDatabase.ts`, `src/domain/attendance.ts`, `src/domain/budget.ts`, `src/domain/contract.ts`, `src/domain/client.ts`.
* **Migrações Necessárias:**
  * Atualização do esquema Dexie para **Versão 18**:
    ```typescript
    this.version(18).stores({
      budgets: 'id, companyId, workspaceId, attendanceId, clientId, syncStatus',
      attendances: 'id, companyId, workspaceId, syncStatus',
      clients: 'id, companyId, workspaceId, syncStatus',
      workOrders: 'id, companyId, workspaceId, attendanceId, clientId, syncStatus',
      contracts: 'id, companyId, workspaceId, clientId, status, syncStatus'
    });
    ```
  * Script de migração local que lê registros IndexedDB antigos e injeta o `companyId` recuperado no login para evitar orfandade de dados legados.
* **Riscos:** Perda ou corrupção de orçamentos e OSs locais em dispositivos que realizem o upgrade offline.
* **Critérios de Aceite:**
  * O app realiza o boot limpo após o upgrade do banco sem erros de migração IndexedDB.
  * Novos registros criados localmente herdam automaticamente os UUIDs de `companyId` e `workspaceId` da sessão autenticada.

### SPRINT 2: Down-Sync Engine Core (Pull)
* **Objetivo:** Desenvolver o Pull Engine incremental em segundo plano e a reconciliação temporal LWW.
* **Arquivos Impactados:** `src/services/CloudSyncService.ts`, `src/services/ConflictDetectionService.ts`, `src/storage/dexieDatabase.ts`.
* **Migrações Necessárias:** Inserção do cursor padrão `last_synced_sequence` com valor `0` na tabela de configurações locais (`db.settings`).
* **Riscos:** Inundação de requisições na nuvem se a lógica de verificação de eco do `device_id` falhar (loops de sincronismo).
* **Critérios de Aceite:**
  * Alterações feitas no dispositivo A são replicadas para a nuvem via Push e baixadas no dispositivo B via Pull em menos de 5 segundos online.
  * O cursor de sequência avança corretamente e de forma persistente após cada lote bem-sucedido.
  * Envelopes contendo o mesmo `device_id` local são sumariamente ignorados no pull.

### SPRINT 3: PMOC Checklist e Ativos Agrupados
* **Objetivo:** Re-arquitetar o motor de preventivas (PMOC) de 1 Ativo -> 1 OS para N Ativos -> 1 OS -> N Checklists.
* **Arquivos Impactados:** `src/services/MaintenanceSchedulerService.ts`, `src/domain/maintenancePlan.ts`, `src/core/types/business.ts` (OS Interface).
* **Migrações Necessárias:** Criação da tabela ou campo de dados estruturados locais `checklists` associando a ID da OS técnica de preventivas com a ID do Ativo correspondente.
* **Riscos:** Lentidão no render de formulários de vistoria em tablets e celulares lentos ao renderizar múltiplos checklists complexos na mesma tela.
* **Critérios de Aceite:**
  * O agendamento de uma visita em um cliente comercial com 35 condicionadores de ar gera **1 único Atendimento e 1 única OS**, contendo 35 checklists independentes indexados.
  * A UI renderiza os checklists de forma otimizada utilizando *virtualized lists* para evitar travamentos em aparelhos Android.

### SPRINT 4: Fechamento de Segurança e RBAC
* **Objetivo:** Deploy definitivo de Row Level Security no PostgreSQL do Supabase e bloqueios operacionais locais.
* **Arquivos Impactados:** `src/features/workflow/operationalFacade.ts`, `src/services/SimpleFinanceService.ts`, `supabase/migrations/`.
* **Migrações Necessárias:** Execução de migração SQL no Supabase ativando as políticas de RLS e triggers de segurança nas tabelas de sincronismo.
* **Riscos:** Bloqueio indevido de requisições legítimas se as triggers de checagem do JWT possuírem tipos incompatíveis de UUID no banco de dados.
* **Critérios de Aceite:**
  * Chamadas forjadas HTTP contendo o JWT do inquilino B tentando ler ou alterar registros da empresa A retornam `401 Unauthorized` ou zero registros.
  * O papel `Technician` no IndexedDB é bloqueado de realizar leituras diretas em tabelas de finanças, lançando uma exceção de acesso negado interceptada no console e tratada na UX.

---

## 6. MATRIZ DE RISCO ARQUITETURAL

Para mitigar a complexidade da Fase 3, classificamos as ameaças técnicas utilizando a metodologia pragmática de engenharia Aferix:

| Vetor de Risco | Probabilidade | Impacto | Classificação | Mitigação Técnica |
| :--- | :--- | :--- | :--- | :--- |
| **Vazamento de Tenancy (Data Leak)** | Baixa | Catastrófico | **Crítico** | Triggers em nível de servidor PostgreSQL substituindo dados do payload pelo cabeçalho JWT criptografado da sessão. |
| **Looping de Sync (Echo Storm)** | Média | Alto | **Alto** | Identificação única persistente (`AFERIX_INSTALLATION_ID`) salva localmente e injetada no `device_id` dos envelopes para filtragem de auto-pull. |
| **Divergência de Dados (LWW Drift)** | Média | Alto | **Alto** | Lançamento de eventos de auditoria local (`RECONCILIATION_COMPLETED`) com retenção dos históricos de mutações no agregador Dexie. |
| **Lentidão em PMOC Multi-Ativo** | Alta | Médio | **Médio** | Normalização local de checklists em tabelas independentes indexadas por `workOrderId` para carregar apenas sob demanda do usuário. |

---

## 7. DEFINITION OF DONE (DoD) - FASE 3

A **Fase 3** do Aferix ERP Premium só poderá ser decretada como **CONCLUÍDA** quando atender cumulativamente a todos os critérios listados abaixo:

1. **Sincronismo Bidirecional Factual:** Alterações cadastrais e de OS feitas no *Dispositivo A* são refletidas no *Dispositivo B* de forma automática após a sincronização, sem necessidade de recarregamento manual da página.
2. **Zero Zombie Records:** Casos de exclusão de Atendimentos offline propagam-se de forma consistente e o compactor limpa dados do IndexedDB sem ressurreição em outros celulares.
3. **RLS Supabase Verificado:** Testes automatizados validam que requisições forjadas com JWT de outra empresa para a tabela `sync_envelopes` são sumariamente rejeitadas com erro HTTP `401 Unauthorized` ou retornam arrays vazios.
4. **Hardening de Casing Concluído:** A propriedade local `syncStatus` de ordens de serviço é devidamente atualizada para `'synced'` após sincronismo, sem ocorrência de enfileiramentos infinitos por casing incompatível.
5. **Zero Quebra de Testes:** Todos os 202 testes unitários e de estresse locais do runner **Vitest** continuam **100% verdes e operacionais**.
