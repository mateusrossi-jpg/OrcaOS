# Auditoria e Implementação: Ações Ergonômicas
**Data:** 31/05/2026
**Objetivo:** Transformar o Aferix em um produto otimizado para uso com uma mão, erradicando ações primárias dos headers superiores, movendo-as para áreas de alcance natural.

## 1. Auditoria das Telas

### Módulo: Clientes (`ClientsWorkspace.tsx`)
- **Ação:** Botão "Novo Cliente"
- **Localização Atual:** Topo direito (Header) — Área Vermelha (Fora do alcance natural).
- **Classificação:** Ação Primária
- **Nova Localização (Planejada):** Integrado como uma `Hero Action` no primeiro cartão da tela.

### Módulo: Vendas / Orçamentos (`BudgetsScreen.tsx`)
- **Ação:** Botão "Nova Proposta"
- **Localização Atual:** Topo direito (Header) — Área Vermelha.
- **Classificação:** Ação Primária
- **Nova Localização (Planejada):** Integrado como uma `Hero Action` ou removido, visto que o `Tactical Bar` central já possui o atalho "NOVO ORÇAMENTO".

### Módulo: Operações (`OperationsHubWorkspace.tsx`)
- **Ação:** Botão "Novo Orçamento"
- **Localização Atual:** Topo direito (Header) — Área Vermelha.
- **Classificação:** Ação Primária
- **Nova Localização (Planejada):** Remover redundância (Ação já existe no Tactical Bar global acionado via botão "Operações" no rodapé).

### Módulo: Financeiro (`SimpleFinanceWorkspace.tsx`)
- **Ação:** Seletor de Mês
- **Localização Atual:** Topo direito (Header).
- **Classificação:** Ação Contextual (Filtro)
- **Status:** **Mantido.** Headers servem precisamente para contexto, filtros e navegação.

### Módulo: Home e Agenda
- **Ação:** Acesso ao Menu Executivo (Home) e Ícone de Calendário (Agenda).
- **Classificação:** Navegação e Contexto Visual.
- **Status:** **Mantido.** O usuário não precisa alcançar essa região constantemente, apenas quando troca de contexto macro.

---

## 2. A Regra Operacional (UX Mandate)
A partir de agora, fica proibido o uso da prop `action` no componente `AppHeader` para renderizar botões de criação ou fluxo positivo (`PrimaryButton` ou equivalente). 
**O Header é estritamente uma âncora de título, status e filtros.**

Ações Primárias OBRIGATORIAMENTE devem habitar:
1. **Tactical Bar (AppShell):** Para ações globais onipresentes (Ex: Criar Orçamento).
2. **Hero Actions:** Botões grandes integrados abaixo do título na rolagem natural.
3. **FAB / StickyActionBar:** Para esteiras de ação fixas na base da tela.
