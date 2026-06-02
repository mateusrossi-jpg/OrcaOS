# AFERIX ROLE VISIBILITY MATRIX
**Status:** UX Execution Mode | **Target:** Commercial Hardening

Este documento define rigorosamente quem pode ver, criar, editar, aprovar e quem *não deveria nem saber que a funcionalidade existe*. O excesso de visibilidade causa sobrecarga cognitiva.

| Funcionalidade | FIELD (Técnico) | SALES (Comercial) | MANAGER (Gestor) | OWNER (Dono) | CUSTOMER (Cliente) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clientes (CRM)** | ❌ (Vê só local da OS) | 👁️ ✏️ ➕ (Dono da conta) | 👁️ (Consulta) | 👁️ (Análise) | ❌ |
| **Locais (Sites)** | 👁️ (Para a OS atual) | 👁️ ➕ | 👁️ ✏️ ➕ | 👁️ | 👁️ (Seus locais) |
| **Ativos (Assets)** | 👁️ ✏️ ➕ (Diagnóstico) | 👁️ | 👁️ ✏️ ➕ | 👁️ | 👁️ (Health Score) |
| **Ordens de Serviço** | 👁️ ✏️ (Reporta/Executa) | 👁️ (Somente Status) | 👁️ ✏️ ➕ 🟢 (Aprova) | 👁️ | 👁️ (Valida/Assina) |
| **Checklists** | 👁️ ✏️ (Preenche) | ❌ | 👁️ ✏️ ➕ (Cria) | 👁️ | 👁️ (Vê PDF final) |
| **Anomalias** | 👁️ ✏️ ➕ (Gera Lead) | 👁️ ✏️ 🟢 (Orça) | 👁️ 🟢 (Triagem) | 👁️ | 👁️ 🟢 (Aprova) |
| **Propostas** | ❌ (Tabu) | 👁️ ✏️ ➕ (Vende) | 👁️ | 👁️ 🟢 (Aprova Margem)| 👁️ 🟢 (Aprova/Assina) |
| **Contratos (MRR)** | ❌ | 👁️ ✏️ (Gera/Renova) | 👁️ ➕ (Gestão SLA) | 👁️ (Monitora Receita) | 👁️ (Consulta) |
| **Garantias** | 👁️ (Aviso na OS) | 👁️ | 👁️ ✏️ ➕ | 👁️ | 👁️ |
| **Estoque** | 👁️ ✏️ (Consome na OS) | ❌ | 👁️ ✏️ ➕ (Controla) | 👁️ (Audita valor) | ❌ |
| **Compras** | ❌ | ❌ | 👁️ ✏️ ➕ 🟢 | 👁️ 🟢 (Aprova Gasto) | ❌ |
| **Dispatch (Agenda)**| 👁️ (Sua agenda) | ❌ | 👁️ ✏️ ➕ (Roteiriza) | 👁️ | 👁️ (Horário marcado) |
| **Customer Success** | ❌ | 👁️ ✏️ | 👁️ | 👁️ (Churn Risk) | ❌ |
| **Knowledge Engine** | 👁️ (Lê Manuais) | ❌ | 👁️ ✏️ ➕ | ❌ | ❌ |
| **Faturamento/MRR** | ❌ (Tabu absoluto) | 👁️ (Suas vendas) | 👁️ | 👁️ (Tudo) | 👁️ (Seus boletos) |

### Legenda:
- 👁️ = Vê (Read)
- ✏️ = Edita (Update)
- ➕ = Cria (Create)
- 🟢 = Aprova (Approve/Decide)
- ❌ = Restrito (Não deve ver)

### Regras de Negócio Ocultas Derivadas da Matriz:
1. **O Tabu Financeiro do Field:** Técnicos *nunca* veem valores de contratos, custos de peças ou margens de lucro. A exposição disso gera conflitos e vazamento de inteligência de negócios.
2. **Sales Blindness Operacional:** O Comercial não precisa ver o passo a passo do checklist de manutenção, apenas se a OS gerou uma anomalia (oportunidade de venda) ou se o cliente está satisfeito.
3. **Customer Tunnel Vision:** O cliente só vê o resultado (OS Finalizada), o problema (Anomalia para aprovar) e o custo (Proposta). Todo o "fazer a salsicha" fica oculto.
