# AFERIX COMMAND CENTER REBUILD

O menu global morreu. Bem-vindo aos **Command Centers Especializados**.
Dependendo do login, o Shell de navegação (Top bar + Bottom Menu no mobile / Sidebar no Desktop) muda drasticamente.

## 1. OWNER COMMAND CENTER
*Menu de Gestão Total.*
* **Atalho Principal (FAB):** Visão de Fluxo de Caixa ou Novo Contrato.
* **Menus:**
  1. Empresa (Dashboard)
  2. Financeiro (DRE / Fluxo)
  3. Clientes (Visão Macro / Risco)
  4. Contratos
  5. Estoque
  6. Configurações & Usuários

## 2. FIELD COMMAND CENTER
*Menu de Rua. Foco em Ação, com botões gigantes e modo dark de alto contraste.*
* **Atalho Principal (FAB):** INICIAR SERVIÇO (Checkin) ou REPORTAR ANOMALIA.
* **Menus:**
  1. Minha Agenda (Hoje)
  2. Ativos (Histórico rápido)
  3. Checklists (Offline Mode)
  4. Diagnósticos (Enviar foto/áudio)
  5. Assinaturas (Coleta de ciente)
  6. Perfil

## 3. SALES COMMAND CENTER
*Menu de Pipeline.*
* **Atalho Principal (FAB):** ORÇAR AGORA.
* **Menus:**
  1. Pipeline (Kanban)
  2. Anomalias (Oportunidades geradas pelo FIELD)
  3. Propostas (Rascunhos, Enviadas)
  4. Clientes (CRM)
  5. Perfil

## 4. MANAGER COMMAND CENTER
*Menu Tático de Despacho.*
* **Atalho Principal (FAB):** REORGANIZAR OPERAÇÃO (Dispatch de urgência).
* **Menus:**
  1. Mapa Operacional (Onde todos estão)
  2. Dispatch (Alocação)
  3. Agenda
  4. Equipe (Disponibilidade)
  5. Clientes
  6. Perfil

## 5. CUSTOMER COMMAND CENTER
*Menu B2B/B2C para o cliente final. Simples, com a marca (White-label).*
* **Atalho Principal (FAB):** SOLICITAR ASSISTÊNCIA.
* **Menus:**
  1. Home (Health Score, Status)
  2. Laudos & Evidências
  3. Propostas (Para aprovação)
  4. Contratos & Ativos
  5. Perfil (Dados de Cobrança)

## DIRETIVA TÉCNICA
* Arquitetura no React: O `App.tsx` (ou o componente Root de Layout) deve invocar o hook `useRoleNavigation()` e passar a renderizar o Header/Footer específico (`<OwnerShell>`, `<FieldShell>`, `<SalesShell>`, etc.).
* É **proibido** ter um switch maciço dentro dos itens do menu (Ex: `{role === 'owner' ? <Menu1/> : <Menu2/>}`). A árvore de layout inteira (Shell) deve ser trocada no nível macro para manter o código limpo.
