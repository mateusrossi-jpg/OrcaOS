# Backlog de Problemas do Piloto — Aferix

Este documento serve para consolidar e gerenciar de forma centralizada todos os bugs, fricções e melhorias identificados durante a execução do primeiro piloto comercial do Aferix **v0.1.0-rc.1**.

> [!NOTE]
> Mantenha este registro atualizado de forma manual a cada sessão de teste concluída. Novos itens devem ser documentados seguindo o formato abaixo antes de serem promovidos para o time de engenharia.

---

## 1. Tabela Resumo do Backlog

| ID | Título do Problema | Módulo | Severidade | Prioridade | Status | Decisão Pós-Sessão | Link / Print |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| *EX-01* | *Exemplo de bug estético de margem* | *Relatórios* | *Baixa* | *P2* | *Aberto* | *Investigar depois* | *N/A* |
| | | | | | | | |

---

## 2. Dicionário de Rótulos

### Severidade:
* **Crítica:** Perda de dados, erros no motor financeiro (`calculateServiceProfit`) ou quebra de fluxo impeditiva.
* **Alta:** Funcionalidade básica indisponível sem meio de contorno simples.
* **Média:** Erro com workaround operacional funcional disponível.
* **Baixa:** Desalinhamento estético, erro ortográfico ou atraso de feedback visual secundário.

### Prioridade:
* **P0 (Imediato):** Bloqueia a continuidade do piloto.
* **P1 (Urgente):** Deve ser resolvido antes de liberar a versão final comercial estável.
* **P2 (Normal):** Catalogado para a próxima sprint/versão de beta público.

### Status:
* **Novo:** Identificado na sessão, aguardando análise de código.
* **Aberto:** Confirmado como bug real pendente de resolução.
* **Corrigido:** Ajustado no repositório local e integrado para o próximo build.
* **Resolvido:** Validado na sessão pós-correção com usuário real.

---

## 3. Detalhamento de Problemas Registrados

*(Utilize esta seção para detalhar as evidências técnicas e passos de reprodução dos bugs catalogados na tabela superior)*

---

### [ID] Título Detalhado do Bug
* **Origem (Sessão / Usuário):** ________________________
* **Módulo Afetado:** [Clientes / Orçamentos / OS / Offline / Relatórios / Outro]
* **Comportamento Obtido:** Descrever o comportamento errático.
* **Passos para Reproduzir:**
  1. Passo 1
  2. Passo 2
* **Decisão & Observações:**
  * [ ] Corrigir antes de continuar
  * [ ] Aceitar no piloto (com workaround)
  * [ ] Investigar depois
* **Evidência Visual (Link/Print):** *(Anexar imagem sob a pasta de evidências ou colar markdown de referência)*
