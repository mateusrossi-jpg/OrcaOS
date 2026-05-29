# AFERIX — ESTADO ARQUITETURAL OFICIAL (HOME)

**STATUS: CONGELADO | VERSÃO: DEFINITIVA (29/05/2026)**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PRINCÍPIO FUNDAMENTAL

A Home não é um módulo.
A Home é uma camada de coordenação posicionada acima dos módulos.

A Home não é dona de objetos.
A Home não é dona de regras de negócio.
A Home não é dona de cálculos.
A Home não é dona de estados operacionais.

**A Home é dona da atenção.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## FONTES DE VERDADE

*   **Operações:** Fonte da verdade dos serviços.
*   **CRM:** Fonte da verdade dos clientes.
*   **Agenda:** Fonte da verdade dos compromissos.
*   **Financeiro:** Fonte da verdade das transações.
*   **Relatórios:** Fonte da verdade da análise histórica.
*   **Home:** Fonte da verdade das prioridades.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## AS 7 LEIS IMUTÁVEIS

### 1. FIRST CLICK LAW
O primeiro clique natural do usuário deve ser operacional. O usuário deve interagir com ações necessárias (bloqueios, pendências, visitas), nunca com gráficos ou análises puras.

### 2. TEN SECOND LAW
Em menos de 10 segundos o usuário deve conseguir responder:
• O que devo fazer?
• O que está pendente?
• O que está bloqueado?
• Estou lucrando?
• Quanto está gastando?

### 3. ANTI-CANNIBALIZATION LAW
A Home não replica módulos. A Home alerta e direciona. Sempre que uma funcionalidade começar a reproduzir uma tela inteira dentro da Home, ela deve ser movida para seu módulo de origem.

### 4. OWNERSHIP LAW
Objetos pertencem aos módulos. Prioridade pertence à Home. A Home pode exibir um objeto, mas não pode assumir sua gestão ou administração.

### 5. PRIORITIZATION LAW
A Home não exibe tudo. A Home decide o que vem primeiro. Se tudo possui o mesmo peso visual ou se tudo aparece na Home, ela falhou em sua missão.

### 6. SEMANTIC BLINDNESS LAW
A Home entende prioridade. A Home não entende significado de negócio. Ela mapeia a severidade do domínio para a prioridade visual, sem interpretar o "porquê" operacional por trás do alerta.

### 7. FLAT DTO LAW
Nenhuma entidade de domínio completa pode atravessar a fronteira da Home. A comunicação entre os Domínios e a Home deve ser feita exclusivamente via DTOs (Data Transfer Objects) mínimos e planos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PRINCÍPIO FINAL

Os módulos respondem:
**“O que existe?”**

A Home responde:
**“O que vem primeiro?”**

Essa é sua única responsabilidade.
