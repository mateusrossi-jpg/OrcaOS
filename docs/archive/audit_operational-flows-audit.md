# Auditoria de Fluxos Operacionais: Uso em Campo
*Data da Auditoria: 2026-05-31*

## Objetivo e Pergunta Principal
**O técnico possui apenas um caminho mental para cada ação ou existem múltiplos caminhos concorrentes?**

**Resposta:** Atualmente, existem **múltiplos caminhos concorrentes**. Embora o sistema seja rápido (poucos cliques), o design permite "atalhos" que burlam a fonte de verdade do sistema (como a OS Avulsa e Clientes Avulsos), exigindo carga cognitiva para o técnico decidir *qual* caminho usar.

O objetivo desta auditoria é expor onde o esforço cognitivo precisa ser reduzido para o uso ótimo em campo (alta luz solar, dentro do veículo, atenção parcial).

---

## 🗺️ Mapeamento de Fluxos

### 1. Novo Cliente
* **Caminho Principal (Base):** Aba "Clientes" > Botão "Novo Cliente" > Modal Rápido (3 inputs) > Salvar.
* **Caminho Concorrente (Avulso):** Durante um orçamento (`BudgetForm`), se o cliente não está na lista, o técnico simplesmente digita no campo "Nome (Livre)" e avança.
* **Velocidade:** 
  * Cliques: 2 a 3.
  * Telas: 1 Modal ou 1 Input no Formulário.
  * Decisões: 0 (Apenas entrada de dados).
* **Diagnóstico:** **Ponto de Confusão e Risco.** O caminho "Avulso" cria um cliente fantasma que não entra no CRM e não retém histórico. O caminho de cadastro rápido vs completo está bem resolvido no Dossiê, mas a criação via Orçamento precisa forçar/vincular a criação real no CRM.

### 2. Novo Orçamento
* **Caminho Principal:** Menu Tático Central > "Novo Orçamento" > Pipeline (11 Etapas).
* **Velocidade:** 
  * Cliques: ~12 (Avançando pelo `WorkflowStepper`).
  * Telas: 1 (Formulário Vertical Contínuo).
  * Decisões: 6 (Cliente, Escopo, Técnico, Labor, Material, Preço).
* **Diagnóstico:** Caminho limpo e linear. O `WorkflowStepper` guia o usuário como um túnel. **Alerta:** Para "Serviços Expressos" (ex: trocar uma tomada rápida), 11 etapas podem parecer onerosas. Falta um "Fast-Track" (Orçamento Rápido de 1 etapa).

### 3. Nova OS (Ordem de Serviço)
* **Caminho Correto (Constituição):** Orçamento entra em status "Autorizado" e vira uma OS no fluxo.
* **Caminho Concorrente (Atalho):** Menu Tático Central > "Nova OS Avulsa".
* **Velocidade (OS Avulsa):** 
  * Cliques: 3.
  * Telas: 1 Modal.
  * Decisões: 3 (Cliente, Título, Valor).
* **Diagnóstico:** **Gravíssimo.** O botão "Nova OS Avulsa" quebra a Regra de Ouro ("Tudo gira em torno do Orçamento"). Este atalho paralelo permite executar trabalhos sem esteira de custeio, sem aprovação de margem e sem histórico de insumos. Deve ser removido para manter um único caminho mental.

### 4. Novo Atendimento (Agenda / Agendamento)
* **Caminho Principal:** O "Agendamento" acontece ao definir a data de execução ou prazo do Orçamento/OS. O usuário acessa a "Agenda" via Menu Tático e vê o cronograma de 14 dias.
* **Velocidade:** 
  * Cliques: 1 (Para ver a agenda).
* **Diagnóstico:** **Ponto Cego.** A interface não possui uma "Ação Primária" clara para alterar um agendamento ("Remarcar"). A leitura da agenda é magnífica (1 clique), mas a *mutação* da data exige voltar no detalhe do serviço. Falta atrito zero para reagendamentos na rua.

### 5. Recebimento (Baixa Financeira)
* **Caminho A (Financeiro):** Aba "Financeiro" > Clicar no lançamento > Modal > Confirmar Valor > Receber.
* **Caminho B (Operações/Campo):** Aba "Operações" > Clicar na OS em andamento > Checkout da OS > Confirmar Valor Recebido e Concluir.
* **Velocidade:** 
  * Cliques: 3.
  * Telas: 1 Modal.
  * Decisões: 1 (Valor bate com o esperado?).
* **Diagnóstico:** **Duplicação de Caminho Mental.** Para quem está na rua (Técnico), o "Caminho B" faz total sentido, pois a baixa financeira atrela-se ao fim da execução (Checkout). O "Caminho A" deveria ser de uso exclusivo de auditoria de back-office, mas hoje ambos parecem disputar a atenção do técnico. 

### 6. Conclusão de Serviço (Checkout)
* **Caminho Principal:** Cockpit de Operações > Clicar no Serviço > Modal "Registrar Finalização".
* **Velocidade:** 
  * Cliques: 3.
  * Telas: 1 Modal.
  * Decisões: Inserir Anotações Finais e Valor Recebido.
* **Diagnóstico:** Perfeito para uso em campo. O modal resolve o problema sem mudar de contexto visual (fundo desfocado).

---

## 🎯 Conclusão e Resoluções Prioritárias

Existem **2 grandes gargalos de caminho concorrente** que quebram o estado de "piloto automático" do técnico:

1. **Remoção da "Nova OS Avulsa":** A única forma de existir uma OS deve ser através do funil "Novo Orçamento -> Autorizado". (Ação técnica: Remover o botão `Nova OS Avulsa` do Tactical Menu).
2. **Bloqueio de Clientes Fantasmas:** No `BudgetForm`, o input livre de "Nome do Cliente" para Avulsos deve engatilhar a criação de um "Cadastro Rápido" real na base.

Ao remover esses atalhos nocivos, o aplicativo terá apenas **um funil determinístico e à prova de falhas cognitivas**, não importando o nível de stress ou luminosidade no campo.
