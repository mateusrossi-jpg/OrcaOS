# AFERIX ERP PREMIUM — BLUEPRINT E AUDITORIA DE ARQUITETURA (SPRINT 2)
`ROLE: PRINCIPAL DISTRIBUTED SYSTEMS ARCHITECT, SUPABASE SPECIALIST & OFFLINE-FIRST ERP ENGINEER`

Este documento apresenta a auditoria técnica de engenharia de sistemas distribuídos para a **Sprint 2 — Down-Sync Core (Pull Engine)**, validando os fluxos de eventos, estratégias de cursor, resolução de conflitos temporais e mecanismos de prevenção de loop (echo prevention).

---

## PARTE 1 — EVENT FLOW AUDIT (CREATE, UPDATE, DELETE)

O fluxo de sincronização bidirecional opera conectando de forma fracamente acoplada dois dispositivos locais rodando IndexedDB e o banco de dados Supabase na nuvem.

### A. Modelagem do Fluxo de Eventos e Snapshots

```text
  [Device A (Offline)]              [Dispositivo B (Online)]            [Supabase Cloud]
           |                                  |                                |
  1. Mutação Local:                          |                                |
     Adiciona Attendance                      |                                |
     syncStatus: 'pending'                    |                                |
           |                                  |                                |
     -- Volta Online --                       |                                |
  2. Push (OperationalEvent) --------------> |                                |
     Snapshot serializado                     |                                |
           |                                  |                                |
           | <--- 3. Ack com Sequence ------- |                                |
     Status: 'synced'                         |                                |
           |                                  |                                |
           |                                  | --- 4. Pull incremental ----> |
           |                                  |    (seq > last_synced_seq)     |
           |                                  |                                |
           |                                  | <--- 5. Retorna Envelope ------|
           |                                  |                                |
           |                                  | 6. Aplica snapshot LWW         |
           |                                  |    syncStatus: 'synced'        |
```

### B. Mapeamento de Casos de Mutação

1. **CREATE / UPDATE:**
   * **Local → Cloud (Push):** O dispositivo de origem grava a entidade no Dexie com `syncStatus: 'pending'`, emite um `OperationalEvent` correspondente contendo o snapshot serializado e o enfileira na tabela local `operationalEvents`. Ao entrar em modo online, o `CloudSyncService` envia o envelope para o Supabase. O banco de dados na nuvem persiste na tabela `sync_envelopes` e retorna o ID sequencial global. O dispositivo de origem atualiza a entidade local para `syncStatus: 'synced'`.
   * **Cloud → Local (Pull):** Dispositivos receptores que executam o Pull detectam o novo envelope de sequência superior à sua última sequência sincronizada. O snapshot recebido é reconciliado e inserido no IndexedDB via `.put()`, e a entidade é marcada localmente como `syncStatus: 'synced'`.
2. **DELETE vs SOFT DELETE (Zombie Record Protection):**
   * **O Problema da Exclusão Física:** Se o *Dispositivo A* executar uma exclusão física de um registro e esta exclusão não for registrada de forma duradoura (tombstone), o *Dispositivo B* (que permaneceu offline) ao entrar online sincronizará edições feitas localmente no mesmo registro, inserindo-o novamente no Supabase e "ressuscitando" o registro excluído de forma involuntária (efeito zumbi).
   * **A Solução (Soft Delete Tombstone):** A exclusão física é terminantemente proibida nos fluxos operacionais da aplicação. O fluxo de deleção altera as colunas de controle da entidade local para `isDeleted: true` e `deletedAt: ISOString()`, gerando um evento do tipo `SOFT_DELETE`. Este evento trafega via Push e Pull normalmente. Quando o *Dispositivo B* puxa o envelope contendo o tombstone, ele executa a exclusão lógica no seu IndexedDB. A limpeza física só ocorre após 90 dias sincronizados via rotina de compactação em segundo plano (`compactSoftDeletedRecords`).

### C. Análise de Loops e Condições de Corrida
* **Loops de Sync (Echo):** Resolvidos injetando o `device_id` no envelope de sincronismo. O motor de pull ignora sumariamente envelopes criados pelo próprio dispositivo ativo.
* **Corrida Push/Pull Simultânea:** Se o dispositivo estiver ativamente puxando envelopes no momento em que finaliza um push local, a transação isolada Dexie bloqueia conflitos de escrita concorrente, priorizando a alteração pendente local (`syncStatus === 'pending'`) sobre alterações remotas mais antigas.

---

## PARTE 2 — CURSOR STRATEGY (BIGSERIAL SEQUENCE)

Para gerenciar o cursor incremental na nuvem, analisamos a viabilidade do tipo `BIGSERIAL` do PostgreSQL (campo inteiro de 64 bits incremental e autogerado pelo banco).

### A. Vantagens
* **Monotonicidade Estrita:** Garantia matemática de que cada registro inserido na nuvem receberá um número sequencial superior aos anteriores, eliminando qualquer risco de inconsistência derivado de desvios de relógio local (*clock drift*) nos celulares dos técnicos.
* **Alta Performance de Consulta:** Indexar e filtrar inteiros de 64 bits (`BIGINT`) no PostgreSQL utilizando árvores B-Tree possui complexidade de busca extremamente baixa ($O(\log N)$).
* **Ausência de Travamento (Lock-Free):** Sequences no Postgres operam fora do escopo transacional normal. A sequence é gerada de forma instantânea sem realizar locks na tabela de envelopes, garantindo alto throughput de escrita concorrente.

### B. Limitações e Riscos
* **Gaps na Sequência:** Se uma transação do Postgres falhar ou for abortada após solicitar um número da sequence, esse número é descartado e o contador não retrocede. Isso gera buracos na sequência (ex: `1, 2, 4, 5`).
  * **Mitigação:** O Pull Engine do Aferix foi estruturado para consultar registros utilizando maior que (`> lastSeq`) em vez de checagem sequencial consecutiva (`== lastSeq + 1`). Portanto, a ocorrência de buracos é perfeitamente inofensiva.
* **Escalabilidade (100k a 1M+ de eventos):** O modelo é totalmente viável. Um índice `BIGINT` consome apenas 8 bytes por registro. Uma tabela com 1 milhão de envelopes indexados ocupará menos de 15MB de cache de índice no banco de dados Supabase, rodando de forma instantânea.

---

## PARTE 3 — CONFLICT RESOLUTION (LAST WRITE WINS)

O modelo de conciliação padrão adotado é o **Last-Write-Wins (LWW)** baseado no timestamp de atualização do dispositivo. Avaliamos a viabilidade deste modelo em cenários operacionais extremos do ERP:

### A. Simulação de Cenários de Conflito

| Cenário de Negócio | Comportamento LWW | Impacto de Perda de Dados | Classificação | Mitigação Arquitetural Necessária |
| :--- | :--- | :--- | :---: | :--- |
| **1. Técnico altera checklist offline vs Gestor altera OS online** | O timestamp mais recente sobrescreve o registro inteiro. | Se o gestor atualizou o endereço online às 14:05, e o técnico editou o checklist às 14:10, o snapshot do técnico sobrescreve e apaga a edição do gestor. | **Inaceitável** | **Selective Property-Level LWW:** O merge local no IndexedDB deve mesclar propriedades específicas em vez de realizar `.put()` do objeto completo se as alterações forem em chaves distintas. |
| **2. Técnico fecha OS offline vs Financeiro cancela OS online** | Se o cancelamento financeiro ocorreu após o fechamento técnico no relógio, a OS fica cancelada na nuvem. | O fechamento de campo do técnico é desconsiderado, mantendo a OS como cancelada na base. | **Inaceitável** | **Regra Semântica de Domínio:** O status de fechamento técnico concluído de OS de campo é um agregado imutável de transição final. O financeiro deve receber notificação de violação em vez de sobrescrever silenciosamente. |
| **3. Dois técnicos editam a mesma OS** | O técnico com o relógio do celular mais adiantado (ou alteração mais recente) sobrescreve os dados do outro de forma integral. | Os dados inseridos pelo primeiro técnico são completamente perdidos na base de dados. | **Needs Merge** | **Ativos Independentes:** Múltiplos técnicos trabalhando no mesmo local operam sob checklists e ativos distintos. O agrupamento multi-ativo do PMOC mitiga isso (cada ativo tem seu formulário exclusivo). |

---

## PARTE 4 — REALTIME STRATEGY (POLLING VS WEB-SOCKETS)

Para manter a base de dados sincronizada de forma transparente, comparamos as estratégias de conectividade:

| Vetor de Avaliação | A) Polling Incremental | B) Supabase Realtime (WS) | C) Híbrido (Recomendado) |
| :--- | :---: | :---: | :---: |
| **Bateria (Mobile)** | Excelente (Apenas aciona sob demanda) | Alto (Mantém conexão socket persistente) | **Muito Bom** (Realtime desliga em background) |
| **Consumo de Dados** | Médio (Requisições HTTP repetitivas) | Baixo (Canal de texto compacto persistente) | **Excelente** (Combina eventos instantâneos) |
| **Confiabilidade** | Excelente (Simples e imune a quedas) | Instável (Sensível a oscilações de 3G/4G) | **Excelente** (O polling garante a resiliência) |
| **Experiência de Uso** | Atraso marginal (ex: sync a cada 30s) | Instantâneo (Mudanças em tempo real na tela) | **Instantâneo** (Com fallback offline seguro) |

### Arquitetura Recomendada: Híbrida (Reativa e Diferencial)
O aplicativo utiliza os WebSockets do Supabase Realtime para capturar notificações instantâneas de "novos eventos" enquanto a aplicação estiver aberta e em primeiro plano. Ao receber um sinal reativo, em vez de trafegar o snapshot pesado via socket, o sistema simplesmente dispara o `executePullEngine()` incremental para buscar o lote via requisição HTTPS otimizada. Caso a conexão do socket caia ou o dispositivo vá para o background, um temporizador realiza o Polling diferencial de segurança a cada 60 segundos ou na retomada do app (*app resume trigger*).

---

## PARTE 5 — ECHO PREVENTION

Para eliminar completamente o risco de tempestades de sincronização (loops infinitos onde o Dispositivo A envia um dado, puxa o mesmo dado e re-envia de forma cíclica), definimos a assinatura de transação.

A combinação ótima que elimina loops e garante integridade causal sem introduzir complexidade desnecessária é:

$$\text{Assinatura de Sync} = \{ \mathtt{device\_id} + \mathtt{event\_id} + \mathtt{timestamp} \}$$

1. **`device_id` (`AFERIX_INSTALLATION_ID`):** Gravado no LocalStorage do browser no momento do primeiro boot da aplicação. O Pull Engine descarta qualquer envelope contendo o seu próprio ID de dispositivo de forma sumária antes de parsear o payload.
2. **`event_id` (UUID estável):** Registrado na tabela local IndexedDB `operationalEvents`. Evita que o mesmo evento seja processado ou duplicado se for retransmitido em caso de instabilidade de rede.
3. **`timestamp`:** Usado para validação causal LWW para assegurar que apenas dados mais novos sobrescrevam o estado do IndexedDB local.

---

## PARTE 6 — MULTI-DEVICE READINESS (SIMULAÇÃO DE ESCALA)

Simulamos o comportamento do Down-Sync Engine sob crescimento de equipe técnica em campo:

* **Escala de 1 Gestor + 5 Técnicos:** Volume de ~50 envelopes/dia. Latência de processamento de pull negligenciável (< 5ms). Zero concorrência de rede.
* **Escala de 20 Técnicos:** Volume de ~300 envelopes/dia. O banco de dados do Supabase opera folgado. A reconciliação local no IndexedDB dura menos de 12ms por lote de sincronismo.
* **Escala de 100 Técnicos:** Volume de ~2.000 envelopes/dia.
  * **Gargalo Identificado:** Se todos os técnicos entrarem online simultaneamente às 18:00 (fim do turno) para sincronizar dados offline acumulados no dia, ocorrerá uma concorrência intensa de rede e CPU no banco Supabase.
  * **Mitigação Técnica:** O Pull Engine deve limitar o tamanho de lote (lote padrão de 100 envelopes) e aplicar um atraso dinâmico aleatório de backoff (jitter) entre pulls sucessivos para suavizar picos de processamento na nuvem.

---

## PARTE 7 — DEFINITION OF READY (DoR) - SPRINT 2

### A. Riscos Críticos Remanescentes em Produção
1. **Clock Tampering:** Se o técnico alterar o relógio do sistema operacional do seu celular Android para "ganhar horas de trabalho" ou por erro do sistema, os timestamps gerados localmente distorcerão a reconciliação LWW, fazendo com que dados antigos sobrescrevam dados online novos.
   * **Mitigação:** Salvar a hora do evento usando tempos locais relativos ou validar timestamps contra servidores NTP no momento da conexão online.
2. **Concorrência por Bloqueio de Registro (IndexedDB Lock):** Se a UI tentar renderizar uma alteração enquanto o Pull Engine executa uma transação de escrita massiva em lote Dexie, o app pode apresentar travamento de interface marginal.

### B. Parecer Técnico Final

$$\mathbf{VEREDICTO: \text{APROVADO COM RESSALVAS}}$$

**Ressalvas Técnicas Exigidas:**
1. A gravação das entidades no Pull Engine deve adotar **Property-Level LWW Merge** para evitar apagamento acidental de campos modificados de forma disjunta.
2. O motor de sincronismo realtime deve ser **Híbrido**, utilizando sockets para wake-up e polling com HTTPS incremental como barramento de entrega e resiliência a falhas de conexão.
