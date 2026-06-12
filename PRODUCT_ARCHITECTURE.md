# Aferix — Product Architecture & Data Model

## 1. Modules and Core Mandate
**Tudo gira em torno do orçamento (Core Mandate).**
O orçamento/proposta é a entidade central do sistema da qual derivam os clientes, a execução das ordens de serviço, a receita financeira e os históricos.

* **Home/Dashboard:** Painel operacional de tarefas prioritárias e lucro líquido acumulado.
* **Revenue/Proposals:** Emissão, precificação e acompanhamento de propostas.
* **Operations/Work Orders:** Execução de serviços aprovados, checklist de atividades e evidências.
* **Relationships/Clients:** Cadastro, histórico de atendimentos e equipamentos/ativos do cliente.
* **Finance/Money:** Entradas, saídas, fluxo de caixa e reconciliação.

## 2. Data Model & Offline-First Core
* **Base Tecnológica:** React + TypeScript + Dexie (IndexedDB local) para persistência forte.
* **Sincronização:** Sincronização cloud híbrida via Supabase replicando o Event Store local.
* **Princípio de Mutação Unificada:** Nenhuma alteração financeira ou de status toca o banco diretamente. Elas passam pelo `operationalFacade`, que emite eventos imutáveis para o Event Store (`operationalEvents`). O estado do banco (`budgets`) é derivável da trilha de eventos.

## 3. Navigation System
* **Navegação Lateral (Sidebar):** Menu retrátil para acesso a todos os módulos e configurações, otimizado para não poluir a área de trabalho.
* **FAB (Floating Action Button):** Ação primária de criação rápida (`+ Novo Orçamento`) posicionada na zona de alcance imediato (canto inferior direito).
