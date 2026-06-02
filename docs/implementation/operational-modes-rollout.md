# Rollout dos Modos Operacionais

**Data:** 31/05/2026
**Responsável:** Aferix Agent (Antigravity)
**Objetivo:** Transição sistêmica para os modos exclusivos "Novo Projeto" e "Atendimento Rápido", extirpando modalidades intermediárias obsoletas.

---

## 1. Modificações de Interface (Arquivos e Componentes)

### `App.tsx`
- **Eliminação do Modal de Seleção:** O intermediário modal `budgetModeSelection` foi completamente removido, cortando o esforço cognitivo exigido na navegação primária.
- **Roteamento Direto:** O dispatcher `goTo()` agora captura e processa diretamente as chamadas de modo (`new-budget` para Novo Projeto e `new-quick-service` para Atendimento Rápido).
- **Substituição de Views:** Rota `new-express` alterada para renderizar o recém-nomeado `QuickServiceForm`.

### `AppShell.tsx` (Tactical Bar)
- Atualização do menu `tacticalActions` (que aparece ao clicar no botão "base/+" do rodapé).
- O antigo botão único de "Novo Orçamento" deu lugar a dois botões explícitos e de mesma hierarquia visual:
  - **ATENDIMENTO RÁPIDO** (com ícone `Zap` destacado).
  - **NOVO PROJETO** (com ícone `Target` padronizado).

### `BudgetsScreen.tsx`
- **Hero Actions Duplos:** O cabeçalho foi redesenhado para exibir duas `PrimaryButton`s contíguas, uma para **NOVO PROJETO** e outra para **ATENDIMENTO RÁPIDO**, assegurando uma entrada visível imediata para o usuário sem necessidade de abrir modais adicionais.
- Ajuste na tipagem do prop `onNewBudget(type)` para propagar a escolha exata da rota ao nível App.

### `QuickServiceForm.tsx` (antigo `BudgetExpressForm.tsx`)
- Renomeação completa do arquivo e do componente de React.
- Labels na interface e mensagens de log / alertas transicionaram de "Orçamento Express" para "Atendimento Rápido", refletindo a taxonomia definitiva do PDV em campo.

### `BudgetForm.tsx`
- Title header padronizado para exibir "Novo Projeto." em orçamentos recém-criados.

---

## 2. Impacto Estrutural

### 2.1 CRM
- O **Atendimento Rápido** continuará alimentando o CRM com "clientes rasos" (apenas nome), salvaguardando a rastreabilidade integral da receita sem impor fricção cadastral aos técnicos (evitando, também, clientes fantasmas).
- **Novo Projeto** persiste como o funil principal que fomenta fichas completas, exigidas para a emissão de relatórios/contratos e aprovação formal de propostas.

### 2.2 Financeiro
- A clareza binária elimina a chance de vazamento de receita. Pequenos reparos agora caem ininterruptamente no **Atendimento Rápido** — liquidando a O.S. simultaneamente com a criação do recebível.
- A contabilidade se beneficia de maior integridade, pois não há "terceira via" onde registros operacionais e fiscais pudessem ficar assíncronos.

### 2.3 Agenda
- O **Novo Projeto** tem impacto indireto na Agenda até a aprovação; após aprovada, requer o agendamento logístico normal.
- O **Atendimento Rápido** desvia do calendário futuro: a visita é retroativa à criação da entrada. Nenhuma poluição visual na Agenda de pendências, visto que o evento "começou e acabou" num estalo de dedos sob o mesmo timestamp de gravação.

### 2.4 OS (Ordens de Serviço)
- **Atendimento Rápido** continua acionando o orquestrador (via `operationalFacade`) gerando a O.S. já como concluída (`done`/`completed`), provendo evidências caso seja requisitado estorno ou garantia. 
- A O.S. não é gerada solta/avulsa, ela flui naturalmente com a esteira baseada na premissa universal "Todo registro tem uma raiz financeira" estabelecida nas Sprint anteriores.

---

**Conclusão:** 
O funil de entrada no sistema foi perfeitamente selado nas modalidades "A" e "B", garantindo que 100% da criação de receita aconteça dentro destas guias, sem sobreposição cognitiva, e acessíveis a um alcance de polegar.
