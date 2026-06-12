# INTEGRAÇÃO ATIVOS ↔ OS (CLIENT360)

Este documento especifica a engenharia de integração e ciclo de vida entre **Equipamentos (Ativos)** e **Ordens de Serviço (OS)** no Aferix, descrevendo o fluxo de dados em campo, histórico imutável e consolidação de evidências.

---

## 1. CICLO DE VIDA DO EQUIPAMENTO NA ORDEM DE SERVIÇO

O fluxo operacional do técnico segue um pipeline sequencial e reativo de dados:

```
[OS Criada] 
    ↓ (Site-First: puxa siteId)
[Filtro de Equipamento] 
    ↓ (Lista de ativos instalados no Site do Cliente)
[Seleção & Escopo] 
    ↓ (Técnico seleciona quais ativos receberão manutenção)
[Execução Checklist & Medições] 
    ↓ (Preenchimento das diretrizes e telemetria por Ativo)
[Evidências & Fotos] 
    ↓ (Imagens vinculadas diretamente à execução do ativo)
[Checkout & Assinatura] 
    ↓ (Aceite técnico e do cliente assinam o encerramento)
[Histórico Consolidado] 
    ↓ (Geração do snapshot imutável de execução)
```

---

## 2. RESPOSTAS ÀS PERGUNTAS ARQUITETURAIS

### A. Um equipamento pode participar de múltiplas OS?
* **Sim**. A relação física-lógica de um equipamento é persistente no tempo (`Asset`). Cada vez que ele sofre uma intervenção em uma OS diferente, o sistema cria um registro único na entidade associativa `AssetExecution` (Tabela `assetExecutions`).
* **Estrutura**: `1 Asset ─── 0..N AssetExecution ─── 1 WorkOrder`

### B. Como o histórico é consolidado?
* O histórico é consolidado em tempo de leitura (*read model*) consultando todos os registros de execução vinculados à chave primária do ativo.
* **Query de Consolidação (Local-First)**:
  ```typescript
  const executions = await db.assetExecutions.where('assetId').equals(targetAssetId).toArray();
  const sortedHistory = executions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  ```
* Cada linha do histórico exibe: Data da execução, Título da OS, Checklist preenchido, Anomalias encontradas e as recomendações técnicas do dia.

### C. Como medições são armazenadas?
* São armazenadas de forma flexível usando um dicionário de chave-valor (`JSON` / `Record<string, any>`) dentro do campo `measurements` na tabela `assetExecutions`.
* **Exemplo de Carga Útil (Payload)**:
  ```json
  "measurements": {
    "voltage_l1_l2": 220,
    "current_compressor_1": 14.5,
    "superheating_k": 6.2,
    "filter_cleaned": true
  }
  ```
* Isso permite que categorias diferentes (Elétrica, Climatização, CFTV) persistam dados sem a necessidade de migrações complexas de banco.

### D. Como evidências ficam associadas?
* Cada foto capturada em campo é gravada localmente no banco ou no Supabase Storage recebendo um UUID estável. Os IDs das imagens são guardados no vetor `photoUuids: string[]` dentro do `AssetExecution` correspondente.
* Isso garante que as fotos fiquem atreladas àquela execução específica do ativo, evitando mistura de evidências antigas e novas.

### E. Como recomendações futuras ficam vinculadas?
* O campo `recommendation` (texto livre) no `AssetExecution` guarda o parecer do técnico para aquele ativo.
* Se o resultado do checklist for rotulado como **Não-Conforme** (`non-compliant`), a mutação do `operationalFacade` cria automaticamente um registro na tabela `anomalies` vinculada ao Ativo e Cliente, alertando o painel de faturamento/vendas para geração de uma nova proposta de reparo.

---

## 3. MODELO DE RELACIONAMENTO: `WorkOrder ↔ Asset`

A relação direta de escopo técnico de execução é modelada através de uma tabela de junção implícita ou explícita em IndexedDB:

1. **Associação por Escopo (`WorkOrder.assetIds`)**:
   Vetor de IDs de equipamentos que precisam ser vistoriados no atendimento.
   ```typescript
   interface WorkOrder {
     id: string;
     assetIds: string[]; // IDs dos Ativos vinculados
     // ...
   }
   ```

2. **Associação por Execução (`AssetExecution`)**:
   Entidade rica que conecta de fato a OS ao Ativo no momento em que a manutenção física é iniciada, carregando dados específicos da intervenção:
   ```typescript
   interface AssetExecution {
     id: string;
     workOrderId: string; // FK para db.workOrders
     assetId: string;     // FK para db.assets
     checklistResults: ChecklistItemResult[];
     measurements: Record<string, any>;
     recommendation?: string;
     photoUuids?: string[];
   }
   ```
