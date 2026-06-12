# P110 — AFERIX DESIGN PARITY AUDIT
**Status:** Audit Concluído | **Diretriz Absoluta:** O projeto Lovable é a Fonte da Verdade.

## 1. Diagnóstico de Divergência (O Problema do "UX Inventado")
A arquitetura do Aferix estava sofrendo de "Deriva de Design". Como executor técnico, eu estava tentando preencher lacunas de UX com soluções de "SaaS genérico", resultando na sensação mista de "dois apps em um".

Com a **AFERIX_DESIGN_SPEC.md** atuando como lei, o objetivo técnico agora é 100% de paridade. O código não pensa UX, o código executa UX.

## 2. A Maior Dívida Identificada: `premiumSystem.css`
A auditoria revelou um arquivo legado massivo: `src/styles/premiumSystem.css` com **65KB de tamanho**.
*   **O Problema:** Este arquivo é uma relíquia do "OrcaOS". Ele contém centenas de regras rígidas, media queries antigas e cores em `rgba` e `hex` que competem e sobrescrevem os nossos novos tokens `oklch`.
*   **A Causa do Ruído:** A densidade visual errada, o "excesso de caixas" e o comportamento responsivo inconsistente vêm das regras globais deste arquivo.
*   **Ação Imediata:** Este arquivo deve ser **DELETADO**. A aplicação deve sobreviver apenas com `global.css`, `tokens.css` e `aferixTheme.css`.

## 3. Elementos Fora do Padrão (Falta de Paridade)

### A. A Tela de Relatórios (`ReportWorkspace.tsx`)
*   **Status Atual:** Usa um layout de dashboard estilo "Startup" (Tabs, MetricCards pequenos, Hero section customizada).
*   **Design Parity:** O ERP Premium exige "Números Fortes e Silêncio Visual". A tela deve usar os novos `KpiCard` (elevation-2), listas limpas (sem bordas internas) e focar estritamente no DRE e na carteira.
*   **Ação:** Refatorar completamente usando o `Surface` e os espaçamentos modulares (`sz-lg`).

### B. A Tela de Clientes (`ClientWorkOrderWorkspace.tsx`)
*   **Status Atual:** Formulários com densidade inconsistente e avisos em cores legacy (`--color-orange-600`).
*   **Design Parity:** Precisa adotar o padrão de 48px de touch target e os tokens de status (`--status-warning`).

### C. Densidade Visual e "Silêncio"
*   **Status Atual:** Muitos componentes usam bordas explícitas (`1px solid border-soft`) onde o simples uso de espaçamento e tipografia resolveria.
*   **Design Parity:** O software premium respira mais. Onde couber, removeremos as bordas das `ListCard` e usaremos divisores apenas quando necessário.

## 4. Plano de Execução (Strikes de Paridade)

1.  **Strike 1 (Limpeza Profunda):** Deletar `premiumSystem.css` e `aferixUtilities.css`. Remover seus imports do `main.tsx`.
2.  **Strike 2 (Correção em Cascata):** O Strike 1 vai quebrar o layout de algumas telas antigas. Corrigiremos tela a tela (Relatórios, Clientes, Catálogo) forçando-as a usar a API limpa do componente `Surface`.
3.  **Strike 3 (Refinamento do Modo Campo):** Transformar o `FieldWorkTool` no "Modo Missão" (botões gigantes, foco extremo), garantindo a sensação "mão-suja" solicitada.

A regra agora é clara: **O Frontend segue o Lovable. Ponto final.**

Deseja autorizar o **Strike 1** (Deletar o CSS legado e purificar o main.tsx)? Isso causará quebras temporárias na UI, mas é o único caminho para a paridade real.
