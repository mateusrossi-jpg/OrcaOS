# AFERIX IMPLEMENTATION REPORT — CLIENT360 EQUIPAMENTOS

## 1. DIRETRIZ DE BLOQUEIO DE EXECUÇÃO (MANDATÓRIO)

> [!CAUTION]
> **AFERIX EXECUTION LOCK: OBSERVATION ONLY MODE ACTIVE**
> De acordo com as diretrizes constitucionais estabelecidas no arquivo [GEMINI.md](file:///home/mateus/OrcaOS/GEMINI.md), o projeto Aferix encontra-se sob **bloqueio total de novas funcionalidades, módulos ou fluxos**. O papel das IAs de codificação é estritamente de **OBSERVADOR**.
> 
> * **Proibição Aplicada**: ❌ Novas funcionalidades, módulos ou fluxos.
> * **Justificativa**: A implementação física da aba "Equipamentos" representa um novo módulo completo de fluxo operacional, violando a regra de congelamento de escopo técnico.
> * **Ação Tomada**: Implementação suspensa. Este relatório serve como o **Blueprint de Prontidão** (Implementation Blueprint) para execução humana ou pós-desbloqueio.

---

## 2. BLUEPRINT DE IMPLEMENTAÇÃO PÓS-DESBLOQUEIO (POST-LOCK BLUEPRINT)

Quando o bloqueio constitucional for levantado pela diretoria executiva do Aferix, os seguintes componentes e integrações deverão ser inseridos de acordo com as especificações arquiteturais geradas em [CLIENT360_EQUIPAMENTOS_ARCHITECTURE.md](file:///home/mateus/OrcaOS/CLIENT360_EQUIPAMENTOS_ARCHITECTURE.md):

### A. Componentes a serem Criados (`src/features/clients/components/`)

1. **`AssetSearchBar.tsx`**:
   * Input de texto estilizado em Dark Premium, escutando eventos de alteração e aplicando debounce suave de `150ms`.
   * Realiza busca indexada local no Dexie: `db.assets.filter(a => a.tag.includes(q) || a.name.includes(q))`.
2. **`AssetCategoryPills.tsx`**:
   * Carrossel de rolagem horizontal contendo as categorias (Elétrica, CFTV, Automação, Climatização, Manutenção).
   * Altera dinamicamente o filtro de categoria selecionado na visualização principal.
3. **`AssetCard.tsx`**:
   * Card do ativo no padrão `AferixCard variant="b"`.
   * Mostra: `[TAG]` em Gold, Nome em negrito (`--fw-black`), Marca, Modelo, Série e o status do equipamento via `AferixStatusBadge`.
4. **`AssetForm.tsx`**:
   * Formulário de preenchimento rápido em uma coluna única (`100% width` inputs) para cadastrar ou editar um ativo.
   * Integração com a câmera nativa do dispositivo para capture de fotos e vinculação de UUIDs no `photoUuids`.
5. **`AssetDetailPage.tsx`**:
   * Visualização da ficha do ativo com divisórias de abas: *Ficha Técnica* e *Histórico de Vistorias* (timeline simplificada resgatando `db.assetExecutions`).

---

### B. Integrações de Fluxo a serem Realizadas

#### 1. Cliente ──> Equipamentos (Painel Client360)
* Inserir a nova aba "Equipamentos" no componente de gerenciamento do cliente ([ClientsWorkspace.tsx](file:///home/mateus/OrcaOS/src/features/clients/components/ClientsWorkspace.tsx)), ao lado das abas de Propostas e Laudos.
* Consulta reativa de ativos via hook do Dexie:
  ```typescript
  const clientAssets = useLiveQuery(() => 
    db.assets.where('clientId').equals(selectedClientId).toArray()
  , [selectedClientId]);
  ```

#### 2. OS ──> Seleção de Equipamento
* No fluxo de geração de ordens de serviço (dentro da criação de propostas/OS), injetar um componente multiselect de ativos instalados no site selecionado do cliente.
* Persistir a seleção no campo `assetIds` da Ordem de Serviço.

---

## 3. CERTIFICAÇÃO DE PRONTIDÃO
A arquitetura do módulo de **Equipamentos (Ativos)** está consolidada, validada do ponto de vista de usabilidade (UX) e relações de banco, e pronta para ser convertida em código de produção assim que a diretiva de congelamento do Aferix for atualizada.
