# Field Readability Audit: Aferix OS
*Data da Auditoria: 2026-05-31*

## Objetivo
Analisar os componentes da interface do Aferix OS focando rigorosamente no uso em condições operacionais de campo: luz solar direta, deslocamentos, reflexos em veículos e atenção parcial do operador.

## Mapeamento de Fricção Visuais

### 1. Textos com contraste insuficiente (Labels & Metadados)
* **Localização:** Componentes `SectionLabel`, `Subtitle` e textos secundários em tipografia base.
* **Referência:** Textos utilizando classes como `text-[10px] uppercase text-[var(--text-secondary)]` (`#808080`) e frequentemente sobrecarregados com `opacity-50`.
* **Nível de Severidade:** 🔴 Alta
* **Impacto em uso externo:** Sob o sol forte, a combinação de fontes diminutas (`10px`), caixa alta com tracking, cor cinza e opacidade reduzida simplesmente "derrete" no fundo grafite escuro (`#050505`). O usuário é incapaz de ler rapidamente os rótulos contextuais ou dados secundários cruciais como "dias inativos".
* **Correção Recomendada:** Eliminar o uso de `opacity-*` nestes componentes. O `var(--text-secondary)` deve ter a luminosidade aumentada (para algo próximo a `#B3B3B3`), e o peso da fonte em labels minúsculos deve ser sempre `bold` ou `black` para compensar.

### 2. Chips com baixa visibilidade (Muted/Default)
* **Localização:** `src/ui/system/Badges.tsx` (Variantes `default` e `muted`) e tags inativas no `OpsChip`.
* **Referência:** Badge variante `muted` utilizando fundo `white/[0.02]` com fonte `text-[var(--text-tertiary)]` (`#3C3C3C`).
* **Nível de Severidade:** 🚨 Crítica
* **Impacto em uso externo:** O tom `#3C3C3C` sobre fundo `#050505` ou `#0a0a0a` possui um contraste perigoso (~1.3:1), o que o torna invisível no ambiente automotivo diurno. Informações vitais disfarçadas de chips secundários são perdidas.
* **Correção Recomendada:** Abolir completamente o `#3C3C3C` para qualquer texto que exija leitura. Ele deve ser relegado estritamente a bordas decorativas de fundo. A variante `muted` deve possuir texto no mínimo em `white/[0.5]`.

### 3. Timelines e Dossiês com contraste baixo
* **Localização:** Dossiê 360º de Clientes (`ClientsWorkspace.tsx`) > Aba `RESUMO` (Timeline).
* **Referência:** As descrições dos eventos (`evt.description`) estão aplicadas com `opacity-60` (Classe `Subtitle`).
* **Nível de Severidade:** 🟡 Média/Alta
* **Impacto em uso externo:** O profissional estaciona o carro e tenta ver o histórico daquele cliente antes de descer. Textos de histórico cinzas em ambientes iluminados obrigam a fechar os olhos ou fazer sombra com a mão para ler.
* **Correção Recomendada:** Textos de conteúdo longo (descrições de fatos) devem usar branco `var(--text-primary)`, mantendo a hierarquia textual pela redução sutil de tamanho (`12px` ou `13px`) e *line-height* relaxado, mas NUNCA matando a luz do texto.

### 4. Inputs com hierarquia fraca (Zonas de Toque Invisíveis)
* **Localização:** Componentes de Input (`Input`, `TextArea`, `Select`) no Design System e modais de cadastro.
* **Referência:** Bordas super sutis `border-white/[0.08]` e `bg-[#0F0F0F]` que se camuflam com o fundo da tela.
* **Nível de Severidade:** 🔴 Alta
* **Impacto em uso externo:** Embaixo do sol, o usuário não consegue identificar com clareza os limites do campo de input (affordance tátil prejudicada). Isso gera toques em branco fora do campo, frustrando a digitação ágil.
* **Correção Recomendada:** O estado de *idle* (repouso) dos formulários precisa de maior constraste estrutural: bordas em `white/[0.15]` ou fundos perceptivelmente mais claros `white/[0.04]`. O placeholder precisa de contraste AA, não apenas A.

### 5. Informações vitais utilizando paleta secundária
* **Localização:** Telas financeiras e resumos executivos (LTV, Saldos, Totais da OS).
* **Referência:** O uso exagerado do `compact` mode e fontes sutis para grandes blocos de números.
* **Nível de Severidade:** 🟡 Média
* **Impacto em uso externo:** O usuário varre o painel procurando o "lucro". Se o número está com opacidade ou cor apagada, exige tempo cognitivo.
* **Correção Recomendada:** Valores financeiros (Nível 1 de Informação) e Status sempre devem pular na tela com `opacity-100` e tipografia `font-black` ou cor de acento sólida e saturada.

### 6. Elementos visuais belos, mas de leitura exaustiva
* **Localização:** Mensagens de "Sem Dados", "Lista Vazia", Rótulos artísticos.
* **Referência:** Uso de `font-mono tracking-[0.2em] uppercase opacity-40`.
* **Nível de Severidade:** 🟢 Baixa
* **Impacto em uso externo:** O *tracking* extremo (espaçamento exagerado entre letras) dificulta os movimentos sacádicos do olho durante a leitura dinâmica, atrasando o escaneamento na pressa.
* **Correção Recomendada:** Limitar o *tracking* extremo exclusivamente para micro-rótulos curtos de no máximo 2 ou 3 palavras curtas (ex: `STATUS`, `LTV_ACUM`). Em frases maiores como `SEM_INTELIGÊNCIA_DE_BASE`, usar `tracking-wider` com contraste decente.
