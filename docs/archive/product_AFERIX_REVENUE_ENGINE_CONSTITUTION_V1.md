# AFERIX REVENUE ENGINE CONSTITUTION V1
**CONGELAMENTO DO DOMÍNIO DA MÁQUINA DE RECEITA**

## 1. Revenue Engine Constitution
A arquitetura do Aferix a partir de hoje reconhece a Anomalia não como uma falha operacional, mas como o gatilho primário de faturamento (Inbound Lead). Qualquer quebra nesta cadeia (como exigir do dono copiar fotos do WhatsApp para um gerador de PDF) é considerada uma falha crítica de arquitetura. O fio de ouro deve ser ininterrupto: **Detecção → Orçamento → Aprovação Digital → Execução.**

---

## 2. Domain Freeze (Entidades e Agregados)

### A. Entidade: `Anomaly`
Não é um mero campo de texto no checklist. É um agregado de domínio de primeira classe.
**Campos Obrigatórios:** `id` (UUIDv4), `companyId`, `workspaceId`, `assetId`, `assetExecutionId` (A origem), `description`, `status`.
**Campos Opcionais:** `recommendation`, `photoUuids` (array), `convertedToProposalId`, `resolvedByWorkOrderId`.
**Índices Dexie:** `[companyId+status]`, `assetId`, `assetExecutionId`.
**Índices Postgres:** `company_id`, `status`, `asset_id`.

### B. Entidade: `Proposal` (O Agregado Principal)
*Decisão: Usaremos `Proposal` em vez de `Budget`.*
*Justificativa:* "Budget" (Orçamento) soa como estimativa de custo de padaria. "Proposal" (Proposta Comercial B2B) carrega escopo, evidências fotográficas, cronograma e termos de aceite jurídico. Gera menos atrito e soa Premium.
**Campos Obrigatórios:** `id`, `companyId`, `workspaceId`, `clientId`, `siteId`, `title`, `totalAmount`, `status`.
**Campos Opcionais:** `originAnomalyId`, `validUntil`, `approvedAt`, `approvedBySignatureUrl`, `clientPortalToken` (UUID para link mágico).

### C. Entidade: `ProposalItem`
**Campos:** `id`, `proposalId`, `description`, `quantity`, `unitPrice`, `totalPrice`.

---

## 3. Entity Relationship Diagram (O Fio de Ouro)
A rastreabilidade total é garantida pela passagem de UUIDs (*Foreign Keys* suaves no Dexie, Fortes no Supabase).

`Client` (1) ---> (N) `Site` (1) ---> (N) `Asset`
`Asset` (1) ---> (N) `AssetExecution` (Ato do Checklist)
`AssetExecution` (1) ---> (N) `Anomaly` (Nasce o Fio de Ouro)
`Anomaly` (1) ---> (1) `Proposal` (A Anomalia passa a ter um preço)
`Proposal` (1) ---> (1) `WorkOrder` (Corretiva após Aprovação)
`WorkOrder` (1) ---> (1) `Invoice/Payment` (O fim do ciclo: Dinheiro na conta).

---

## 4. Event Architecture (Event Bus)
Eventos oficiais que trafegam pelo sistema:
*   `ANOMALY_DETECTED`: Disparado pelo app do técnico. (Consumidor: Painel do Gestor para piscar alerta).
*   `PROPOSAL_DRAFTED`: Disparado quando o gestor clica em "Orçar".
*   `PROPOSAL_SENT`: Disparado quando o WhatsApp abre o link mágico.
*   `PROPOSAL_APPROVED`: Disparado pelo clique do cliente no Portal Web. (Consumidor Crítico: Motor de OS para gerar a Corretiva).
*   `WORK_ORDER_CREATED`: Disparado pela aceitação da proposta.
*   `ANOMALY_RESOLVED`: Disparado quando a OS corretiva é assinada pelo técnico.

---

## 5. State Machines (Transição de Estados)

### `AnomalyStatus`
1.  **`OPEN`**: Criada pelo técnico. O gestor ainda não viu.
2.  **`QUOTED`**: Proposta foi gerada. O dinheiro está na mesa.
3.  **`APPROVED`**: Cliente aceitou. Aguardando técnico ir ao local.
4.  **`REJECTED`**: Cliente recusou. Histórico salvo para isenção de culpa se a máquina pegar fogo.
5.  **`RESOLVED`**: OS Corretiva finalizada com sucesso.

### `ProposalStatus`
1.  **`DRAFT`**: Gestor precificando.
2.  **`SENT`**: Link gerado e enviado.
3.  **`APPROVED`**: Assinatura/Aceite digital capturado.
4.  **`REJECTED`**: Cancelada pelo cliente.

---

## 6. Zero Redigitação (Conversão Automática)
Quando o Gestor clica em `[Gerar Proposta]` na Anomalia, o Aferix faz o merge de dados automaticamente:
*   `Proposal.clientId` = Puxa do `Anomaly.assetId -> site -> client`.
*   `Proposal.title` = "Proposta de Correção: " + Nome do Ativo.
*   `Proposal.Description` = Puxa `Anomaly.description` + Injeta `Anomaly.photoUuids` no corpo da proposta.
*   `ProposalItem[0]` = Puxa `Anomaly.recommendation` (Ex: "Troca do Compressor").
*   O gestor só tem um trabalho: Digitar o Valor (R$) e Salvar. Fim.

---

## 7. Approval Portal Architecture (Portal do Cliente)
O cliente não recebe um PDF estático. Ele recebe: `cliente.aferix.com/p/token-magico`.
*   **O que ele vê:** Logo da sua empresa de manutenção. Título. Bloco de Evidências (as fotos tiradas pelo técnico hoje cedo com a seta vermelha apontando o defeito). Resumo da Solução e Valor Total.
*   **O que ele NÃO vê:** Custos internos da sua empresa, marcações sistêmicas irrelevantes, chat interno dos técnicos.
*   **Como aprova:** Ele clica em `[APROVAR PROPOSTA]`, digita o nome e desenha a assinatura com o dedo no celular dele. 

---

## 8. WorkOrder Conversion Engine
A aprovação do cliente aciona um gatilho.
Um Job em background (ou no Frontend do Gestor via Eventos Dexie) lê `PROPOSAL_APPROVED` e imediatamente:
*   Cria uma `WorkOrder` com tipo `CORRECTIVE`.
*   Preenche o Endereço, o Cliente e o Ativo.
*   Anexa o Link da Proposta na OS (para o técnico saber o que foi vendido).
*   Muda o status da Anomalia para `APPROVED`.

---

## 9. Database & Dexie Changes
**Dexie Schema V19:**
Adicionar tabelas: `anomalies`, `proposals`, `proposalItems`.
**Supabase Schema:**
Replicar tabelas idênticas para o Sync. Criar RLS (Row Level Security) focado no `companyId` para proteger orçamentos contra vazamento entre *tenants*.

---

## 10. UX de Campo (Menos de 15 Segundos)
Bottom Sheet do Técnico ao marcar "Não Conforme":
1.  Botão Gigante: `[ 📷 TIRAR FOTO ]`
2.  Botão Gigante: `[ 🎙️ GRAVAR RECOMENDAÇÃO (Texto automático) ]`
3.  Botão: `[ SALVAR ]`
Apenas isso. Sem teclados frustrantes. 15 segundos precisos.

---

## 11. P0 Roadmap (O Caminho Crítico)
1.  **Domain & DB (Semana 1):** Criar as tabelas `Anomaly` e `Proposal` no Dexie e Supabase.
2.  **Field UX (Semana 1):** Bottom sheet na execução do checklist (gravar a anomalia atrelada ao `assetId`).
3.  **Manager UX (Semana 2):** Lista de "Anomalias Abertas" na Home do gestor.
4.  **Auto-Proposal (Semana 2):** Botão Mágico (Gera a Proposta a partir da Anomalia copiando fotos e textos).
5.  **Client Portal MVP (Semana 3):** Rota pública do Vite que lê a Proposta via Supabase (Anonymous Key) e captura o clique "APROVADO".

---

## 12. Final Executive Verdict
Como CEO, CFO e Arquiteto, a conclusão é singular: **Esta é a funcionalidade mais valiosa já desenhada para o Aferix.** 
Se implementarmos isso, o Aferix deixa de ser um "Centro de Custo" para a empresa de manutenção e passa a ser um **Vendedor Silencioso e Implacável**. Nós eliminamos o "limbo" onde orçamentos corretivos morrem por preguiça ou esquecimento de redigitar mensagens no WhatsApp. 

O domínio está congelado. O fio de ouro está traçado desde o milissegundo do "clique vermelho" do técnico até o "clique verde" da carteira do cliente. Avançar para implementação técnica de banco e eventos.
