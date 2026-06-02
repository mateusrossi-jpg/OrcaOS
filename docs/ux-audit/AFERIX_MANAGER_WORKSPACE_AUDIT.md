# AFERIX MANAGER WORKSPACE AUDIT
**Status:** UX Execution Mode | **Target:** Operations Manager Experience

## Objetivo
Transformar o workspace do gestor em uma torre de controle. O gestor precisa de densidade de informação para controlar a operação, prever atrasos e garantir SLA.

## 1. O que DEVE ser mostrado (Focus)
- **Equipe (Disponibilidade):** Quem está trabalhando, quem faltou, quem está ocioso.
- **Dispatch e Calendário:** Visão Gantt/Mapa de quem está onde.
- **OS Atrasadas e Emergências:** Alertas de quebra de SLA piscando no topo.
- **Fila de Controle de Qualidade:** OS finalizadas pendentes de revisão técnica antes de liberar para faturamento.
- **Capacidade Ocupada vs Livre:** Quantas OS ainda cabem na agenda desta semana?
- **Garantias e Retrabalho:** Controle do passivo técnico da empresa.
- **Logística e Peças:** Requisições de material para as OS aprovadas.

## 2. O que DEVE ser removido (Hide)
- ❌ Margens de lucro e fluxos financeiros estratégicos (deve focar no custo operacional de horas, não na margem financeira final, a menos que autorizado pelo Owner).
- ❌ Edição de contratos comerciais complexos.
- ❌ Visão "Home" de técnico (O gestor olha o todo, não apenas a próxima OS).
- ❌ Knowledge base puramente administrativo.

## 3. Diretrizes de UX (Cognitive Load)
- **DataGrid Premium:** Uso intensivo de tabelas filtráveis, ordenáveis e agrupáveis.
- **Bulk Actions:** Poder selecionar 50 OS e mudá-las para a próxima semana com 2 cliques.
- **Color Coding de SLA:** Verde (No prazo), Amarelo (Risco), Vermelho (Estourado).
- **Zero Reloads:** Busca rápida, paginação inteligente, filtros que persistem na URL.
