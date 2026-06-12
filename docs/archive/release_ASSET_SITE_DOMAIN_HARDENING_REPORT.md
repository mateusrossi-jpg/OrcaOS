# RELATÓRIO DE HARDENING: DOMÍNIO ASSET + SITE — AFERIX OS

**Status:** Auditoria e Consolidação Concluída (READ-ONLY)
**Perfil:** Solutions Architect & Service Operations Strategist
**Objetivo:** Refinar a modelagem conceitual do Patrimônio Técnico, introduzindo a entidade **Site** para suportar operações multiunidade e navegação profissional, eliminando riscos de retrabalho.

---

### ETAPA 1: VALIDAÇÃO DA HIERARQUIA DE DOMÍNIO

A hierarquia definitiva estabelecida é:

**Client** (O Dono)
└── **Site** (Onde: Unidade/Endereço)
    └── **Asset** (O quê: Equipamento/Sistema)
        ├── **WorkOrders** (Histórico de Intervenção)
        ├── **MaintenancePlans** (Inteligência Preventiva)
        ├── **Warranties** (Proteção Financeira)
        └── **Technical Timeline** (Rastreabilidade Total)

**Respostas Cruciais:**
1.  **Site é obrigatório?** Sim, logicamente. Mesmo que o cliente tenha apenas um local, o sistema criará um "Site Principal".
2.  **Site sem Asset?** Sim (ex: uma visita de inspeção predial onde ainda não há ativos cadastrados).
3.  **Asset sem Site?** **Não.** Todo ativo deve estar localizado em algum lugar para fins de logística e rota.
4.  **Quebra de Hierarquia?** Em casos de ativos móveis (ex: frotas), o Site pode ser tratado como "Base Operacional", mas a estrutura permanece íntegra.

---

### ETAPA 2: DOMÍNIO SITE (UNIDADE OPERACIONAL)

O **Site** resolve a confusão entre "Dono" e "Local de Atendimento".

| Campo | Classificação | Objetivo |
| :--- | :---: | :--- |
| `id` | **Obrigatório** | UID do sistema. |
| `clientId` | **Obrigatório** | Vínculo de propriedade. |
| `name` | **Obrigatório** | Identificador (ex: "Loja Centro", "Matriz", "Casa Praia"). |
| `fullAddress` | **Obrigatório** | Logradouro completo para snapshots. |
| `latitude / longitude` | **Estratégico** | Essencial para o botão "IR PARA LOCAL" e cálculo de rotas. |
| `notes` | **Opcional** | Instruções de acesso (ex: "Entrar pela lateral"). |

---

### ETAPA 3: NAVEGAÇÃO E ROTAS (LOGÍSTICA)

**Decisões Arquiteturais:**
1.  **Endereço:** O endereço de faturamento fica no `Client`. O endereço de atendimento fica no `Site`.
2.  **GPS:** As coordenadas pertencem ao `Site`.
3.  **Multiunidade:** Suportado nativamente. Um `Client` com 50 filiais terá 50 `Sites`, permitindo rotas otimizadas por região.
4.  **Duplicação:** Ao vincular um `Asset` a um `Site`, ele herda automaticamente o endereço, eliminando o erro de digitação repetitiva.

---

### ETAPA 4: HARDENING DO ASSET (ESCOPO AMPLIADO)

O domínio Asset não será limitado a "máquinas". Ele representará qualquer objeto de manutenção.

**Enum Conceitual `AssetType`:**
*   **EQUIPMENT:** Itens isolados (Ar-condicionado, Motor, Bomba).
*   **SYSTEM:** Conjuntos lógicos (Sistema Solar, CFTV, Rede Lógica).
*   **INFRASTRUCTURE:** Estruturas passivas (Telhado, Quadro Elétrico, Fachada).
*   **INSTALLATION:** Ambientes mantidos (Piscina, Jardim, Copa).

---

### ETAPA 5: STATUS OPERACIONAL DO ATIVO

Introdução do campo `assetStatus` para automação:
*   **ACTIVE:** Operando normalmente.
*   **MAINTENANCE:** Em intervenção (trava preventivas automáticas).
*   **CRITICAL:** Operando com falha ou risco eminente.
*   **REPLACED:** Histórico mantido, mas ativo não existe mais no local.
*   **DECOMMISSIONED:** Desativado/Removido.

---

### ETAPA 6: WORKORDER E ASSET (MULTIATENDIMENTO)

**Nova Regra de Negócio:**
1.  **Asset na OS:** Opcional no início (OS Avulsa), mas **altamente recomendado**.
2.  **Multiatendimento:** Uma `WorkOrder` poderá conter um array de `assetIds`.
    *   *Exemplo:* Uma única OS de "Manutenção Mensal" que atende 5 Ar-condicionados diferentes.
3.  **Serviços sem Ativo:** Suportados como "Inspeção Geral" ou "Consultoria", vinculados apenas ao `Site`.

---

### ETAPA 7: CONCEITO ASSET 360 (A MÁQUINA FALA)

O **Asset 360** será o dossiê da máquina:
*   **Topo:** Nome, TAG, Status de Garantia e Saúde.
*   **KPIs:** Custo Total de Manutenção vs. Valor de Compra (Rentabilidade do Ativo).
*   **Timeline Técnica:** Apenas os eventos que tocaram aquele `id` específico.
*   **Alerta:** "Próxima Preventiva: 15 dias".

---

### VEREDITO DE PRONTIDÃO

1.  **Asset é domínio raiz?** Sim.
2.  **Precisa de Event Sourcing?** Sim, crucial para rastreabilidade técnica.
3.  **Obrigatório antes de Preventivas?** **SIM.** (Sem site/ativo, a preventiva é imprecisa).
4.  **Sequência de Implementação Atualizada:**
    **Fase 3B (Schema Site + Asset) → Fase 3C (Vínculo OS) → Fase 3D (Preventivas)**

**Riscos Encontrados:**
*   Risco de migração de endereços existentes do `Client` para o `Site` Principal. Requer cuidado na primeira execução.
*   Risco de UI poluída em dispositivos pequenos ao listar muitos ativos. Exige uso de agrupamento por Categoria.

---
**Auditoria Concluída.** A modelagem está blindada e pronta para a implementação física. O Aferix OS agora está preparado para gerenciar desde um pequeno reparo doméstico até a manutenção complexa de um parque industrial.

**Próximo Passo:** Implementar o Schema `Site` e `Asset` no banco de dados Dexie (Fase 3B real).