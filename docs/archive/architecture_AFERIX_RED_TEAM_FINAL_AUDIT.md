# AFERIX ERP PREMIUM — RELATÓRIO DE AUDITORIA DESTRUTIVA RED TEAM (SPRINT 2)
`ROLE: PRINCIPAL DISTRIBUTED SYSTEMS ARCHITECT, DATABASE RELIABILITY ENGINEER (DRE) & RED TEAM REVIEWER`

Este relatório apresenta a auditoria destrutiva da arquitetura do **Down-Sync Engine (Sprint 2)** do Aferix ERP Premium. Nossa missão nesta revisão técnica é procurar falhas estruturais, condições de contorno e vetores de falha no design antes da primeira linha de código ser enviada para homologação ou piloto comercial.

---

## PARTE 1 — EVENT ORDERING (ORDENAÇÃO E CONSISTÊNCIA DISTRIBUÍDA)

### A. O Erro da Corrida de Commits Concorrentes no Cursor `BIGSERIAL`
O maior risco oculto no uso de sequences Postgres para cursor de Pull é a **visibilidade de transação não comitada**.

#### O Cenário de Quebra:
1. **Transação T1 (Servidor):** O *Dispositivo A* envia o Envelope E1. A transação T1 é aberta na nuvem. A sequence atribui `sequence = 100` a E1. O processo de commit de T1 demora 3 segundos devido a latência de triggers no banco.
2. **Transação T2 (Servidor):** O *Dispositivo C* envia o Envelope E2. A transação T2 é aberta. A sequence atribui `sequence = 101` a E2. T2 é processada instantaneamente e executa o commit.
3. **Consulta de Pull (Dispositivo B):** O *Dispositivo B* realiza um Pull solicitando `sequence > 99`.
   * **O Fato:** E2 (`101`) está comitado e é visível. E1 (`100`) **ainda não está comitado** e, portanto, é invisível na consulta de T2 devido ao isolamento de leitura (*Read Committed*).
   * **A Ação:** O *Dispositivo B* baixa E2 e atualiza seu cursor local `last_synced_sequence` para `101`.
4. **Finalização de T1:** A transação T1 finalmente conclui o commit na nuvem. E1 (`100`) agora está comitado e visível na tabela.
5. **Próximo Pull (Dispositivo B):** O *Dispositivo B* realiza um novo Pull solicitando `sequence > 101`.
   * **A Falha Crítica:** E1 (`100`) é ignorado e **nunca será baixado pelo Dispositivo B**! Ocorreu um *Data Loss* silencioso e permanente de replicação.

#### Mitigação Mandatória:
O Pull Engine na nuvem não deve consultar a sequence crua diretamente de forma irrestrita. O gateway de Pull deve aplicar uma janela de segurança temporal para commits (ex: pulling de sequências com idade mínima de 5 segundos, ou filtrando via `SELECT` que verifique se a transação do ID correspondente está concluída usando `pg_xact_commit_timestamp`).

---

## PARTE 2 — DEVICE FAILURE (TOLERÂNCIA A DESASTRES LOCAIS)

### A. Corrupção Física do IndexedDB sob Falha de Energia
O Dexie é resiliente sob falhas de software, mas os navegadores (especialmente o WebView e Safari em dispositivos móveis) lidam com o IndexedDB como uma caixa preta de arquivo único.
* **O Vetor de Falha:** Se a bateria do dispositivo técnico acabar no momento exato em que o IndexedDB está gravando um lote pesado de snapshots no disco, o arquivo SQLite/LevelDB que roda por baixo do motor do IndexedDB do navegador pode sofrer corrupção de cabeçalho.
* **O Comportamento:** O próximo boot do app disparará uma exceção incontrolável do tipo `DOMException: Database corrupt` ou `UnknownError`. A UI travará em tela branca, inutilizando o app offline.
* **Mitigação:** O `DatabaseRecoveryService` deve envelopar a abertura do Dexie em blocos de tratamento global de exceções. Se for detectada corrupção irreversível, o serviço deve emitir um alerta visual ao usuário, exportar qualquer dado não sincronizado que possa ser recuperado da memória em um arquivo JSON local temporário na pasta de downloads do celular e executar o reset automático do banco local.

### B. Evicção Silenciosa do Armazenamento pelo Sistema Operacional
Tanto o iOS (Safari WebView) quanto o Android executam políticas estritas de limpeza de espaço em disco sem aviso em dispositivos com pouco armazenamento livre.
* **O Vetor de Falha:** Se o celular do técnico estiver com menos de 10% de espaço livre, o sistema operacional irá deletar silenciosamente toda a base IndexedDB do Aferix por considerá-la um "cache do navegador".
* **Impacto:** O técnico perde toda a base de preventivas offline, checklists e evidências fotográficas coletadas que ainda não foram sincronizadas.
* **Mitigação:** Implementar a chamada explícita ao Storage Manager API do navegador no primeiro boot do app:
  ```typescript
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    if (!isPersisted) {
      aferixLogger.warn('Storage', 'Armazenamento persistente negado pelo navegador! Risco de despejo de dados.');
    }
  }
  ```

---

## PARTE 3 — MULTI DEVICE RACE CONDITIONS (CONCORRÊNCIA EXTREMA)

### A. O Erro de Colisão de Checklists Serializados no Property-Level Merge
Assumindo que dois técnicos trabalham no mesmo local físico e editam a mesma OS técnica em paralelo offline:
* **O Vetor de Falha:** Se a lista de checklists de uma OS for armazenada como uma única coluna do tipo JSON array (`checklists: Array<Checklist>`) na tabela `workOrders`, a estratégia de **Property-Level LWW Merge** enxergará a propriedade `checklists` como uma única chave atômica.
* **O Comportamento:**
  1. *Técnico A* marca Item 1 ("Inspeção do Filtro - OK"). Timestamp local: `15:00:00`.
  2. *Técnico B* marca Item 2 ("Carga de Gás - OK"). Timestamp local: `15:00:05`.
  3. Ao sincronizar, o snapshot do *Técnico B* (sendo mais recente) sobrescreverá o array inteiro de checklists.
  4. **Impacto:** A inspeção do Item 1 feita pelo *Técnico A* é apagada silenciosamente.
* **Mitigação:** Normalização física absoluta. Checklists não podem ser serializados em array dentro de outra entidade. Devem residir em tabela local independente (`checklists`) onde cada linha representa a avaliação de um único ativo, isolando as chaves primárias.

---

## PARTE 4 — TENANCY SECURITY (VAZAMENTO E EXPIRAÇÃO DE SESSÃO)

### A. Travamento de Sync por JWT Expirado em Cenários Offline Longos
* **O Vetor de Falha:** O JWT padrão do Supabase possui expiração curta de 1 hora. Se o técnico trabalhar em uma mina subterrânea ou subsolo de shopping sem conectividade por 5 dias consecutivos:
  1. O token expira localmente após 1 hora.
  2. O técnico coleta 15 checklists e orçamentos ao longo dos 5 dias.
  3. Ao retornar para a superfície (online), o Push Engine tenta replicar os dados para a nuvem.
  4. O Supabase bloqueia as requisições com erro `401 Unauthorized` porque o token expirou.
  5. **O Gargalo:** O aplicativo não consegue renovar o JWT automaticamente em background se o *refresh token* também tiver expirado ou se houver instabilidade momentânea no gateway de autenticação do Supabase.
* **Mitigação:** A aplicação de regras de isolamento no push deve armazenar temporariamente os dados na fila de replicação com um mecanismo de retenção elástica, de forma a suspender o descarte ou a limpeza local até que a reautenticação silenciosa e a renovação de tokens de segundo plano sejam concluídas.

---

## PARTE 5 — OFFLINE EXTREMO (EXAUSTÃO E MEMORY OUT OF BUCKET)

### A. O Gargalo do Pull Engine Pós 90 Dias Offline
Se um dispositivo de um supervisor ou técnico permanecer offline por 90 a 180 dias (ex: férias longas ou dispositivo de backup guardado em gaveta):
* **O Cenário de Colapso:** Ao ser religado e conectado à internet, o Pull Engine tentará baixar de forma incremental todos os envelopes de sincronismo gerados pelo restante da corporação (100 técnicos) no período. Isso representa mais de **1 milhão de envelopes**.
* **O Comportamento:**
  1. O motor de pull solicitará lotes em loops sucessivos.
  2. A memória RAM do navegador do celular móvel se esgotará ao processar a árvore de indexação local do Dexie.
  3. A aba do navegador sofrerá um crash silencioso por falta de memória (*Out of Memory*), impedindo a abertura do aplicativo e inviabilizando o boot.
* **Mitigação Mandatória (Lookback Limit):** Se a distância de sequence local para a sequence máxima na nuvem for superior a um limite crítico (ex: mais de 10.000 envelopes de diferença), o Pull Engine deve abortar o processamento diferencial reativo e rebaixar a estratégia local para **Bulk Snapshot Download** (baixando diretamente o estado materializado atual das entidades ativas e atualizando o cursor `last_synced_sequence` para o topo da nuvem, pulando a re-execução dos logs de eventos passados).

---

## PARTE 6 — PMOC CORPORATIVO (LENTIDÃO E GARGALOS DE RENDER)

### A. A Escala de 1.000 Ativos em Campo
* **O Gargalo de Render da UI:** Em contratos de PMOC industriais (ex: shopping centers ou hospitais), uma única visita técnica pode envolver a inspeção de mais de 500 ar-condicionados em um dia.
* **O Comportamento de Falha:**
  1. Se a OS técnica contiver 500 checklists em uma única tela, a árvore do DOM do navegador móvel tentará renderizar 500 grupos de campos de texto, inputs de pressão e botões de fotos.
  2. O travamento do navegador será instantâneo (latência de render da UI de vários segundos por toque de tela).
* **Mitigação:** Lazy loading total em nível de interface e paginação de ativos baseada em buscas locais IndexedDB indexadas por ID da máquina.

---

## PARTE 7 — FINANCIAL INTEGRITY (CONFLITOS EM ETAPAS DE FATURAMENTO)

### A. O Risco de Dessincronização de Centros de Custos Offline
* **O Vetor de Falha:** Se um técnico lançar despesas de peças offline no subsolo em uma OS, mas o financeiro cancelou ou alterou o limite orçamentário do contrato corporativo na nuvem às 14:00.
* **O Comportamento:** As despesas do técnico de campo serão integradas localmente e, após a sincronização, forçarão a inserção física de registros financeiros em cima de um contrato já fechado ou estourado.
* **Mitigação:** Congelamento obrigatório da modelagem do `SimpleFinanceRecord` associado à OS no momento em que o status técnico é alterado, bloqueando mutações financeiras retroativas no cliente Dexie.

---

## PARTE 8 — SCALE TEST (CUSTOS E BANCO SUPABASE)

### A. O Custo Oculto da Nuvem Supabase
* **Volume de Conexões WebSocket do Realtime:** Com 1.000 usuários online simultaneamente no fim do expediente para enviar dados operacionais, o Supabase Realtime transmitirá notificações massivas de atualização para todos os dispositivos conectados na mesma empresa.
* **Overhead financeiro:** O tráfego de saída do Supabase (egress data) explodirá financeiramente se os snapshots das OSs e orçamentos forem propagados via WebSocket de forma integral em grandes equipes.
* **Mitigação:** O WebSocket deve ser segmentado por canais de `workspace_id` específicos, de forma a trafegar apenas mensagens mínimas de "sinalização de atualização técnica" (apenas ID de alteração de sequence) sem snapshots acoplados.

---

## PARTE 9 — VEREDICTO DE PRODUÇÃO REAL

Como arquiteto responsável e DRE, a avaliação técnica para início do piloto pago imediato é:

$$\mathbf{VEREDICTO: \text{APROVADO COM RESSALVAS CRÍTICAS (P0 mitigations required)}}$$

A base técnica estruturada nas Fases 1, 2 e 2.6 é impecável sob o ponto de vista de consistência local e resiliência offline. Contudo, ir a campo sem as correções de concorrência e o limitador de lookback de sincronismo resultará em travamento de aplicativos móveis em clientes reais de grande escala.

---

## PARTE 10 — TOP 20 RISCOS REMANESCENTES (RANKING DE PRODUÇÃO)

### RISCOS P0 (BLOQUEADORES DE IMPLEMENTAÇÃO IMEDIATA)
1. **Corrida de sequence na sequence BIGSERIAL uncommitted:** Risco de perda permanente de visibilidade de envelopes de pull se transações concorrentes na nuvem finalizarem fora de ordem.
2. **Crash de Memória por Pull Massivo (Lookback Limit):** Travamento irreversível do browser por exaustão de RAM ao puxar mais de 10.000 envelopes acumulados após longos períodos offline.
3. **Colisão de Checklists JSON Serializados:** Edições concorrentes de múltiplos técnicos sobrescrevendo checklists inteiros de OSs compartilhadas em virtude de representação atômica em JSON.
4. **Evicção de Banco pelo iOS/Android (Safari/Chrome Cleanups):** Apagamento involuntário da base técnica de preventivas IndexedDB offline pelo motor de autolimpeza do sistema móvel.

### RISCOS P1 (CRÍTICOS EM OPERAÇÃO REAL)
5. **Divergência Causal por Alteração de Relógio Móvel (Clock Skew):** Timestamps forjados ou distorcidos no dispositivo destruindo a consistência final no motor LWW da nuvem.
6. **JWT Stale Lockout (Token Expirado Sem Rede):** Impossibilidade de sincronismo de técnico de campo se o refresh token expirar em subsolo de shopping.
7. **DOM Bottleneck em Checklists PMOC Grandes:** Lentidão extrema em telas de vistoria técnica móvel ao carregar mais de 200 ativos na mesma tela sem render virtualizado.
8. **Corrupção de Arquivo SQLite do IndexedDB:** Perda de base operacional local em caso de desligamento súbito do aparelho ou bateria descarregada no meio de gravação Dexie.
9. **Ineficiência de Realtime Sockets:** Estouro de tráfego de rede Supabase se o broadcast WebSocket de sync for transmitido de forma irrestrita a nível de corporação inteira.
10. **Concorrência por Bloqueio de Tabela Dexie:** Interface congelando marginalmente durante operações massivas de escrita e atualização de cache local no IndexedDB.

### RISCOS P2 (OPORTUNIDADES DE MELHORIA / REFACTORING OPERACIONAL)
11. **Divergência Financeira por Falta de Snapshot Imutável:** Lançamentos de despesas de peças offline baseando-se em catálogos de preços desatualizados.
12. **Gargalo de CPU Local no Render de Fotos de Evidência:** Redimensionamento inadequado de imagens travando a thread principal do navegador móvel antes de gerar o payload de sync.
13. **Desalinhamento Regional de Sites Compartilhados:** Alterações de endereços globais de clientes por uma filial quebrando agendamentos de preventivas vigentes de outra.
14. **Conflito de Soft Delete com Tombstone Recente:** Recriação imediata de registro local com a mesma ID de um tombstone recém-compactado localmente.
15. **Overhead de Rede por Polling Desnecessário:** Consumo de rede desnecessário do dispositivo em modo standby caso o fallback híbrido de polling continue ativado sem uso da UI.
16. **Perda de Integridade de Centros de Custos por Soft Delete de Contratos:** Faturamentos pendentes órfãos na sincronização local de contratos que sofreram deleção operacional em outro dispositivo.
17. **Crescimento Exponencial de operationalEvents:** Falta de rotina de autolimpeza forçada local para eventos reconciliados com menos de 90 dias caso a capacidade do IndexedDB se esgote.
18. **Erro de Incompatibilidade de Typings no LWW Snapshot:** Propriedades novas de código TypeScript colidindo com estruturas de snapshots antigos cacheados na nuvem.
19. **Timeout de Sincronismo em Conexões de Altíssima Latência (2G):** Descarte prematuro de conexões legítimas de envio pelo Supabase em locais de campo muito isolados.
20. **Falta de Sandbox Técnico no IndexedDB:** Risco de contaminação cruzada de informações confidenciais financeiras entre filiais devido a vazamento acidental de consultas reativas locais na UI.
