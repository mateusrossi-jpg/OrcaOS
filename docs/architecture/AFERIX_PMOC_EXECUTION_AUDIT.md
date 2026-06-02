# AFERIX ERP PREMIUM — REVISÃO E ESTUDO DE DOMÍNIO: PMOC EXECUTION
`ROLE: PRINCIPAL DOMAIN ARCHITECT, FIELD SERVICE MANAGEMENT (FSM) SPECIALIST & ENTERPRISE WORKFLOW DESIGNER`

Este documento apresenta a análise técnica profunda de arquitetura de domínio para o ciclo de execução de preventivas, comparando a modelagem orientada a tarefas simples com a modelagem semântica corporativa de longo prazo. O objetivo é assegurar que a fundação construída hoje suporte com facilidade a expansão multissegmento do ERP Aferix (facilities, elétrica, geradores, elevadores) e a integração de inteligência artificial nos próximos 5 a 10 anos.

---

## PARTE 1 — ANÁLISE COMPARATIVA DE DOMÍNIO

Avaliamos dois modelos semânticos distintos para gerenciar a inspeção e manutenção de ativos no Field Service:

```text
==========================================================================================
MODELO A: ORIENTADO A TAREFAS (TASK-CENTRIC)
==========================================================================================
Attendance  -->  WorkOrder  -->  AssetChecklist (Entidade Genérica / Formulário)
                                   |
                                   +-- status, measurements (JSON), photo_uuid
==========================================================================================
MODELO B: ORIENTADO A EXECUÇÃO SEMÂNTICA (EXECUTION-CENTRIC)
==========================================================================================
Attendance  -->  WorkOrder  -->  AssetExecution (Registro de Execução de Engenharia)
                                   |
                                   +-- checklists (Array / Relação de Tarefas)
                                   +-- measurements (Valores Físicos Normalizados)
                                   +-- anomalies (Eventos de Falha / Anomalias)
                                   +-- recommendations (Parecer Técnico)
                                   +-- photos (Evidências de Campo)
==========================================================================================
```

### Comparação Arquitetural Detalhada

| Critério de Avaliação | Modelo A: `AssetChecklist` | Modelo B: `AssetExecution` [VENCEDOR] |
| :--- | :--- | :--- |
| **Abstração de Negócio** | Enxerga a manutenção como um questionário de perguntas e respostas (checklist). | Enxerga a manutenção como uma intervenção de engenharia no ativo (`AssetExecution`). |
| **Flexibilidade Multissegmento** | Baixa. Força a modelagem de testes complexos (ex: teste de carga de elevador ou medição de bobina de gerador) como simples itens de checklist. | Altíssima. Suporta estruturas ricas de medições, relatórios fotográficos e anomalias de forma nativa e tipada. |
| **Rastreabilidade e Evolução** | Difícil. Dados técnicos valiosos ficam presos dentro de blobs JSON dinâmicos difíceis de consultar por SQL. | Excelente. Chaves específicas como `anomalies` e `measurements` possuem colunas e tabelas indexadas no banco. |
| **Manutenção Futura** | A longo prazo, a tabela genérica acumula "dívida semântica" à medida que novos segmentos de negócios são adicionados. | Altamente estruturado. Cada segmento de manutenção apenas estende a interface comum de execução do ativo. |

---

## PARTE 2 — SIMULAÇÃO DE HISTÓRICO (ATIVO #AC-001 EM 12 MESES)

Simulamos o ciclo de vida do aparelho de ar-condicionado **Chiller #AC-001** sob 12 visitas preventivas de PMOC ao longo do ano:

### A. A Recuperação de Dados sob o Modelo A (`AssetChecklist`):
* Para buscar o histórico e a reincidência de falhas, a aplicação precisa realizar queries de texto em campos genéricos ou parsear strings dentro de blobs JSON na memória em JS:
  ```typescript
  // Complexo e ineficiente em grandes volumes
  const records = await db.checklists.where({ assetId: 'AC-001' }).toArray();
  const failures = records.filter(r => r.measurements.pressure > 120);
  ```
  * **Problema:** A indexação de propriedades de telemetria específicas (como pressão ou corrente elétrica) é impossível no IndexedDB local sob o modelo genérico.

### B. A Recuperação de Dados sob o Modelo B (`AssetExecution`):
* As falhas e medições são dados de primeira classe. A consulta é direta e indexável:
  ```typescript
  // Rápido e indexado nativamente pelo IndexedDB
  const executions = await db.assetExecutions.where({ assetId: 'AC-001' }).toArray();
  const pressureEvolution = executions.map(e => ({ date: e.createdAt, value: e.measurements.suctionPressure }));
  const persistentAnomalies = executions.filter(e => e.anomalyType === 'COMPRESSOR_OVERHEATING');
  ```
  * **Vantagem:** Permite plotar gráficos de evolução de telemetria e desgaste preventivo da máquina instantaneamente na tela do tablet do supervisor.

---

## PARTE 3 — PREPARAÇÃO PARA IA FUTURA E MANUTENÇÃO PREDITIVA

O modelo de dados escolhido determina se a inserção de inteligência artificial na plataforma nos próximos anos será nativa ou demandará refatoração completa do banco.

*   **IA de Recomendação sob o Modelo A (`AssetChecklist`):**
    Para rodar um modelo LLM ou rede preditiva que sugira substituição de peças, seria necessário exportar blobs de questionários não estruturados, exigindo pré-processamento pesado e caro de mineração de texto (*text mining*) para extrair o que foi falha real e o que foi resposta padrão de checklist.
*   **IA de Recomendação sob o Modelo B (`AssetExecution`):**
    Como o modelo isola `anomalies` e `measurements` estruturados, o pipeline de dados alimenta o modelo de predição diretamente. A IA calcula o **Score de Saúde do Ativo (Health Score)** de forma nativa e prediz falhas mecânicas com precisão correlacionando picos de corrente elétrica histórica com registros de anomalias anteriores.

---

## PARTE 4 — VALIDAÇÃO E GERAÇÃO DE RELATÓRIOS CORPORATIVOS

Para emitir relatórios técnicos sem duplicação de dados, o **Modelo B (`AssetExecution`)** provê a fundação perfeita:

1.  **Laudo Técnico PMOC:** A nuvem ou o motor local PDF compila as `AssetExecutions` do mês. O laudo exibe as medições consolidadas e destaca de forma executiva a seção de `anomalies` (não-conformidades encontradas que necessitam de orçamento corretivo).
2.  **Relatório Executivo de Facilities:** O gestor do Shopping Center visualiza um painel consolidado listando os ativos mais críticos baseado na incidência de `anomalias` persistentes geradas nas execuções.

---

## PARTE 5 — MULTI-PROFISSÃO (EXPANSÃO DO ERP AFERIX)

Simulamos o crescimento comercial do Aferix ERP Premium para novos segmentos de prestação de serviços técnicos:

*   **Climatização (PMOC):** Medições de superaquecimento, subresfriamento, pressão e corrente.
*   **Geradores Industriais:** Medição de nível de diesel, temperatura do bloco, teste de partida de bateria, frequência (Hz).
*   **Elevadores / Facilities:** Teste de freio de segurança, desgaste de cabo de aço, lubrificação de guias.

Sob o **Modelo B (`AssetExecution`)**, a entidade de execução de ativos permanece idêntica. Cada segmento técnico apenas pluga seu respectivo `template` de teste específico no campo `measurements` e normaliza as anomalias por categoria, garantindo que o ERP sobreviva com louvor à diversificação comercial sem quebra de banco de dados ou refatoração de código.

---

## PARTE 6 — DECISÃO ARQUITETURAL DEFINITIVA

$$\mathbf{VEREDICTO: \text{APROVADO COM RECOMENDAÇÃO TÉCNICA DEFINITIVA}}$$

Se estivéssemos construindo um ERP SaaS Corporativo para liderar o mercado nos próximos 10 anos, a escolha óbvia e obrigatória de domínio é:

$$\mathbf{ASSET\_EXECUTION \quad [MODELO \ B]}$$

### Justificativa Técnica de Arquitetura:
Tratar a inspeção técnica de ativos meramente como "respostas de um checklist genérico" (`AssetChecklist`) é um atalho de engenharia de curto prazo que cobra juros altos à medida que o ERP cresce em direção a contratos de manutenção predial complexa, faturamento por medições de engenharia e inteligência preditiva. 

A introdução da entidade semântica de primeira classe **`AssetExecution`** eleva o domínio a um nível profissional de Engenharia de Manutenção (Asset Performance Management - APM), isolando com precisão os relatórios de anomalias, assinaturas temporais e telemetria de medições, garantindo performance de queries locais e uma base de dados limpa.

---

## ROADMAP DE EVOLUÇÃO DO DOMÍNIO PMOC

```text
+-----------------------------------------------------------------------------------+
|                        LINHA DO TEMPO DE EVOLUÇÃO DO DOMÍNIO                      |
+-----------------------------------------------------------------------------------+
| SPRINT 1-2: Tenancy & Pull  | SPRINT 3: AssetExecution Core | SPRINT 4: Relatórios|
| - Isolamento multiempresa   | - Normalização de tabelas     | - Geração local PDF |
| - Cursor BIGSERIAL          | - Anomalias e Pareceres       | - Histórico de Ativo|
+-----------------------------------------------------------------------------------+
```

1.  **Sprint 3 (PMOC Execution Core):** Refatorar a interface local e o Dexie para suportar a tabela física `assetExecutions` (ID da OS, ID do Ativo, JSON de Medições, Tipo de Anomalia, Parecer Técnico) em substituição de chaves JSON dentro da OS.
2.  **Sprint 4 (Relatórios Locais):** Desenvolver o motor reativo local PDF que consome o histórico estruturado de `assetExecutions` para gerar a folha de PMOC mensal em formato PDF homologado pela Vigilância Sanitária em menos de 3 segundos offline.
