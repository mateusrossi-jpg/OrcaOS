# AFERIX ANOMALY DOMAIN
**Schema e UX de Captura de Oportunidades**

## 1. Dexie Schema (O Repositório do Lead)
A Anomalia passa a ser um agregado independente sincronizado.

```typescript
export interface Anomaly {
  id: string; // UUIDv4
  companyId: string;
  workspaceId: string;

  clientId: string; // Desnormalizado para busca rápida no Kanban
  siteId: string;
  assetId: string;

  workOrderId: string; // A OS (preventiva) que achou
  assetExecutionId: string; // O checklist exato

  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'OPEN' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  
  recommendedAction?: string;
  photoUuids: string[]; // Ponteiros para o storage

  createdAt: string;
  createdBy: string; // Técnico UUID
  quotedAt?: string;
  approvedAt?: string;
  resolvedAt?: string;
}
```
**Estratégia de Performance (100.000 anomalias):**
Índices cruciais:
1. `[companyId+workspaceId+status]` -> Para popular o Kanban Comercial instantaneamente.
2. `assetId` -> Para a Timeline do Ativo.

## 2. UX de Campo (Captura em 15 Segundos)
**O Desafio:** Técnico no sol, luvas sujas, segurando ferramenta.
**A Solução (Bottom Sheet):**
1. Técnico toca em `[X] Não Conforme` na pressão do Gás.
2. O sistema intercepta e levanta um *Bottom Sheet* limpo.
3. Tela exibe 2 botões gigantes: `[ 📷 FOTOGRAFAR ]` e `[ 🎙️ DITAR PROBLEMA E SOLUÇÃO ]`.
4. Ele fala: *"Vazamento na porca flange. Trocar porca e colocar 1kg de gás R410."*
5. Ele tira a foto da poça de óleo.
6. Clica em `[ SALVAR ]`.
Total de toques: **3 toques**. Total de digitação: **Zero letras**. Tempo: **< 15 segundos.**

O *Lead* comercial foi criado. A Anomalia nasce com status `OPEN` e já pisca na tela do escritório.
