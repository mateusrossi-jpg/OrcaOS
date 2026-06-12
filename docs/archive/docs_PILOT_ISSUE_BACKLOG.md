# Backlog de Problemas do Piloto — Aferix

Este documento serve para consolidar e gerenciar de forma centralizada todos os bugs, fricções e melhorias identificados durante a execução do primeiro piloto comercial do Aferix **v0.1.0-rc.1**.

> [!NOTE]
> Mantenha este registro atualizado de forma manual a cada sessão de teste concluída. Novos itens devem ser documentados seguindo o formato abaixo antes de serem promovidos para o time de engenharia.

---

## 1. Tabela Resumo do Backlog

| ID | Título do Problema | Módulo | Severidade | Prioridade | Status | Decisão Pós-Sessão | Link / Print |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| *UX-01* | *Rótulo de cliente livre redundante com dropdown* | *Orçamentos* | *Baixa* | *P1* | *Novo* | *Corrigir antes de continuar* | *N/A* |
| *UX-02* | *Contraste baixo nas legendas de custos* | *Orçamentos* | *Baixa* | *P1* | *Novo* | *Corrigir antes de continuar* | *N/A* |
| *BUG-01* | *Delay estético no resize do PDF* | *Relatórios* | *Baixa* | *P2* | *Aberto* | *Investigar depois* | *N/A* |

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

---

### [UX-01] Rótulo de cliente livre redundante com dropdown
* **Origem (Sessão / Usuário):** Piloto 1 / Ronaldo Silva
* **Módulo Afetado:** Orçamentos (Cadastro/Seleção de Cliente)
* **Comportamento Obtido:** Usuário hesitou 9s pois o campo de texto livre ficava sempre visível junto com o dropdown, causando dúvida sobre onde digitar.
* **Passos para Reproduzir:**
  1. Abrir criação de orçamento.
  2. Visualizar área de Cliente.
* **Decisão & Observações:**
  * [x] Corrigir antes de continuar (tornar fallback dinâmico)
  * [ ] Aceitar no piloto (com workaround)
  * [ ] Investigar depois
* **Evidência Visual (Link/Print):** N/A

### [UX-02] Contraste baixo nas legendas de custos
* **Origem (Sessão / Usuário):** Piloto 1 / Ronaldo Silva
* **Módulo Afetado:** Orçamentos (Custos)
* **Comportamento Obtido:** Em ambiente simulado de forte incidência solar, o texto em cinza escuro ficou difícil de ler no tema dark.
* **Passos para Reproduzir:**
  1. Abrir criação de orçamento.
  2. Ir até seção de Custos (Materiais/Ajudante).
* **Decisão & Observações:**
  * [x] Corrigir antes de continuar (aumentar contraste)
  * [ ] Aceitar no piloto (com workaround)
  * [ ] Investigar depois
* **Evidência Visual (Link/Print):** N/A

### [BUG-01] Delay estético no resize do PDF
* **Origem (Sessão / Usuário):** Piloto 1 / Ronaldo Silva
* **Módulo Afetado:** Relatórios / BudgetPrintPreview
* **Comportamento Obtido:** Leve travamento ao rotacionar a tela no Safari Mobile para visualizar o PDF.
* **Passos para Reproduzir:**
  1. Abrir visualização de proposta aprovada.
  2. Girar o celular (Retrato -> Paisagem).
* **Decisão & Observações:**
  * [ ] Corrigir antes de continuar
  * [ ] Aceitar no piloto (com workaround)
  * [x] Investigar depois
* **Evidência Visual (Link/Print):** N/A
