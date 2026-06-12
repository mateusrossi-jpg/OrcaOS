# AFERIX CLOUD REALITY AUDIT
**Data da Auditoria:** 02 de Junho de 2026
**Foco:** Concorrência, Sincronização e Resolução de Conflitos em Nuvem

---

## 1. OBJETIVO DA AUDITORIA
Validar se o ecossistema Aferix (atualmente estruturado como Offline-First com base em Dexie.js e Supabase) suporta múltiplos atores operando simultaneamente sobre as mesmas entidades (ex: 5 Técnicos, 1 Gestor e 1 Comercial).

---

## 2. AUDITORIA DA FUNDAÇÃO CLOUD (O QUE EXISTE HOJE)

### `CloudSyncService.ts`
* **Existe?** Sim.
* **Status:** Implementação Parcial (Apenas Push).
* **Análise:** O serviço captura eventos operacionais da tabela local `operationalEvents` (Dexie) e faz o *push* (envio) para a tabela `sync_envelopes` no Supabase. Ele lida com filas locais, altera o status para `in-flight`, implementa retries (backoff/jitter) e marca como `synced` no sucesso.
* **Problema Grave:** A função `resolveConflictsAndValidate` tenta implementar *Last-Write-Wins (LWW)*, mas faz a query no Supabase filtrando por `event_id` (que é único por evento gerado no client) em vez de checar a versão do `aggregate_id`. Isso significa que ele apenas previne a duplicação do *mesmo evento*, mas não impede que dois dispositivos enviem estados divergentes do mesmo ativo/OS.

### `offlineReconciliation.ts`
* **Existe?** Sim.
* **Status:** Órfão / Stub.
* **Análise:** O arquivo define a classe `OfflineReconciliationService` e uma função `reconcileOnReconnect()`. No entanto, o interior dessa função contém apenas: `// TODO: Send local VersionVector checkpoints to Cloud. // Receive Missing Envelopes.` Ou seja, o mecanismo de *Pull* (baixar dados da nuvem para os dispositivos) **não está implementado**.

### `Dexie` (Banco de Dados Local)
* **Existe?** Sim.
* **Status:** Completo e Robusto.
* **Análise:** É a verdadeira Fonte da Verdade (SSOT) de cada dispositivo. Extremamente rápido, mas atua como um "Silo Isolado" devido à falta do mecanismo de *Pull* da nuvem.

### `Repositories` / `operationalFacade.ts`
* **Existe?** Sim.
* **Status:** Funcional localmente.
* **Análise:** O Facade grava o dado na tabela final (ex: `workOrders`) e emite um evento (ex: `WORKORDER_UPDATED`) no log do Dexie. Esse modelo (Event Sourcing local) é excelente, mas o merge real dos eventos remotos não ocorre.

---

## 3. SIMULAÇÃO DE ESTRESSE: O CONFLITO SIMULTÂNEO

**Cenário:**
- `FIELD A` edita a OS #123 (Adiciona "Limpeza feita").
- `FIELD B` edita a OS #123 (Adiciona "Gás recarregado") estando offline.
- `MANAGER` acessa a OS #123 e a fecha.

**O que acontece na realidade do código hoje?**

1. **Localmente:** `FIELD A`, `FIELD B` e `MANAGER` terão a OS #123 com dados completamente diferentes em seus navegadores (Dexie).
2. **Ao sincronizar (Push):** O `CloudSyncService` enviará os três eventos para o Supabase na tabela `sync_envelopes`. Nenhum erro de conflito será gerado porque os IDs dos eventos são diferentes.
3. **No Servidor (Supabase):** Haverá três eventos válidos na nuvem para a mesma OS, causando **duplicação de trilha**.
4. **Quem vence?** **NENHUM**. Como a função de baixar as atualizações do servidor (`reconcileOnReconnect()`) é apenas um `TODO`, as edições de `FIELD A` nunca chegarão no `MANAGER`, e o fechamento do `MANAGER` nunca aparecerá para `FIELD B`. 
5. **Veredito:** O sistema atual cria **Silos Divergentes**. É impossível operar com 5 técnicos, 1 gestor e 1 comercial simultaneamente sobre os mesmos registros no estado atual do código.

---

## 4. PROPOSTA DE ARQUITETURA PARA RESOLUÇÃO

Para que o Aferix suporte operação comercial real em equipe (SaaS Multi-tenant), a fundação de sincronização deve ser reescrita usando os seguintes padrões:

### A. Version Control (Optimistic Concurrency Control)
O uso de timestamps de relógio (`Date.now()`) é frágil porque relógios de celulares ficam dessincronizados. 
**Solução:** Adicionar um campo `version` (inteiro) em cada Aggregate (Client, Budget, WorkOrder). Toda vez que o dispositivo editar localmente, o `version` sobe (ex: de 1 para 2). Ao tentar fazer o push, o Supabase verifica: `if (incoming_version <= current_db_version) throw Conflict`.

### B. Offline Queue (Event Sourcing)
A fundação já existe (`operationalEvents`). O que falta é garantir que a fila não seja uma simples "substituição de snapshots", mas sim Mutação de Campos (Delta/Patch). 
**Solução:** Em vez de enviar a OS inteira no evento, enviar apenas `{"added_material": "Gás R22"}`. Assim, o backend consegue unir a alteração do `FIELD A` com a do `FIELD B` sem sobrescrever (CRDTs ou JSON Patch).

### C. Sync Queue (Bi-directional Sync)
É o bloco que falta (`TODO` no código). 
**Solução:** Utilizar o *Supabase Realtime* ou um *Polling Worker* rodando a cada 30 segundos no `CloudSyncService`. O worker pergunta: *"Servidor, me dê todos os eventos na tabela `sync_envelopes` onde `sequence > minha_ultima_sequence_local`"*. O dispositivo então baixa os eventos de outros usuários e aplica no Dexie.

### D. Conflict Resolution Strategy (Server-Wins com Fallback)
Quando houver conflitos matemáticos incontornáveis (ex: Técnico A e Técnico B tentaram usar a última unidade do mesmo filtro de ar do estoque):
1. **Regra Base:** O Servidor (Supabase) é o árbitro. Quem chegar primeiro, ganha (First-Write-Wins a nível de banco de dados central).
2. **Rejeição:** O evento atrasado é rejeitado e enviado de volta ao dispositivo que tentou sincronizar com o status `CONFLICT_REJECTED`.
3. **Triagem Humana:** A OS no celular do Técnico B entra em estado de "Alerta de Sincronização", exibindo a mensagem: *"Esta OS foi alterada pelo Gestor enquanto você estava offline. Por favor, revise."*

---

## 5. CONCLUSÃO FINAL DO AUDITOR
O Aferix possui uma arquitetura de banco de dados local formidável (Dexie) e uma fila de eventos muito bem desenhada para funcionar offline. Contudo, **o "Cabo de Rede" que liga os dispositivos (Multi-player) só funciona em uma via (Envio), e sem validação de concorrência.** 

Antes de vender o sistema para times maiores que 1 usuário, o **Blocker P0** é implementar o *Down-Sync* (baixar dados) e o *Optimistic Concurrency Control* (versões de documentos) no Supabase.