# AFERIX DESIGN SYSTEM: INFORMATION ARCHITECTURE
`information-architecture.md`

Este documento estabelece a estrutura de atenção e a hierarquia global do Aferix. A força do Aferix reside na clareza absoluta da informação e na velocidade de resposta cognitiva (menos de 3 segundos para ler a tela).

---

## 1. A Hierarquia Global de Atenção (The Attention Stack)

Toda tela no Aferix, a começar pela Home, deve ser projetada seguindo uma ordem linear de prioridade de cima para baixo. O usuário nunca deve adivinhar onde focar os olhos.

```text
1. O que preciso fazer agora? (Ação Imediata / Protagonista)
    ↓
2. Onde preciso estar? (Contexto de Tempo e Espaço / Agenda)
    ↓
3. O que está bloqueando dinheiro? (Eficiência Financeira / Pendências)
    ↓
4. Ferramentas rápidas (Pontos de Entrada / Rodapé Operacional)
```

Essa ordem de atenção é rígida e se traduz como a regra de arquitetura para todos os outros módulos do ecossistema.

---

## 2. Tradução por Módulo

Nenhum módulo futuro do Aferix pode ser desenhado sob a lógica de tabelas ou cadastros frios de ERPs tradicionais. A hierarquia do Workspace molda cada tela:

### A. Cliente (Dados importantes primeiro)
* **Regra:** O topo da tela exibe o estado de tração com o cliente.
* **Ordem:**
  1. *Ação Imediata:* Há alguma proposta pendente de aprovação ou cobrança em aberto para este cliente? (Destaque principal).
  2. *Status Operacional:* Qual a data e serviço do próximo compromisso?
  3. *Dados de Contato:* Acesso em 1 clique para telefone, WhatsApp e endereço (uso em campo).
  4. *Histórico:* Linha do tempo das últimas OSs e faturamentos (minimizado por padrão).

### B. Ordem de Serviço / OS (Próxima ação primeiro)
* **Regra:** O técnico abre a OS para agir, não para ler relatórios.
* **Ordem:**
  1. *O Gatilho:* Botão de ação direta (`[ INICIAR SERVIÇO ]`, `[ COLETAR ASSINATURA ]`, `[ ANEXAR FOTO ]`) com destaque semântico.
  2. *Escopo de Trabalho:* Checklists claros dos serviços contratados.
  3. *Materiais:* Insumos consumidos e custo.
  4. *Metadados:* Datas, histórico de alterações e dados fiscais secundários no rodapé.

### C. Agenda (Hoje primeiro)
* **Regra:** A agenda foca no dia atual e no trajeto físico.
* **Ordem:**
  1. *O Agora:* O compromisso atual ou o próximo imediato em destaque de tamanho.
  2. *O Trajeto:* Mapa compacto ou rota rápida para o endereço do atendimento.
  3. *O Amanhã:* Linha do tempo simples e condensada dos dias subsequentes.
  4. *Filtros:* Escondidos em menus contextuais para evitar ruído.

### D. Financeiro (Pendências primeiro)
* **Regra:** O dinheiro travado é o inimigo número um. O financeiro deve caçar pendências.
* **Ordem:**
  1. *Dinheiro Travado:* Recebíveis vencidos e propostas aprovadas sem faturamento.
  2. *Trilha Operacional:* Relação direta entre OSs executadas e valores pendentes.
  3. *Colheita (Lucro):* Total faturado no mês e progresso em relação à meta.
  4. *Fluxo de Caixa passivo:* Lançamentos futuros e extrato (secundário).

---

## 3. A Lei da Resolução Cognitiva Imediata

Fica proibido o desenvolvimento de telas que forcem o usuário a realizar **interpretação ou cálculo mental antes de agir**. 

* **Proibido:** Exibir tabelas com dezenas de colunas onde o técnico precisa procurar a linha e entender se ela está atrasada ou paga.
* **Obrigatório:** Exibir cartões de estado pré-digeridos com cores semânticas (`text-accent-gold` ou `text-[#F87171]`) que guiem o olho diretamente para o gargalo.
