# SPRINT: Atendimento Rápido (Quick Service Concept)

## 1. Visão Geral
O fluxo natural de sistemas ERPs tradicionais (OrcaOS) é *Prospecção -> Orçamento -> Aprovação -> Ordem de Serviço -> Execução -> Faturamento*. 
Contudo, a realidade de um técnico de campo (eletricistas, encanadores, técnicos de refrigeração) frequentemente subverte essa ordem: **O técnico é chamado de urgência, executa o serviço na hora, recebe via PIX e só depois precisa "dar baixa" no sistema para manter o histórico e o financeiro organizados.**

O **Atendimento Rápido** é uma interface simplificada que inverte a pirâmide de preenchimento, mas que internamente alimenta o banco de dados com a mesma rigidez estrutural do fluxo tradicional para não quebrar a arquitetura determinística do Aferix.

---

## 2. O Fluxo Proposto (Interface)
A interface exigirá apenas uma tela condensada com as seguintes perguntas:
1. **Cliente:** (Busca rápida ou criação de nome/telefone na hora).
2. **Serviço Realizado:** (Campo de texto livre ou seleção rápida).
3. **Valor Cobrado:** (Input monetário direto).
4. **Foi Recebido?:** (Toggle Sim/Não — Se Sim, qual a conta bancária).
5. **Observações:** (Notas para histórico).
6. **[ SALVAR ATENDIMENTO ]**

---

## 3. Comportamento Interno (Facade)
Ao clicar em Salvar, o `operationalFacade` (ou serviço similar) assume o controle para preservar a integridade arquitetural:
1. **Geração de Cliente:** Se o cliente não existir, insere um cliente "Simplificado".
2. **Geração de Orçamento:** Cria um orçamento (Budget) com status instantâneo `approved` ou `finished`.
3. **Geração de Ordem de Serviço (OS):** Cria a OS atrelada ao orçamento, definindo a data de conclusão como a data atual e o status como `completed`.
4. **Faturamento (Financeiro):** Se a flag "Recebido" estiver ativada, dispara uma mutação financeira (`FINANCIAL_MUTATION`), criando uma transação (`Transaction`) vinculada ao Caixa/Conta com o fluxo de receita, liquidando o orçamento.

---

## 4. Análise de Impactos e Riscos

### 4.1. Vantagens
- **Adoção do Usuário:** Remove a fricção de 5 a 6 telas, aumentando drasticamente as chances do técnico registrar pequenos serviços (como "troca de tomada" ou "limpeza de ar").
- **Dados Reais:** Diminui o "caixa 2 invisível" dentro da gestão do próprio autônomo, onde os serviços rápidos acabam nunca entrando no app pela preguiça de preencher o fluxo longo.
- **Ergonomia Máxima:** Ideal para uso na caminhonete após receber o pagamento e entrar no veículo.

### 4.2. Riscos e Conflitos Arquiteturais
- **Mutações Indesejadas:** O maior risco é que esse fluxo escape da *Trilha Operacional Determinística* imposta pelo `EventStore`. É crucial que o preenchimento não grave diretamente nas tabelas (`budgets`, `work_orders`, `transactions`), mas sim dispare os Eventos canônicos de domínio.
- **Dados Incompletos:** Clientes gerados pelo modo rápido podem poluir a base de CRM com contatos rasos (apenas "João - Sem Telefone").
- **Distorção de BI (Business Intelligence):** Como a "Data de Criação" e "Data de Conclusão" serão idênticas, relatórios que calculam *Tempo de Fechamento de Orçamento* ou *SLA de Execução* terão um viés de zero dias. Isso exige que o BI saiba filtrar "Atendimentos Rápidos" de "Projetos Convencionais".

### 4.3. Impacto Operacional
- Transforma o Aferix num aplicativo com "Dois Cérebros": O cérebro de ERP (para projetos longos e propostas detalhadas) e o cérebro de PDV/Caderneta (para ações imediatas).
- Requer uma entrada óbvia na *Home* e na *Tactical Action Bar*.

### 4.4. Impacto Financeiro
- O impacto é **altamente positivo**. Ele garante que pequenas quantias (R$ 150, R$ 200), que frequentemente escapam do histórico do trabalhador autônomo, sejam somadas ao fluxo de caixa realizado do mês, trazendo uma foto real do LTV dos clientes e da receita global.

---

## 5. Veredito e Validação
Conceitualmente, o **Atendimento Rápido** é uma funcionalidade *Core* para o sucesso do produto como um "Sistema Operacional de Bolso". Ele não conflita com o banco de dados contanto que **toda a lógica seja encapsulada em um Service/Facade único** que saiba traduzir 5 campos de UI na geração de 4 entidades completas de banco, injetando defaults seguros em campos obrigatórios vazios.
