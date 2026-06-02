# AFERIX WORKSPACE AUDIT

## REVISÃO COMPLETA DOS MENUS GLOBAIS

Este documento mapeia os menus atuais (o que era o "ERP Monolítico") e define sua realocação baseada no paradigma de Multi-Profile Workspaces.

### 1. Financeiro / Caixa
* **Quem Usa:** OWNER
* **Frequência:** Diária
* **Impacto:** Crítico
* **Localização Ideal:** Owner Workspace (Home / Dashboard)
* **Remover de:** FIELD, SALES, CUSTOMER

### 2. Clientes / CRM
* **Quem Usa:** OWNER, SALES, MANAGER
* **Frequência:** Diária
* **Impacto:** Alto
* **Localização Ideal:** Sales Workspace (Funil), Manager Workspace (Visão Geral), Owner Workspace (Métricas de Risco)
* **Remover de:** FIELD (Técnico vê apenas o Site/Ativo da OS), CUSTOMER

### 3. Contratos / PMOC
* **Quem Usa:** OWNER, MANAGER
* **Frequência:** Semanal
* **Impacto:** Médio/Alto (Recorrência)
* **Localização Ideal:** Owner Workspace (Vencimentos), Manager Workspace (Renovação / Execução)
* **Remover de:** FIELD (Não faz gestão contratual), SALES (Apenas orça)

### 4. Orçamentos / Propostas
* **Quem Usa:** SALES, CUSTOMER
* **Frequência:** Diária
* **Impacto:** Crítico (Geração de Receita)
* **Localização Ideal:** Sales Workspace (Editor/Inbox), Customer Portal (Aprovação)
* **Remover de:** FIELD (O técnico não orça, ele aponta anomalias que geram rascunhos para o Sales).

### 5. O.S / Agenda / Execução (Checklists)
* **Quem Usa:** FIELD, MANAGER
* **Frequência:** Contínua
* **Impacto:** Crítico
* **Localização Ideal:** Field Workspace (Minha Agenda / Executar Agora), Manager Workspace (Dispatch / Status Global)
* **Remover de:** OWNER (Visão macro apenas), SALES (Foco em receita, não em execução), CUSTOMER (Foco em laudos finalizados).

### 6. Estoque / Materiais
* **Quem Usa:** OWNER, MANAGER
* **Frequência:** Semanal
* **Impacto:** Alto (Capital Imobilizado)
* **Localização Ideal:** Owner Workspace (Capital / Custo), Manager Workspace (Requisições)
* **Remover de:** FIELD, SALES, CUSTOMER.

## AÇÃO CORRETIVA IMEDIATA
* A `StickyActionBar` (Mobile) e a navegação da Web devem parar de renderizar um menu global.
* A navegação passa a ler o perfil (Role) do usuário logado via Context/Auth e renderizar exclusivamente a matriz de atalhos e menus definida em `AFERIX_COMMAND_CENTER_REBUILD.md`.
