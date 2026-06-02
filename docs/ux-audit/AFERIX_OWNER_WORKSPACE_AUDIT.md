# AFERIX OWNER WORKSPACE AUDIT
**Status:** UX Execution Mode | **Target:** Owner / CEO Experience

## Objetivo
Transformar a visão do Owner em um Cockpit estratégico. O dono não quer operar o sistema; ele quer ler a saúde da empresa em 10 segundos e aprovar o que está travado.

## 1. O que DEVE ser mostrado (Focus)
O dashboard do owner responde imediatamente a 3 eixos:

**A. RECEITA (Money)**
- Faturamento do mês (Realizado vs Meta).
- MRR (Receita Recorrente de Contratos).
- Valor total aprovado em Propostas vs Perdido.

**B. RISCO (Risk)**
- Churn Rate (Contratos cancelados).
- Clientes em Vermelho (Health Score Crítico).
- SLA de Execução (Quantas OS estouradas na semana).
- Capital Imobilizado no Estoque.

**C. AÇÃO (Action Required)**
- Propostas solicitando desconto excessivo aguardando "De Acordo".
- Compras fora da alçada do gestor aguardando aprovação financeira.

## 2. O que DEVE ser removido (Hide)
- ❌ Operação granular (Atribuir João para a OS 1234).
- ❌ Preenchimento de checklist técnico.
- ❌ Cotação de parafuso no estoque.
- ❌ Ruído operacional diário que deve ser resolvido pelo Manager.

## 3. Diretrizes de UX (Cognitive Load)
- **Management by Exception:** O dashboard não mostra o que está normal; mostra apenas o que está incrivelmente bem (Metas Batidas) ou o que está falhando (Exceções que requerem ação).
- **Drill-down:** Começa com um número macro (Receita: R$ 50k). Se o owner clicar, desce para os clientes. Se clicar de novo, desce para os contratos.
- **Clareza Absoluta:** Fontes grandes (Premium Typography), uso de espaços em branco. Nada de "dashboards de Excel" esmagados na tela.
