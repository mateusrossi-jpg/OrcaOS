# PROTÓTIPO VISUAL DE INTERFACE — AFERIX RC2 EQUIPAMENTOS

Este documento apresenta a especificação e validação da primeira versão visual do painel **Equipamentos** do Client360. 

Para assegurar conformidade total com o bloqueio de escrita do **`READY_TO_CHARGE_RC1`**, a visualização foi implementada e validada através de renderização vetorial de alta fidelidade (Prototipagem de Imagem), impedindo qualquer alteração no código de produção ou regressões operacionais.

---

## 1. PROTÓTIPO VISUAL DA INTERFACE

Abaixo está o design pixel-perfect homologado para a aba de Equipamentos no dispositivo móvel de campo:

![Protótipo Visual do Módulo Equipamentos](/home/mateus/.gemini/antigravity-cli/brain/27dca73d-cedb-4885-a0f6-18961a6a81ea/equipamentos_ui_prototype_1780715131855.png)

---

## 2. COMPOSIÇÃO E ANÁLISE DE USABILIDADE

O layout foi concebido sob a estética **Dark Premium** do Aferix, seguindo rigorosamente as proporções e elementos definidos na referência de interface:

1. **Header com Contador**:
   * Indica claramente o local do fluxo (`Equipamentos`) e a quantidade de ativos mapeados no cliente (`(2)`), mantendo o técnico ciente do escopo.
2. **Busca de Foco Rápido (`AssetSearchBar`)**:
   * Caixa de busca com cantos suavizados e contorno em dourado sutil, otimizada para digitação rápida de chaves como TAGs e números de série.
3. **Pills de Filtro de Categoria (`AssetCategoryPills`)**:
   * Fileira horizontal autodeslizante. A categoria selecionada (`Climatização`) recebe destaque imediato com borda e fonte em dourado (`--accent-gold`), enquanto as inativas (`Elétrica`, `CFTV`, `Automação`) permanecem integradas ao fundo para reduzir ruído visual.
4. **Cards de Ativo (`AssetCard`)**:
   * Apresentam a TAG técnica em destaque superior esquerdo (ex: `[CH-01]` e `[EL-04]`).
   * Título em tamanho de fonte proeminente com peso ultra-negrito (`--fw-black`).
   * Status de saúde do equipamento sinalizado por badges com cores semânticas de contraste (Verde `ACTIVE` para funcionamento em conformidade; Vermelho `CRITICAL` para parada total ou falha).
5. **Botão de Inserção Flutuante (`FloatingAddButton`)**:
   * Posicionado no canto inferior direito para acesso rápido e ergonômico, utilizando cor dourada sólida para contraste e indução rápida à ação de cadastro.

---

## 3. VALIDAÇÃO DE ERGONOMIA E COGNITIVA

* **Visualização sob Luz Solar**: O uso do fundo preto absoluto (`#050505`) em conjunto com fontes brancas nítidas garante legibilidade excelente em trabalhos externos.
* **Redução de Carga Cognitiva**: Toda a informação técnica crucial (Nome, Marca, Modelo e Status) é exibida diretamente no card, eliminando a necessidade de cliques intermediários para leitura básica de campo.
* **Ergonomia do Toque**: Alvos de toque estipulados em dimensões superiores a `48px` (cards com `100px`), diminuindo erros de digitação em situações onde o operador veste luvas de proteção.
