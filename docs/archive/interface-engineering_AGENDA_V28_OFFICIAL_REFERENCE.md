# AFERIX AGENDA V28 OFFICIAL REFERENCE

Status: DESIGN FREEZE APPROVED
Data: 2026-06-04
Versão: Agenda V28
Categoria: Field Operations

---

## OBJETIVO

Esta tela passa a ser a referência oficial do módulo Agenda do Aferix.

Seu propósito é permitir que um técnico ou prestador de serviços compreenda imediatamente:

1. O que está executando agora.
2. Qual ação deve realizar agora.
3. Qual é o próximo atendimento.
4. Quais ferramentas auxiliam a conclusão da execução.

---

## PRINCÍPIOS DE UX

A Agenda deve transmitir:
* Clareza
* Controle
* Execução
* Baixa carga cognitiva
* Rapidez operacional

A Agenda não deve transmitir:
* ERP complexo
* Dashboard administrativa
* Excesso de métricas
* Excesso de informação
* Sobrecarga visual

---

## ARQUITETURA OFICIAL

### 1. Atendimento em Execução
Elemento mais importante da tela.
Objetivo: Responder imediatamente: “O que estou executando agora?”
Ação principal: **CONTINUAR**
Ações secundárias:
* Evidências
* Checklist
* Finalizar

---

### 2. Próximo Atendimento
Segundo elemento mais importante.
Objetivo: Responder: “O que vem depois?”
Deve exibir:
* Cliente
* Local
* Contato
* Acesso à rota

---

### 3. Agenda do Dia
Linha temporal simplificada.
Estados:
* Concluído
* Em Execução
* Próximo
* Agendado
Objetivo: Transmitir progresso diário.

---

### 4. Ferramentas de Execução
Ferramentas auxiliares.
Itens aprovados:
* Checklist
* Fotos
* Assinatura
* Recebimento
Estas ferramentas não devem competir visualmente com o Atendimento em Execução.

---

## DECISÕES DE CONGELAMENTO

Aprovado:
* Hierarquia visual atual
* Estrutura atual
* Fluxo operacional atual
* Navegação atual
* Distribuição dos blocos

Removido definitivamente:
* Banners promocionais
* Imagens decorativas
* Fotos de fundo
* Indicadores financeiros
* Métricas administrativas
* Duplicações de ação

---

## REGRAS FUTURAS

Qualquer alteração futura deverá:
1. Preservar a arquitetura principal.
2. Não aumentar a carga cognitiva.
3. Não transformar a Agenda em uma Home secundária.
4. Não competir com a Home V33.
5. Respeitar o princípio: **Executar primeiro. Administrar depois.**

---

## CERTIFICAÇÃO

STATUS: **AGENDA_V28_OFFICIAL_REFERENCE**
DESIGN FREEZE APPROVED

A partir deste momento a Agenda V28 torna-se a referência oficial para desenvolvimento, implementação React, Storybook e futuras auditorias de UX do módulo operacional do Aferix.
