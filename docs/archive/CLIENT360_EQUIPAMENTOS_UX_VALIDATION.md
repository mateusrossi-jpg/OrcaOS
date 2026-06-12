# VALIDAÇÃO DE UX — ABA EQUIPAMENTOS (CLIENT360)

Este documento apresenta o estudo de usabilidade e validação de fluxo para a aba **Equipamentos** do módulo **Client360**, focando em facilidade de campo, uso com uma única mão sob a luz do sol, velocidade de busca e registro de intervenções.

---

## 1. JORNADA E DÚVIDAS CRÍTICAS DO OPERADOR

### A. Como o técnico encontra rapidamente um equipamento?
* **Mapeamento do Fluxo**:
  1. O técnico acessa o menu do Cliente ou entra na Ordem de Serviço em andamento.
  2. No topo da aba de Equipamentos, encontra uma barra de pesquisa unificada (`SearchInput`) que filtra instantaneamente no IndexedDB (Dexie) por: **Nome**, **Modelo**, **Número de Série** ou **TAG** (ex: `CH-01`).
  3. Logo abaixo, ele conta com *Pills de Categoria* (Elétrica, CFTV, Automação, Climatização, Manutenção) para filtrar a lista inteira com 1 toque.
* **Gesto Proibido**: Gestos de deslizar para os lados (swipe) em itens da lista para revelar ações ocultas (ex: excluir ou editar) são proibidos. Ações críticas devem ser explícitas.

### B. Como ele abre a ficha?
* **Mapeamento do Fluxo**:
  * O card do equipamento atua como um único e grande alvo de toque (*Touch Target* de no mínimo `80px` de altura).
  * Tocar em qualquer área do card abre a ficha de detalhes do equipamento em um layout de coluna única e rolagem vertical, sem drawers com submenus aninhados ou transições lentas.
* **Acessibilidade**: Layout de card com alta legibilidade (textos em contraste de oklch), ideal para técnicos em telhados ou casas de máquinas com luz solar direta.

### C. Como ele vê o histórico?
* **Mapeamento do Fluxo**:
  * Ao abrir a ficha do equipamento, a visualização padrão já é dividida em duas abas simples no topo: **[Ficha Técnica]** e **[Histórico de Manutenção]**.
  * A aba **Histórico** lista as últimas OSs concluídas, checklists respondidos e anomalias registradas em ordem cronológica reversa (a última intervenção no topo), com links clicáveis para abrir o relatório gerado.

### D. Como ele adiciona um novo equipamento?
* **Mapeamento do Fluxo**:
  * Um botão flutuante de Ação Rápida (P0 - Gold) com o ícone `Plus` fica permanentemente visível no canto inferior direito da tela.
  * Tocar nele abre o formulário de cadastro em coluna única (fácil de preencher no celular) contendo validação de campos obrigatórios (Nome, Categoria e Marca) e o atalho de câmera nativa do celular para anexar fotos de placa de identificação com 1 toque.

---

## 2. VALIDAÇÃO DE MÉTRICAS OPERACIONAIS (AUDITORIA DE CLIQUES)

Abaixo está o cálculo analítico do esforço exigido pelo técnico para realizar as ações mais frequentes:

```
[Fluxo 1: Encontrar Equipamento & Ver Histórico]
Home ──(1 clique)──> Agenda ──(1 clique)──> OS/Cliente ──(1 clique)──> Ficha Ativo ──(1 clique)──> Histórico
Total: 4 cliques | Carga Cognitiva: Mínima (Caminho Guiado)

[Fluxo 2: Registrar Nova Intervenção no Equipamento]
Ficha Ativo ──(1 clique)──> "Iniciar OS / Checklist"
Total: 1 clique a partir da ficha do equipamento | Carga Cognitiva: Nula
```

| Indicador | Meta | Medido na Arquitetura | Status |
| :--- | :--- | :--- | :--- |
| **Quantidade de Cliques (Busca)** | $\le$ 3 cliques | **2 cliques** (Busca + Seleção) | **CONFORME** |
| **Quantidade de Cliques (Cadastro)**| $\le$ 4 cliques | **3 cliques** (Botão Novo + Preencher + Salvar) | **CONFORME** |
| **Carga Cognitiva (Entendimento)** | Exibição em < 3s | **Imediato (Local-First)** | **CONFORME** |
| **Acessibilidade (Tamanho Alvo)** | $\ge$ 48px | **Cards com 80px / Botões com 48px** | **CONFORME** |

---

## 3. DIRETRIZES DE NÃO-COMPLEXIDADE (RESTRIÇÕES EXECUTIVAS)

* **Sem Drawers Complexos**: Gavetas de tela que cobrem metade do visor ou exigem gestos de puxar para fechar são proibidas. O modal deve abrir em tela cheia com um botão visível e óbvio de fechar (`X` ou `"Fechar"`) no topo direito, facilitando o fechamento com uma só mão.
* **Sem Menus Ocultos (Hidden Hamburger)**: Todas as opções principais (Ficha, Histórico, Checklists) devem estar impressas na tela como guias horizontais claras.
* **Visual Premium Clean**: Fundo preto profundo (`--bg-primary: #050505`) e texto branco nítido garantem o visual sério da ferramenta sem a necessidade de efeitos gráficos pesados de desfoque ou gradientes coloridos que poluem a legibilidade no sol.
