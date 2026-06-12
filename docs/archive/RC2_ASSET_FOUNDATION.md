# AFERIX RC2 — FUNDAÇÃO DE EQUIPAMENTOS (ASSET FOUNDATION)

Este documento estabelece a especificação técnica e de banco de dados para a fundação do módulo **Equipamentos (Ativos)**. Ao encapsular esta base em contratos, tipos e migrações isoladas, preparamos a arquitetura do RC2 sem alterar ou violar a estabilidade do **`READY_TO_CHARGE_RC1`**.

---

## 1. MODELOS DE DOMÍNIO E CONTRATOS (TYPESCRIPT)

Os modelos de dados e tipos estão isolados na camada de domínio técnico, estruturados para suportar a arquitetura local-first e Site-First:

### A. Entidade Ativo (`Asset`)
* **Local de Referência**: `src/domain/asset.ts`
* **Contrato**:
  ```typescript
  export type AssetType = 'EQUIPMENT' | 'SYSTEM' | 'INFRASTRUCTURE' | 'INSTALLATION';
  export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'CRITICAL' | 'REPLACED' | 'DECOMMISSIONED';

  import { MultiTenantEntity } from '../core/types/business';

  export interface Asset extends MultiTenantEntity {
    id: string;
    clientId: string;
    siteId: string;
    name: string;
    assetType: AssetType;
    category: string;                   // Categoria (Elétrica, Climatização, etc.)
    manufacturer?: string;              // Marca
    model?: string;                     // Modelo
    serialNumber?: string;              // Número de série
    tag?: string;                       // Identificação física (ex: "CH-01")
    location?: string;                  // Setor/Copa/Local físico no Site
    assetStatus: AssetStatus;
    installDate?: string;
    manufacturerWarrantyUntil?: string;
    serviceWarrantyUntil?: string;
    notes?: string;
    photoUuids?: string[];
    createdAt: string;
    updatedAt: string;
    syncStatus?: 'synced' | 'pending' | 'deleted';
    syncUpdatedAt?: number;
  }
  ```

### B. Entidade de Execução do Ativo (`AssetExecution`)
* **Local de Referência**: `src/domain/assetExecution.ts`
* **Contrato**:
  ```typescript
  import { MultiTenantEntity } from '../core/types/business';

  export interface ChecklistItemResult {
    itemKey: string;
    description: string;
    status: 'compliant' | 'non-compliant' | 'na' | 'pending';
    notes?: string;
  }

  export interface AssetExecution extends MultiTenantEntity {
    id: string;
    workOrderId: string;
    assetId: string;
    measurements: Record<string, any>;     // Telemetria (temperatura, tensão, pressão)
    checklistResults: ChecklistItemResult[];
    recommendation?: string;
    photoUuids?: string[];
    createdAt: string;
    updatedAt: string;
    syncStatus?: 'synced' | 'pending' | 'deleted';
    syncUpdatedAt?: number;
  }
  ```

---

## 2. TAXONOMIA E ESCOPO DE CATEGORIAS (`AssetCategory`)

As categorias operacionais suportadas na fundação são tratadas de forma estrita para evitar poluição no core:
* **`ELECTRICAL`**: Quadros elétricos, geradores, nobreaks, disjuntores.
* **`CFTV`**: Câmeras de monitoramento, DVRs, NVRs, racks de segurança.
* **`AUTOMATION`**: Sensores, atuadores, CLPs, interfaces de controle.
* **`HVAC`** (Climatização): Chillers, fancoils, condensadores, splits, fancoletes.
* **`MAINTENANCE`**: Elevadores, bombas de recalque, motores de portão, exaustores.

---

## 3. INFORMAÇÕES DE MIGRAÇÕES ISOLADAS

As estruturas de dados locais e em nuvem estão isoladas e configuradas para ativação automática sem interferência nos registros financeiros ativos:

### A. Migração do Banco de Dados Local (Dexie Schema Migration)
A tabela já se encontra provisionada e mapeada em `dexieDatabase.ts` sob a seguinte regra de indexação:
```typescript
db.version(2).stores({
  assets: 'id, clientId, siteId, category, assetStatus, tag, serialNumber',
  assetExecutions: 'id, workOrderId, assetId, createdAt'
});
```

### B. Migração do Banco de Dados em Nuvem (Supabase SQL DDL)
Mapeamento dos scripts SQL isolados para criação das tabelas na nuvem Supabase, contendo chaves estrangeiras (`FK`) e regras de replicação:

```sql
-- Criar Tabela de Ativos (Assets)
CREATE TABLE public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    category TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    tag TEXT,
    location TEXT,
    asset_status TEXT NOT NULL DEFAULT 'ACTIVE',
    install_date TIMESTAMP WITH TIME ZONE,
    manufacturer_warranty_until TIMESTAMP WITH TIME ZONE,
    service_warranty_until TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    photo_uuids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar replicação em tempo real no Supabase
ALTER TABLE public.assets REPLICA IDENTITY FULL;

-- Criar Tabela de Histórico de Execuções (Asset Executions)
CREATE TABLE public.asset_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    measurements JSONB DEFAULT '{}'::jsonb NOT NULL,
    checklist_results JSONB DEFAULT '[]'::jsonb NOT NULL,
    recommendation TEXT,
    photo_uuids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.asset_executions REPLICA IDENTITY FULL;
```
---

## 4. CERTIFICAÇÃO DE CONTROLE
A especificação técnica e as tabelas isoladas do módulo **Equipamentos** garantem que a fundação estrutural do RC2 esteja mapeada. Nenhuma rota, visual de UI ou componente operacional ativo do **`READY_TO_CHARGE_RC1`** foi alterado, assegurando o congelamento absoluto do produto homologado em produção.
