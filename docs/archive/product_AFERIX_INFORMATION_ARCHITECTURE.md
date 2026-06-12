# AFERIX INFORMATION ARCHITECTURE
**Status:** UX Execution Mode | **Target:** Commercial Hardening

Este documento define **onde** a informação vive dependendo de **quem** está olhando para ela. A arquitetura de informação não reflete a estrutura do banco de dados, mas sim a perspectiva do usuário (View Context).

## 1. Perspectiva: FIELD (Técnico)
O técnico vive no "Agora". O eixo de tempo dele é Hoje.
- **Home / Agenda:** "Onde estou agora e para onde vou a seguir?"
  - *Vive aqui:* OS do dia, Mapa/Rota, Botão "Iniciar Deslocamento".
- **Dentro da Ordem de Serviço (Modo Foco):** "O que tenho que fazer aqui?"
  - *Vive aqui:* Ativos do local, Histórico rápido do ativo (Quebrou antes?), Checklist da tarefa, Botão de "Nova Anomalia" (Fácil acesso), Lista de Materiais da OS.
- **Assinatura e Encerramento:** "Terminei. Como provo e vou embora?"
  - *Vive aqui:* Resumo (para o cliente ler), Canvas de Assinatura, Fotos (Obrigatórias vs Opcionais).

*Nota Arquitetural:* O Field NÃO tem menu de navegação complexo. É uma interface de "Trilhos" (Rails). Passo A -> Passo B -> Passo C.

## 2. Perspectiva: SALES (Comercial)
O comercial vive no "Pipeline". O eixo de tempo dele é o Futuro (Receita a entrar).
- **Home / Pipeline:** "Onde está o dinheiro que posso fechar hoje?"
  - *Vive aqui:* Propostas em Aberto, Anomalias reportadas pelos técnicos (Leads quentes), Contratos a renovar este mês.
- **Clientes (CRM):** "Como está o relacionamento e quem me deve o quê?"
  - *Vive aqui:* Histórico de aprovações, Health Score, Contatos decisores.
- **Orçamentação (Drafting):** "Como eu monto esse preço?"
  - *Vive aqui:* Catálogo de Serviços, Preços de Materiais, Margem de Lucro calculada em tempo real.

*Nota Arquitetural:* A UX do Sales foca em "Drag and Drop" (Kanban) e botões de ação rápida ("Enviar por WhatsApp", "Gerar Link de Aprovação").

## 3. Perspectiva: MANAGER (Gestão Operacional)
O gestor vive na "Capacidade e SLA". O eixo de tempo dele é a Semana.
- **Command Center (Home):** "O que está pegando fogo?"
  - *Vive aqui:* OS Atrasadas, Técnicos Ociosos, Faltas, Chamados Emergenciais.
- **Dispatch (Calendário):** "Quem faz o que, quando?"
  - *Vive aqui:* Gantt Chart de técnicos, Mapa de rota da equipe, Drag and Drop de OS.
- **Controle de Qualidade:** "O trabalho foi bem feito?"
  - *Vive aqui:* Fila de OS Aguardando Revisão, Relatórios Fotográficos.
- **Logística:** "Temos a peça?"
  - *Vive aqui:* Requisições de material das OS de amanhã, Compras urgentes.

*Nota Arquitetural:* Interface de alta densidade de informação. Uso massivo de tabelas (DataGrid), filtros avançados e buscas em lote.

## 4. Perspectiva: OWNER (Dono da Empresa)
O dono vive no "Caixa e Risco". O eixo de tempo dele é o Mês/Trimestre.
- **Cockpit (Home):** "Como está a saúde do negócio?"
  - *Vive aqui:* Faturamento projetado vs realizado (MRR + Projetos), Churn rate, Custo operacional, Margem média.
- **Painel de Aprovações:** "Onde o meu aval está travando o fluxo?"
  - *Vive aqui:* Propostas com margem abaixo de X%, Compras acima de R$ Y.

*Nota Arquitetural:* Visão puramente analítica e de exceção. Gráficos claros, KPIs de 3 segundos. "Management by Exception".

## 5. Perspectiva: CUSTOMER (Cliente)
O cliente vive no "Valor e Conformidade".
- **Home do Portal:** "Tudo está funcionando?"
  - *Vive aqui:* Health Score do seu parque de equipamentos, Próximas preventivas.
- **Central de Ações:** "O que precisam de mim?"
  - *Vive aqui:* Orçamentos aguardando clique para aprovar, Faturas abertas, Relatórios PMOC para download.

*Nota Arquitetural:* Interface de marca branca (White-label), extrema simplicidade, focado em "Self-Service" (Baixar 2ª via, aprovar, abrir chamado).

---

## Transformação do Domínio
*O que muda na arquitetura de software para suportar essa arquitetura de informação:*

- **Estoque:** Deixa de ser um "Módulo Main Menu" global. Vira uma "Aba" dentro de Operações (Manager) e um "Modal de Consumo" dentro da OS (Field).
- **Clientes:** Para o técnico, vira apenas um "Local com um Contato". A entidade `Client` completa (Financeiro, CNPJ) é isolada na UX do Sales/Manager.
- **Anomalias:** São o elo de ligação. Nascem na OS (Field UI), caem num Kanban de Triagem (Manager UI), e viram Proposta (Sales UI). O roteamento da UX segue o ciclo de vida do domínio.
