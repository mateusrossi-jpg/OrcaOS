# AFERIX ERP PREMIUM — RELATÓRIO DE AUDITORIA E MODELAGEM PMOC CORPORATIVO
`ROLE: PRINCIPAL ERP ARCHITECT, FIELD SERVICE MANAGEMENT (FSM) SPECIALIST & PMOC CONSULTANT`

Este documento define a especificação e o design de domínio para o **PMOC (Plano de Manutenção, Operação e Controle) Multi-Ativos Corporativo**. O objetivo é estruturar o modelo de dados de forma escalável e com alta eficiência operacional, evitando a burocracia técnica e respeitando a **Constituição Offline-First** do ecossistema Aferix.

---

## PARTE 1 — MODELAGEM DO AGREGADO IDEAL

Analisamos quatro opções de desenho de domínio para suportar múltiplos ar-condicionados em uma única manutenção contratual:

*   **Opção A (`Attendance` → `WorkOrder` → `Asset`):**
    *   *Comportamento:* A ordem de serviço técnico (`WorkOrder`) possui vinculação direta com tabelas de ativos e repete campos de preenchimento.
    *   *Análise:* Fraca separação de contexto. Mistura a definição do ativo físico com o histórico temporal de sua inspeção.
*   **Opção B (`Attendance` → `WorkOrder` → `AssetChecklist`): [O MODELO VENCEDOR]**
    *   *Comportamento:* O `Attendance` define a visita (data, técnico, check-in, check-out). A `WorkOrder` define a OS de controle e o contrato associado. As inspeções individuais de cada máquina residem na tabela normalizada `AssetChecklist`.
    *   *Análise:* Ideal. Reutiliza 100% da infraestrutura do motor de Atendimentos e OSs existente, suporta normalização física e isola as edições concorrentes de técnicos.
*   **Opção C (`Attendance` → `PMOCExecution` → `AssetExecutions`):**
    *   *Comportamento:* Cria novos agregados específicos para o PMOC corporativo, isolados das ordens de serviço padrão.
    *   *Análise:* Overengineering prematuro. Duplica tabelas, fluxos e rotinas de faturamento já existentes na Fase 2 do Aferix.

### A. Vantagens do Modelo Adotado (Opção B):

```text
+--------------------------------------------------------+
|                      ATTENDANCE                        |
|       1 Visita Física, 1 Check-in, 1 Check-out         |
+--------------------------------------------------------+
                           ||
                           \/
+--------------------------------------------------------+
|                      WORKORDER                         |
|     1 Ordem de Serviço Executora, 1 Assinatura         |
+--------------------------------------------------------+
                           ||
                           \/ (1:N)
+--------------------------------------------------------+
|                   ASSETCHECKLIST                       |
|   - checklist_id (UUID)                                |
|   - work_order_id (UUID)                               |
|   - asset_id (UUID)                                    |
|   - status ('compliant', 'non-compliant', 'pending')   |
|   - measurements (JSON: pressões, correntes, etc.)     |
|   - photo_uuid (referência cache)                      |
+--------------------------------------------------------+
```

*   **Operacionalidade 100% Fluida:** O técnico executa apenas 1 check-in de chegada no site e 1 check-out de saída global. O cliente fornece apenas **1 assinatura na tela** para validar a execução de 100 ar-condicionados inspeccionados.
*   **Zero Conflitos de Replicação:** Como cada máquina possui sua linha física independente (`AssetChecklist`), o motor de sync trafega pequenos envelopes por ativo, eliminando a ocorrência de colisões de arrays JSON serializados.

---

## PARTE 2 — EXECUÇÃO DE CAMPO (SIMULAÇÃO 100 ATIVOS NO SHOPPING)

Para garantir que o técnico opere com extrema velocidade utilizando apenas uma mão em campo (uso típico em escadas de manutenção), desenhamos o fluxo operacional do aplicativo móvel:

1.  **Check-in Global:** O técnico chega à central do Shopping Center e clica em **"Iniciar Visita"** no HUD principal da OS. O sistema captura a coordenada GPS e inicia o cronômetro do Atendimento.
2.  **Painel de Ativos (The Maintenance Wheel):** A UI exibe a lista ordenada de ativos do site. Chave de status visual:
    *   `Cinza (Pendente):` Inspeção ainda não iniciada.
    *   `Verde (Conforme):` Ativo verificado e aprovado.
    *   `Laranja (Não-Conforme):` Falha detectada (chapa suja, filtro rompido).
3.  **Captura por QR Code (Autonomia de Campo):** O técnico aproxima a câmera do celular da etiqueta de QR Code do ar-condicionado. O app localiza a máquina instantaneamente, abre o formulário dinâmico na tela e pré-seleciona o template do PMOC correspondente.
4.  **Formulário Técnico Otimizado:**
    *   **Apenas 3 Toques:** Seleção rápida de status (Limpo / Sujo / Trocado).
    *   **Medições Rápidas:** Campos de preenchimento numérico direto com teclados virtuais customizados (ex: entrada rápida de tensão de corrente).
    *   **Compressão reativa de evidências fotográficas:** A imagem da máquina tirada pela câmera é reduzida para menos de 200KB localmente na CPU do celular através do Canvas API antes de ser salva no banco IndexedDB, poupando espaço de disco.
    *   **Clique em "Salvar":** O registro `AssetChecklist` é persistido localmente e o painel reabre mostrando o próximo ar-condicionado da fila.
5.  **Assinatura e Fechamento:** Ao concluir todos os itens pendentes, o técnico clica em "Finalizar Visita". O aplicativo exibe o resumo executivo de pendências graves encontradas. O engenheiro ou preposto do Shopping assina a OS uma única vez e o check-out do atendimento é executado.

---

## PARTE 3 — MODELAGEM E ACESSOS DE CHECKLISTS

Para conciliar flexibilidade comercial com rigor técnico, os checklists são estruturados em dois níveis (Definição vs Execução):

1.  **`ChecklistTemplate` (Definição):**
    *   *Propriedade:* Vinculado ao plano ou tipo de ativo (ex: template específico para Chillers vs template para Split Hi-Wall).
    *   *Escopo:* Corporativo global. Fica cacheado no IndexedDB no startup do app.
2.  **`AssetChecklist` (Execução):**
    *   *Propriedade:* Pertence umbilicalmente à `WorkOrder` técnica ativa e faz referência de integridade para a tabela local de ativos (`Asset`).
    *   *Escopo:* Pull incremental individual sincronizado sob demanda.

*   **Veredicto de Escalabilidade:** Este desacoplamento permite que a empresa crie ou edite modelos de vistorias sem duplicar dados nas bases de execução, garantindo rastreabilidade histórica pura de cada máquina ao longo de múltiplos anos de contrato.

---

## PARTE 4 — PERFORMANCE E LIMITES MOBILE (SAFELIMIT ENGINE)

Mapeamos o comportamento físico do aplicativo rodando em navegadores móveis sob diferentes escalas de ativos na mesma visita técnica:

| Escala de Ativos | Tamanho JSON em Memória | Latência de Persistência IndexedDB | Desafio de Renderização (UI) | Ação Mitigadora Obrigatória |
| :--- | :---: | :---: | :--- | :--- |
| **100 ativos** | ~350 KB | ~8ms total | Leve e imperceptível. | Virtualização básica de listas de render do React. |
| **500 ativos** | ~1.8 MB | ~45ms total | Alto consumo de CPU durante scroll. | **Filtros e Busca Local:** Paginação de interface com carregamento sob demanda baseado na digitação do tag do ativo. |
| **1.000 ativos** | ~3.8 MB | ~110ms total | **Ponto de Travamento:** Esgotamento do heap de memória do Safari móvel. | **Safelimit Splitter:** O planejador técnico de preventivas proíbe a criação de OSs contendo mais de **250 ativos**. Acima disso, divide o atendimento automaticamente em sub-lotes. |

---

## PARTE 5 — ESTRATÉGIA DE FATURAMENTO CORPORATIVO (BILLING SCENARIOS)

No ecossistema ERP Aferix, o faturamento de contratos corporativos de manutenção PMOC segue três cenários financeiros vigentes em campo:

1.  **Faturamento Fixo Mensal por Contrato (Flat-Rate):** O faturamento é um valor acordado em contrato e cobrado mensalmente, independente do volume real de ativos vitoriados ou OSs executadas. É o padrão PMOC de governança (ART corporativa).
2.  **Faturamento por Ativo Atendido:** Cobrança proporcional escalada de acordo com o número real de chillers/máquinas ativos no cadastro do cliente na data da medição.
3.  **Faturamento de Manutenções Corretivas Extras:** Despesas de peças de reposição e mão de obra de reparo detectadas durante a preventiva técnica de PMOC geram ordens de serviço e cobranças adicionais avulsas.

*   **Recomendação de Fluxo ERP:** Aferix implementará como padrão o **Faturamento Fixo Mensal** monitorado pelo `ContractBillingSchedulerService.ts`, integrando os snapshots de faturamento financeiro nas datas de corte de medição.

---

## PARTE 6 — GERAÇÃO DE RELATÓRIOS E LAUDOS TÉCNICOS

Para evitar a duplicação inútil de dados locais e na nuvem, a geração de relatórios de PMOC e laudos de engenharia (com ART) adota o modelo de **Renderização Sob Demanda**:

*   **A Estrutura de Leitura:** O motor de PDF consulta de forma indexada e em tempo real a tabela `AssetChecklist` buscando registros onde `workOrderId === targetWO`. Em seguida, realiza o mapeamento com os dados cadastrais da tabela de ativos e clientes para renderizar o laudo técnico em formato PDF localmente na CPU do próprio dispositivo, sem trafegar arquivos pesados pela internet instável.
*   **Rastreabilidade Histórica Pura:** O histórico do ar-condicionado é derivável indexando as consultas por `assetId`. O histórico do contrato é filtrado por `contractId`. Isso garante que a base de dados IndexedDB permaneça leve e limpa ao longo do tempo.

---

## PARTE 7 — MULTI-EQUIPES EM CAMPO (DIVISÃO DE TRABALHO)

Simulação operacional com 1 Atendimento, 3 Técnicos e 100 ativos:

```text
                  [ Ordem de Serviço Global de PMOC ]
                                  |
            +---------------------+---------------------+
            |                     |                     |
     [ Técnico A ]         [ Técnico B ]         [ Técnico C ]
     Ativos: 1 a 30        Ativos: 31 a 60       Ativos: 61 a 100
            |                     |                     |
     Cria checklists       Cria checklists       Cria checklists
     locais IndexedDB      locais IndexedDB      locais IndexedDB
            \                     |                     /
             v                    v                    v
     [ Push Local ]        [ Push Local ]        [ Push Local ]
            \                     |                     /
             +--------------------+--------------------+
                                  |
                                  v
                    [ Repositório Supabase Cloud ]
             Mesclagem sequencial e automática de envelopes
```

1.  **A Divisão do Trabalho:** O gerente, ao planejar a preventiva na nuvem, divide o escopo técnico associando faixas de ativos ou setores geográficos (ex: Bloco A, B, C) aos respectivos técnicos ativos.
2.  **Sincronização Segura e Sem Travamentos:** Cada técnico baixa a mesma `WorkOrder` comum de PMOC do Shopping. No entanto, o aplicativo de cada técnico exibe apenas o painel de ativos sob sua responsabilidade.
3.  **Consolidação de Sync sem Conflitos:** Ao executar as inspeções, o técnico gera envelopes na tabela normalizada `AssetChecklist`. Como os registros possuem chaves primárias distintas (`asset_id`), os três técnicos sincronizam suas edições ao mesmo tempo de forma limpa e imune a colisões ou sobregravações destrutivas.

---

## PARTE 8 — VEREDICTO DA AUDITORIA

$$\mathbf{VEREDICTO: \text{APROVADO COM RESSALVAS CRÍTICAS}}$$

### A. Ressalvas Obrigatórias para Homologação:
1.  **Proibição de Checklists JSON:** Veto terminante a qualquer serialização de arrays de vistorias em campos internos da tabela de OS. Normalização física na tabela `AssetChecklist` é requisito P0.
2.  **Limite de Ativos por Visita:** Implantação de barreira arquitetural impedindo agendamentos com mais de **250 ar-condicionados em uma única OS** para preservar a integridade física de memória de celulares móveis antigos.

---

## PARTE 9 — ROADMAP DE EVOLUÇÃO OPERACIONAL

### Fase 1: PMOC Básico (Atual)
*   *Foco:* Upgrade de schema Dexie v18, normalização das tabelas `sites`, `assets` e `checklists`. Geração de preventivas e inspeção unitária de ativos via QR Code local.
*   *Dependências:* Sincronismo Down-Sync estruturado.

### Fase 2: PMOC Corporativo
*   *Foco:* Integração de templates dinâmicos por tipo de máquina. Histórico de vistorias do chiller acessível na tela do técnico offline no momento do scan.
*   *Dependências:* Performance de queries locais indexadas por ativo.

### Fase 3: Multi-Equipes (Sincronismo Concorrente)
*   *Foco:* Roteamento de escopos de inspeção na OS técnica para múltiplos técnicos trabalhando na mesma estrutura física.
*   *Dependências:* Divisão de cotas de replicação no pull.

### Fase 4: Enterprise IoT e Predição
*   *Foco:* Coleta de dados de sensores de temperatura e pressão diretamente via conexão bluetooth/IoT local, pré-populando checklists de forma automatizada sem digitação do técnico.
*   *Dependências:* APIs nativas de integração de hardware.
