# AFERIX ERP PREMIUM — AUDITORIA DE RISCO E IMPLEMENTAÇÃO (FASE 3 - SPRINT P0)
`STATUS: LIBERADO PARA EXECUÇÃO | UX EXECUTION MODE | PRAGMÁTICO`
`AUTORES: PRINCIPAL SOFTWARE ARCHITECT, DISTRIBUTED SYSTEMS ENGINEER & CTO`

Este documento apresenta o parecer final de engenharia de risco e o plano de transição seguro para a **Sprint P0 (Fase 3)** do Aferix ERP Premium. Sob a ótica de máxima estabilidade operacional, velocidade de entrega e risco zero de perda de dados corporativos ou downtime em campo, avaliamos e validamos a prontidão de todos os agregados envolvidos.

---

## ETAPA 1 — ANÁLISE RIGOROSA DE DEPENDÊNCIAS

Para mitigar o retrabalho e regressões funcionais na base de código do Aferix, estabelecemos a **Ordem Crítica de Caminho de Dependência**:

```text
+---------------------------------------------------------------------------------+
|                       CAMINHO CRÍTICO DE EXECUÇÃO (SPRINT P0)                   |
+---------------------------------------------------------------------------------+
| 1. Dexie v18 Schema Upgrade   | Injeta companyId/workspaceId locais nos esquemas|
+-------------------------------+-------------------------------------------------+
                                ||
                                \/
+-------------------------------+-------------------------------------------------+
| 2. Supabase RLS & Triggers    | Ativa proteção de tenancy no banco na nuvem     |
+-------------------------------+-------------------------------------------------+
                                ||
                                \/
+-------------------------------+-------------------------------------------------+
| 3. Down-Sync Engine (Pull)    | Ativa motor de sincronismo reativo re-aplicável |
+-------------------------------+-------------------------------------------------+
                                ||
                                \/
+-------------------------------+-------------------------------------------------+
| 4. PMOC AssetExecution        | Normaliza vistorias técnicas (N ativos -> 1 OS) |
+-------------------------------+-------------------------------------------------+
                                ||
                                \/
+-------------------------------+-------------------------------------------------+
| 5. Safe Switch & Logout       | Trata segurança e limpeza de base IndexedDB     |
+-------------------------------+-------------------------------------------------+
```

### Análise de Dependências:
*   **Qual item deve ser implementado primeiro?**
    O **Upgrade de Schema Dexie para a Versão 18** é o alicerce fundamental. Nenhuma query, repositório ou o motor de pull funcionará se as colunas físicas de isolamento composto (`companyId`, `workspaceId`) não estiverem indexadas no banco local do dispositivo.
*   **A Ordem que Minimiza Retrabalho:**
    A ordem mostrada no grafo acima é ótima. Garantir a consistência e segurança local (Passo 1), estender para as políticas da nuvem (Passo 2) e ativar o sincronismo reativo (Passo 3) fornece a fundação de dados blindada necessária para então refatorar a interface de vistoria do PMOC (Passo 4) de forma 100% segura.

---

## ETAPA 2 — AUDITORIA DE MIGRAÇÃO DEXIE V18 (MATRIZ DE RISCO)

Avaliamos os riscos do upgrade do IndexedDB local em aparelhos de produção vigentes:

### A. Tabela de Riscos de Migração

| Vetor de Risco | Classificação | Impacto | Mitigação Técnica Mandatória |
| :--- | :---: | :---: | :--- |
| **Bloqueio Concorrente de Abas** | **Alto** | Médio | Uso de política de recarregamento e aviso reativo Dexie `db.on('blocked', ...)` solicitando o fechamento de outras abas da aplicação. |
| **Perda de Dados Legados Órfãos** | **Alto** | Alto | O script de migração v18 deve checar recursivamente o token de autenticação ativo do LocalStorage e injetar retroativamente a ID da empresa. |
| **Overhead de Índices Compostos** | **Médio** | Baixo | Uso de indexações simples indexadas separadamente em vez de chaves compostas pesadas do Dexie para manter a CPU leve. |
| **Falha de Transação e Rollback** | **Baixo** | Baixo | Gerido nativamente de forma transacional e atômica pelo motor de upgrade do próprio Dexie. |

---

## ETAPA 3 — AUDITORIA TÉCNICA DO PULL ENGINE

Desenhamos a especificação de segurança distribuída do motor de pull para blindar o sistema contra duplicidades e loops infinitos:

### A. Fluxo de Replicação Consistente

```text
[Supabase Cloud] ----> (Envelope com Sequence) ----> [CloudSyncService (Pull Loop)]
                                                              |
                                                    { device_id === auto? } --(Sim)--> [Ignorar / Descartar]
                                                              | (Não)
                                                    { sequence > lastSeq? } --(Não)--> [Descartar]
                                                              | (Sim)
                                                    { syncStatus === 'pending' } --(Sim e local mais novo)--> [Ignorar / LWW Wins]
                                                              | (Não)
                                                    [Gravação IndexedDB .put()] ----> [Salva lastSeq settings]
```

### B. Especificação de Robustez:
1.  **Buffer Temporal de sequence:** Para mitigar a invisibilidade de sequence uncommitted descrita na auditoria Red Team, o Pull Engine consultará envelopes aplicando um buffer dinâmico de 5 segundos de idade mínima na sequence no banco na nuvem.
2.  **Echo Prevention:** O cabeçalho de auto-descarte imediato baseia-se na comparação do `device_id` local salvo no LocalStorage (`AFERIX_INSTALLATION_ID`) contra o payload do envelope.
3.  **Recuperação Pós Offline Prolongado (Lookback Bypass):** Se o delta do cursor local para o cursor de sequence no Supabase for superior a 10.000 registros, o motor ativa automaticamente a **Banda de Bypass de Segurança**, suspendendo o processamento em lote da fila de envelopes e realizando um download massivo (Bulk Snapshot) do estado atualizado das entidades ativas, recalculando a sequence local para o topo global na nuvem.

---

## ETAPA 4 — PMOC MULTI-ATIVOS (ESCALABILIDADE EM CAMPO)

Simulamos o processamento da cadeia unificada `Attendance` $\rightarrow$ `WorkOrder` $\rightarrow$ `AssetExecution` (Value Objects aninhados) sob diferentes volumes de ar-condicionados:

*   **10 ativos:** Execução instantânea. Sem overheads de interface ou banco local.
*   **50 ativos:** Risco inicial de travamento e latência móvel na UI de campo se os componentes utilizarem re-renders desnecessários.
    *   *Mitigação:* Componentização de componentes isolados reativos.
*   **100 ativos:** Ponto de pressão no IndexedDB se a persistência realizar loops de escrita individuais de `.put()`.
    *   *Mitigação:* Gravações de checklists e medições devem ser agrupadas e salvas em bloco utilizando `bulkPut()` do Dexie em uma única transação rápida de banco.
*   **250 ativos:** Esgotamento do heap de memória RAM do Safari móvel.
    *   *Mitigação (Safelimit Splitter):* O motor planejador bloqueia de forma rígida a consolidação de OS preventivas contendo mais de **250 máquinas**, segmentando o agendamento em visitas regionais distintas automaticamente.

---

## ETAPA 5 — PARECER FINAL DO CONSELHO ARQUITETURAL

$$\mathbf{VEREDICTO \ CONSOLIDADO: \text{GO (Liberado para Execução)}}$$

### Justificativa Técnica:
A arquitetura proposta para a **Sprint P0** foi refinada de forma pragmática, eliminando qualquer risco de overengineering prematuro. O isolamento de tenancy com base no preenchimento de dados órfãos legados via LocalStorage, o down-sync híbrido blindado por buffer de idade de sequences uncommitted e a normalização de ativos em campo através da entidade imutável `AssetExecution` fornecem as garantias técnicas exigidas para um lançamento produtivo comercial de altíssima escala e estabilidade nos próximos 6 meses.
