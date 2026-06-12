# AFERIX ERP PREMIUM — RELATÓRIO DO CONSELHO ARQUITETURAL: RED TEAM FINAL AUDIT (FASE 3)
`STATUS: CONGELADO E HOMOLOGADO | UX EXECUTION MANDATE | BUSINESS FOCUS`
`AUTORES: PRINCIPAL SOFTWARE ARCHITECT, DISTRIBUTED SYSTEMS ENGINEER, ERP PRODUCT ARCHITECT & B2B SAAS CTO`

Este documento apresenta o parecer final e definitivo de governança e priorização de engenharia para o Aferix ERP Premium. Sob a ótica pragmática de viabilidade comercial, riscos de produção, segurança jurídica (LGPD) e estabilidade financeira, separamos as deficiências reais de produção do perfeccionismo arquitetural (overengineering), estabelecendo a fundação necessária para vender o produto para clientes reais nos próximos 6 meses.

---

## ETAPA 1 — PRIORIZAÇÃO REAL DE RISCOS (BUSINESS ENGINE REVIEW)

Analisamos e priorizamos as propostas técnicas de forma rigorosa e sem vieses acadêmicos:

| Item | Impacto | Risco | Probabilidade | Complexidade | Prioridade | Justificativa de Engenharia |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **A. Ausência de Down-Sync** | **Catastrófico** | **Crítico** | 100% | Alta | **P0** | **Bloqueador Absoluto.** Sem down-sync, o técnico não recebe atualizações ou OSs atribuídas na retaguarda. |
| **B. Ausência de Tenancy Raiz** | **Catastrófico** | **Crítico** | 100% | Média | **P0** | **Bloqueador Absoluto.** Sem `companyId` no IndexedDB e Supabase RLS, há vazamento catastrófico de dados e violação grave da LGPD. |
| **C. Ausência de `anomalyId`** | Médio | Baixo | Alta | Baixa | **P1** | **Importante.** Melhora a rastreabilidade comercial, mas o MVP de preventivas opera normalmente com faturamento fixo mensal contratual. |
| **D. LWW por Timestamp Físico** | Alto | Alto | Média | Média | **P1** | **Importante.** Desvios de relógio de celulares podem sobrescrever dados online. Requer contingência em background (NTP check). |
| **E. Pull Engine por sequence** | **Catastrófico** | Baixo | Baixa | Baixa | **P0** | **Crítico.** A sequence baseada em `BIGSERIAL` é simples e robusta, mas exige buffer contra concorrência uncommitted. |
| **F. PMOC Multi-Ativos** | **Catastrófico** | **Crítico** | 100% | Média | **P0** | **Bloqueador Comercial.** Abrir 100 OSs e 100 assinaturas em visitas de Shopping Center inviabiliza o uso em campo. |
| **G. Asset Health Score** | Baixo | Baixo | Mínima | Média | **P2** | **Melhoria.** Excelente argumento de vendas e marketing, mas sem valor técnico crítico no primeiro dia. |
| **H. AssetTelemetryLog (IoT)** | Baixo | Baixo | Nula (12m) | Alta | **OVER** | **Overengineering.** Sem sensores IoT em campo, criar tabelas de séries temporais é desperdício de esforço. |
| **I. RBAC Local no Dexie** | Médio | Baixo | Baixa | Média | **P1** | **Importante.** Bloquear técnicos de ver finanças na UI via roteador de visualização atende a 95% do requisito prático. |
| **J. Criptografia IndexedDB** | Baixo | Baixo | Mínima | Altíssima | **OVER** | **Overengineering.** O celular tem criptografia nativa de disco (iOS/Android). Não há ROI que justifique a lentidão de CPU local. |
| **K. Snapshotting a cada 50 eventos**| Baixo | Baixo | Baixa | Alta | **OVER** | **Overengineering.** A compactação de fila de eventos (`compactSyncedEvents`) já limpa o IndexedDB de forma excelente. |
| **L. Multi-Equipes (Cotas Sync)** | Médio | Baixo | Média | Alta | **P1 / P2** | **Evolutivo.** Para os primeiros 50 clientes (pequenos), um técnico carregar OSs de outros técnicos na base local é tolerável. |

---

## ETAPA 2 — DETECÇÃO DE OVERENGINEERING (O QUE PODE ESPERAR)

Adotamos a diretriz de **Corte de Gordura Arquitetural** para acelerar a entrega do piloto comercial:

1.  **O que NÃO deve ser implementado agora (Vetado):**
    *   *Criptografia Local do IndexedDB:* Altíssimo consumo de bateria e latência de escrita no celular do técnico para proteger dados que já são criptografados pelo sistema operacional do aparelho.
    *   *Snapshotting Complexo no IndexedDB:* A compactação automática de filas operacionais (`operationalEvents`) mantém o banco local em tamanho estável de forma muito mais simples.
2.  **O que pode esperar 12 meses (Homologado para Fase 4):**
    *   *Multi-Equipes com Particionamento Rígido de Replicação:* Um técnico baixar dados operacionais extras da mesma empresa no IndexedDB não quebra a operação. O RLS Supabase no nível corporativo já garante o isolamento entre empresas.
    *   *Uso de IA e Preditiva:* O preenchimento clássico estruturado do PMOC é o que gera valor imediato de faturamento e conformidade legal.
3.  **O que pode esperar 24 meses:**
    *   *Integração IoT e Telemetria Temporal:* Só deve ser iniciada quando houver contratos corporativos que exijam explicitamente a conexão física de sensores de pressão bluetooth em Chillers industriais.

---

## ETAPA 3 — AUDITORIA DE VIABILIDADE COMERCIAL (ESCALABILIDADE VIGENTE)

Simulamos o crescimento comercial e ordenamos os gargalos de colapso físico de ponta a ponta da infraestrutura:

### A. Escala de 50 Clientes Pagantes (MVP inicial):
*   *Comportamento:* Volume total aproximado de 1.000 OSs/mês.
*   *O Gargalo:* **Nenhum.** O sistema opera folgado. O banco de dados Supabase na camada gratuita atende à demanda.

### B. Escala de 500 Clientes Pagantes (Média escala):
*   *Comportamento:* Volume aproximado de 15.000 OSs/mês e ~500.000 envelopes de sincronismo gerados.
*   *Componentes que Quebram Primeiro:*
    1.  **Sync (Down-Sync):** A ausência de limitação de lookback causará travamento em dispositivos móveis lentos que ficarem online pós feriados se tentarem puxar mais de 5.000 envelopes na mesma transação.
    2.  **Infraestrutura Supabase:** Conexões de banco concorrentes saturarão as cotas padrões. Exige migração para planos pagos e poolers de conexão (PgBouncer).
    3.  **Segurança (RLS):** Queries lentas no Postgres se o RLS depender de JOINs na tabela de envelopes. Mitigado mantendo o `company_id` físico e direto em todas as tabelas na nuvem.

### C. Escala de 5.000 Clientes Pagantes (Alta escala corporativa):
*   *Comportamento:* Mais de 200.000 OSs/mês.
*   *Componentes que Quebram Primeiro:*
    1.  **Sync (WebSocket Fan-out):** O broadcast reativo realtime em nível corporativo total inundará os canais de rede móvel dos técnicos. Exige particionamento de tópicos de WebSocket no nível de `workspace_id`.
    2.  **Banco Local (IndexedDB):** Excesso de histórico de vistorias passadas acumuladas em aparelhos de baixo armazenamento local. Exige rotinas severas de compactação diferencial local.

---

## ETAPA 4 — AFERIX MVP ENTERPRISE (O CHECKLIST REAL)

Esta é a definição estrita e sem firulas do que precisa existir no dia zero do piloto comercial:

```text
==========================================================================================
MVP ENTERPRISE CHECKLIST
==========================================================================================
[ ] OBRIGATÓRIO (P0)         | [ ] IMPORTANTE (P1)        | [ ] FUTURO (P2)
- companyId em agregados     | - anomalyId em orçamentos  | - Asset Health Score
- Supabase RLS ativo         | - RBAC na UI (Views)       | - Sockets com cotas de rede
- Down-Sync sequence+buffer  | - LWW Property Merge local | - IA e Preditiva
- PMOC 1 Visita -> N Ativos  | - Cache de fotos local     | - Conexão IoT local
- Reset de segurança local   | - Relatório PDF local      | - Multi-equipes cotas rígidas
==========================================================================================
```

---

## ETAPA 5 — ROADMAP REALISTA DE ENGENHARIA (CONGELADO)

```text
==========================================================================================
                                    ROADMAP REALISTA
==========================================================================================
Sprint P0: Tenancy, Sync & PMOC  --->  Sprint P1: Rastreabilidade, RLS  --->  Sprint P2: Escala
==========================================================================================
```

### Sprint P0 (Bloqueantes de Produção e Perda de Dados)
*   **Ações:**
    1.  Upgrade Dexie para Versão 18: Injeção de `companyId` nos agregados operacionais raiz.
    2.  Implementação do Down-Sync Engine no `CloudSyncService.ts` com cursor `BIGSERIAL` e tratamento de loops (`device_id`).
    3.  Transição do motor de preventivas PMOC para N Ativos -> 1 OS -> N Checklists.
    4.  Validação de startup com reset do IndexedDB em caso de login de outra empresa (*Wipeout de segurança*).

### Sprint P1 (Estabilização Comercial e RLS)
*   **Ações:**
    1.  Deploy definitivo de Supabase RLS e triggers de segurança na nuvem para blindagem multiempresa total.
    2.  Adição de `anomalyId` em budgets e OS corretivas para viabilizar rastreamento básico de faturamento.
    3.  Algoritmo local de **Property-Level LWW Merge** no IndexedDB para mitigar colisões em locais de sinal instável.
    4.  Criação do motor local de PDF sob demanda reunindo as vistorias do site.

### Sprint P2 (Escalabilidade e Visão Futura)
*   **Ações:**
    1.  Segmentação de tópicos WebSocket do Realtime por filial (`workspace_id`).
    2.  Criação de limitador de lookback no Pull Engine (Bypass para Bulk Snapshot se o atraso for catastrófico).
    3.  Metadados de ciclo de vida do ativo para início de telemetrias avançadas.

---

## PARECER FINAL DE VIABILIDADE TÉCNICA E COMERCIAL

$$\mathbf{VEREDICTO \ CONSOLIDADO: \text{APROVADO COM RESSALVAS CRÍTICAS}}$$

O Aferix ERP Premium possui um design offline-first robusto e de alta performance local, garantindo resiliência operacional em locais sem internet. As ressalvas exigidas limitam-se ao corte de overengineering prematuro (como criptografia local do IndexedDB e IoT prematura) e à concentração total no **Down-Sync incremental, RLS seguro na nuvem e PMOC multi-ativos otimizado em campo**. Com este checklist do MVP Enterprise, o produto está pronto para ser comercializado e executado com risco aceitável em larga escala.
