# AFERIX FIELD WORKSPACE AUDIT
**Status:** UX Execution Mode | **Target:** Field Worker Experience

## Objetivo
Transformar o workspace do técnico em uma ferramenta operacional pura, de "trilhos", sem distrações administrativas. O técnico não gerencia negócios; o técnico **executa serviços e coleta evidências**.

## 1. O que DEVE ser mostrado (Focus)
- **Agenda / Next OS:** Qual é o meu próximo destino?
- **Mapa/Navegação:** Como chego lá?
- **Locais & Ativos (no contexto da OS):** Qual é o equipamento que vou consertar?
- **Checklist de Execução:** O que preciso verificar passo a passo?
- **Anomalias (Criação rápida):** Tem algo quebrado aqui que eu devo reportar para o Comercial vender?
- **Evidências (Fotos):** Antes e Depois obrigatórios.
- **Assinatura:** Tela de aceite do cliente no local.
- **Histórico Próprio:** "Quantas OS eu fechei hoje?"

## 2. O que DEVE ser removido (Hide)
- ❌ Dashboards financeiros (MRR, Receita, Churn).
- ❌ Valores de peças, serviços ou contratos (R$).
- ❌ Módulo de Vendas / Propostas (Apenas relata anomalia; não orça).
- ❌ Gestão de Dispatch de outros técnicos.
- ❌ Indicadores corporativos ou KPIs que não sejam de sua própria execução diária.
- ❌ Menus laterais complexos ("Hamburger" menu cheio de módulos que ele não usa).

## 3. Diretrizes de UX (Cognitive Load)
- **Zero Scroll Vertical:** A tela da OS em andamento deve caber na tela. 
- **Big Buttons:** O técnico está na rua, sob sol, talvez com luvas. Áreas de toque grandes (mínimo 48x48px).
- **Offline Implícito:** Salvar tudo localmente sem "loading spinners" bloqueantes.
- **Um Caminho:** Iniciar Deslocamento -> Cheguei -> Iniciar Trabalho -> Preencher Checklist -> Coletar Assinatura -> Finalizar. O botão primário deve guiar esse fluxo.
