# AFERIX ATTENTION PRIORITY SYSTEM
**Status: ENFORCED | Focus: ATTENTION ECONOMY**

## 1. THE PRIORITY HIERARCHY
O sistema de atenção organiza todos os elementos visuais em quatro níveis de prioridade semântica.

### P0 — CRITICAL (Actionable Emergency)
- **Definição:** Informação que exige interrupção imediata (ex: Erro de sync, Orçamento recusado).
- **Tratamento:** Máximo contraste, cores de alerta, z-index superior, desfoque de fundo intenso.

### P1 — PRIMARY (Operational Core)
- **Definição:** O objetivo principal da tela (ex: Valor total, Título do projeto).
- **Tratamento:** Tipografia hero, cores de destaque, posição central/topo, movimento fluido.

### P2 — SECONDARY (Support Context)
- **Definição:** Dados que dão suporte à decisão (ex: Lista de materiais, Histórico).
- **Tratamento:** Tons de cinza, pesos médios, opacidade reduzida (0.6 a 0.8), animações discretas.

### P3 — AMBIENT (Passive Infrastructure)
- **Definição:** Metadata e infraestrutura visual (ex: Datas de sistema, Versão, Backgrounds).
- **Tratamento:** Baixo contraste, opacidade mínima (0.3 a 0.5), sem movimento, tipografia micro.

## 2. ATTENTION ORCHESTRATION RULES
- **Competing Focus:** Nunca exiba dois elementos P1 com o mesmo peso visual simultaneamente. Use o `focusOrchestrator` para decidir qual domina o olho.
- **De-prioritization:** O sistema deve automaticamente reduzir o brilho de zonas P2/P3 quando o usuário interage com um input P1.
- **Visual Tension:** Aumente o espaçamento ao redor de itens P0 para criar gravidade visual.
