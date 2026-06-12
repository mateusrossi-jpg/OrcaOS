# AFERIX ROLE MATRIX V1

## VISÃO GERAL
O Aferix abandona a abordagem de "ERP de interface única" e adota o paradigma de **Role-Based Workspaces (Experiências por Papel)**. Cada perfil de usuário terá um sistema focado exclusivamente em seu objetivo principal. 

> O Técnico não é o Dono. O Dono não é o Comercial. O Comercial não é o Gestor. O Cliente não é funcionário.

## MATRIZ OFICIAL DE PAPÉIS

### 1. OWNER (Dono da Empresa)
* **Objetivo:** Controlar a empresa, garantir fluxo de caixa e mitigar riscos.
* **Perguntas Chave:**
  * Quanto vou faturar?
  * Quanto está em risco?
  * Quem está trabalhando?
  * Quais contratos vencem?
  * Qual cliente está em risco?

### 2. SALES (Comercial / Vendedor)
* **Objetivo:** Transformar anomalias em receita, aprovar orçamentos.
* **Perguntas Chave:**
  * O que posso orçar hoje?
  * Quem precisa aprovar?
  * Quanto tenho em propostas abertas?
  * Qual valor estou deixando na mesa?

### 3. FIELD (Técnico / Prestador / Operacional)
* **Objetivo:** Executar o serviço de forma rápida, registrar evidências, e seguir para o próximo.
* **Perguntas Chave:**
  * Onde vou agora?
  * Qual OS devo executar?
  * Qual ativo vou atender?
  * Como finalizo isso rápido?

### 4. MANAGER (Coordenador Operacional / Despachador)
* **Objetivo:** Controlar a rua, garantir SLAs, otimizar rotas e recursos.
* **Perguntas Chave:**
  * Quem está atrasado?
  * Quem está disponível?
  * Qual SLA está em risco?
  * Quem precisa de ajuda?

### 5. CUSTOMER (Cliente Final)
* **Objetivo:** Acompanhar garantias, aprovar propostas e auditar o serviço prestado.
* **Perguntas Chave:**
  * Qual o estado dos meus equipamentos?
  * Tenho propostas pendentes?
  * Onde estão meus laudos?
  * Quando vence meu contrato?

## DIRETRIZ DE DESIGN
Se uma funcionalidade, menu ou dado não responde às perguntas do perfil logado, ela deve ser **removida ou escondida**. Sobrecarga cognitiva leva a abandono.
