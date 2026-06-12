# P91 — HUMAN MOBILE UX AUDIT + SCREENSHOT MAP

## 📱 Visão Geral da Auditoria
Esta auditoria foi realizada simulando o uso real em um iPhone 13 Pro (390x844). O objetivo é identificar fricções, redundâncias e quebras de fluxo que o usuário final (prestador de serviço) encontraria.

## 🗺️ Mapa de Screenshots (docs/ux-audit/screenshots/p91/)
- `01-home.png`: Dashboard principal.
- `02-menu-lateral.png`: Sidebar/Drawer.
- `03-mais.png`: Aba de utilitários/configurações.
- `04-novo-orcamento-topo.png`: Início do formulário de orçamento.
- `05-novo-orcamento-final.png`: Final do formulário com botões de ação e sticky preview.
- `06-historico.png`: Lista de orçamentos (Operacional).
- `07-financeiro.png`: Fluxo de caixa.
- `08-clientes.png`: Gestão de clientes.
- `09-catalogo.png`: Biblioteca de itens.
- `10-relatorios.png`: Painel de métricas avançadas.
- `11-configuracoes-ou-mais-detalhe.png`: Tela de Perfil Profissional.

---

## 🔍 Auditoria por Tela

### 🏠 A. Home (Resumo)
- **Ações Disponíveis:** Novo Orçamento, Continuar Trabalho, Ver Histórico.
- **Botões Duplicados:** Nenhum na tela, mas o botão principal de navegação (Sidebar vs Bottom Nav) causa confusão.
- **Problemas Visuais:** KPI de "Meu Lucro" ocupa a largura total mas parece um pouco vazio comparado aos outros dois.
- **Confusão de Fluxo:** "Continuar trabalho" mostra apenas o último orçamento, se houver muitos em andamento, o usuário precisa ir para "Operação".
- **Severidade:** P2 (Incômodo visual leve).
- **Decisão:** Manter, mas unificar navegação.

### 📝 B. Novo Orçamento
- **Ações Disponíveis:** Preencher dados, Salvar, Enviar, Autorizar, Recusar, Finalizar.
- **Botões Duplicados:** **[CRÍTICO]** O botão "Finalizar" aparece na lista de ações principal e TAMBÉM na barra fixa (Sticky Preview) no rodapé. 
- **Ações Confusas:** Os botões "Enviado" e "Autorizar" estão lado a lado sem distinção de importância.
- **Problemas Funcionais:** A barra fixa (Sticky Preview) pode cobrir o último botão da lista de ações (Recusar) dependendo do scroll.
- **Severidade:** P1 (Atrapalha muito).
- **Decisão:** Unificar ações na barra fixa ou remover redundância.

### 📋 C. Histórico (Operação)
- **Ações Disponíveis:** Novo, Filtros, Abrir Orçamento, Excluir.
- **Botões Duplicados:** Botão "+ Novo" no header duplica a função principal da Home.
- **Problemas Visuais:** O ícone de lixeira (Excluir) está posicionado de forma absoluta, o que é bom para espaço, mas pode ser acionado acidentalmente.
- **Severidade:** P2.
- **Decisão:** Mover exclusão para dentro de um menu de ações (...) ou pedir confirmação forte.

### 💰 D. Financeiro
- **Métricas:** Claras e tabular-nums funcionando.
- **Problemas Visuais:** Grid de KPIs muito similar à Home, causando sensação de "tela repetida".
- **Confusão de Fluxo:** Não há ação de "Adicionar lançamento manual" visível, parece ser apenas leitura de orçamentos.
- **Severidade:** P3.
- **Decisão:** Manter como leitura, mas melhorar distinção visual da Home.

### 👥 E. Clientes
- **Ações Disponíveis:** Novo Cliente, Buscar, Editar, Remover.
- **Problemas Visuais:** Lista de clientes usa `ListItem` mas a informação de "Ativo" (badge) é redundante para todos.
- **Severidade:** P3.
- **Decisão:** Unificar estilo com Histórico.

### 📦 F. Catálogo
- **Ações Disponíveis:** Novo Item, Filtros (scroll), Buscar, Editar, Duplicar, Excluir.
- **Problemas Visuais:** Chips de filtros com scroll horizontal funcionam, mas o padding inicial está colado na borda esquerda.
- **Severidade:** P2.
- **Decisão:** Ajustar padding do scroll.

### 📊 G. Relatórios
- **Ações Disponíveis:** Alternar Tabs, Ver métricas.
- **Problemas Funcionais:** Botão de PDF/Exportar não foi encontrado ou não está visível no mobile.
- **Severidade:** P1 (Se for feature prometida).
- **Decisão:** Implementar ou remover placeholder.

### ➕ H. Mais / Menu
- **Navegação Errada:** **[CRÍTICO]** Clicar em "Mais" no Bottom Nav abre Configurações (Settings), mas clicar em "Mais" na Sidebar abre Clientes (Base).
- **Duplicação:** "Relatórios" existe como item principal na Sidebar e como item na lista de Configurações.
- **Funções Apenas Visuais:** Backup e Segurança parecem ser painéis de informação, sem ações claras de execução.
- **Severidade:** P0 (Navegação inconsistente).
- **Decisão:** UNIFICAR NAVEGAÇÃO IMEDIATAMENTE.

---

## 🚩 Problemas Críticos Encontrados (Resumo)

| Problema | Tela | Severidade | Classificação |
| :--- | :--- | :--- | :--- |
| Navegação Sidebar vs Bottom Nav inconsistente | Global | P0 | Corrigir agora |
| Botão "Finalizar" duplicado e conflitante | Novo Orçamento | P1 | Unificar |
| Relatórios duplicados em menus diferentes | Global | P1 | Remover da Sidebar |
| Sticky Preview cobre botões de ação | Novo Orçamento | P1 | Corrigir agora |
| Falta de ação clara em Backup/Segurança | Mais | P2 | Corrigir depois |

---

## 🚀 Recomendação de Ordem de Correção (P92+)

1.  **Navegação e Menus:** Unificar a lógica de "Mais" e limpar a Sidebar (remover o que já está no Bottom Nav ou no Menu Mais).
2.  **Novo Orçamento:** Resolver a duplicidade do botão Finalizar e garantir que o Sticky Preview não bloqueie o uso.
3.  **Histórico:** Refinar a ação de exclusão para evitar acidentes.
4.  **Catálogo:** Ajustar respiro (padding) nos filtros.
5.  **Financeiro/Relatórios:** Melhorar a distinção visual e funcional.

---

## ✅ Decisão Final
**PRONTO PARA CORREÇÃO TELA POR TELA.**
A auditoria revelou que, embora o layout esteja estruturalmente correto (sem quebras de largura), a **arquitetura de navegação e a hierarquia de ações** estão confusas e redundantes.

**Status Final:** AUDITORIA CONCLUÍDA.
