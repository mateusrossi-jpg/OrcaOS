# REFERÊNCIA DE UI — ABA EQUIPAMENTOS (CLIENT360)

Este documento define a referência oficial de interface (UI Design Reference) para a aba **Equipamentos** do módulo **Client360**. Ele estabelece a hierarquia visual, estrutura de componentes, cores, spacings e padrões de estado de acordo com os princípios de congelamento de layout do **Aferix Visual Protocol** (alinhado com as especificações `HOME_V33` e `AGENDA_V28`).

---

## 1. O QUE O TÉCNICO VÊ AO ABRIR A ABA

A tela é otimizada para uso em campo com uma única mão (Mobile-First / Field-First), contendo 4 seções principais:

```
+------------------------------------------+
|  [Voltar]  Equipamentos (12)             | <- Header com Contador
+------------------------------------------+
|  [ Pesquise por Tag, Nome, Série... ]    | <- SearchInput (Foco Rápido)
+------------------------------------------+
|  (Elétrica)  (CFTV)  (Climatização) [>]  | <- Horizontal Scroll Pills
+------------------------------------------+
|  +------------------------------------+  |
|  | [CH-01]  CHILLER CONDENSAÇÃO       |  | <- Card Tipo A (Alerta / Crítico)
|  | Marca: Carrier | Modelo: 30XW      |  |
|  | Status: CRITICAL (Vermelho)        |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | [EL-04]  QUADRO DISTRIBUIÇÃO       |  | <- Card Tipo B (Operacional Normal)
|  | Marca: Siemens | Modelo: Q-100     |  |
|  | Status: ACTIVE (Verde)             |  |
|  +------------------------------------+  |
+------------------------------------------+
|                 [ + ]                    | <- Floating action button (FAB) Gold
+------------------------------------------+
```

---

## 2. COMPOSIÇÃO DOS ELEMENTOS E COMPONENTES

### A. Barra de Busca (`SearchInput`)
* **Aparência**: Caixa de entrada escura com bordas sutis. Fundo `#10141B` (`--bg-surface-elevated`), borda `rgba(255, 255, 255, 0.08)` e ícone de lupa discreto à esquerda.
* **Comportamento**: Filtro instantâneo em tempo real sem botão de submissão (pesquisa reativa local).

### B. Filtros Rápidos (`PillFilters`)
* **Estilo**: Carrossel horizontal de rolagem livre (sem quebra de linha).
* **Estados**:
  * **Selecionado**: Fundo em ouro transparente (`rgba(212, 169, 78, 0.1)`) com borda e texto em dourado (`--accent-gold`).
  * **Não Selecionado**: Fundo transparente, borda suave (`rgba(255, 255, 255, 0.08)`) e texto cinza legível (`--text-secondary`).

### C. Lista de Equipamentos (Cards)
Os cards seguem o padrão `AferixCard` (`variant="b"` para ativos normais, `variant="a"` com borda dourada/vermelha para ativos que requerem atenção imediata):
* **Identificador Primário (`Tag`)**: Impresso em caixa alta e fonte monoespaçada com cor dourada (ex: `[CH-01]`), localizado no canto superior esquerdo do card.
* **Nome do Equipamento**: Texto em destaque branco (`--text-primary`), peso ultra-negrito (`--fw-black`).
* **Dados Técnicos**: Grid compacto de duas colunas com Marca e Modelo na primeira linha, e Número de Série na segunda linha em cinza médio (`--text-secondary`).
* **Status Visual (`StatusPill`)**:
  * `ACTIVE`: Badge verde (`--accent-green` / `tone="success"`) -> *Ativo*.
  * `MAINTENANCE`: Badge amarelo/dourado (`--accent-gold` / `tone="brand"`) -> *Em Manutenção*.
  * `CRITICAL`: Badge vermelho/alerta (`--accent-red` / `tone="danger"`) -> *Crítico*.
  * `REPLACED` / `DECOMMISSIONED`: Badge cinza (`tone="neutral"`) -> *Desativado*.

### D. Indicadores de Garantia
* Exibição em fonte monoespaçada e tamanho pequeno (`text-[10px]`), indicando a expiração da garantia:
  * Fabricante: `GAR. FAB: 12/2026` (neutro).
  * Serviço prestado: `GAR. SERV: 08/2026` (verde se ativa, vermelho se expirada).

### E. Estado Vazio (`Empty State`)
* Apresentado quando a busca não retorna resultados ou o cliente não tem ativos cadastrados.
* **Visual**: Ícone minimalista desbotado de uma ferramenta ou caixa (opacidade `0.1`), seguido pelo texto em cinza labels: *"Nenhum equipamento cadastrado neste local. Toque no botão '+' abaixo para cadastrar."*

---

## 3. FICHA DETALHADA E HISTÓRICO RESUMIDO

Ao tocar em um equipamento, abre-se a tela de detalhes (ficha):
* **Ficha Técnica**: Exibe todas as especificações, data de instalação, data de última vistoria e o campo de observações gerais (`notes`).
* **Histórico Resumido**:
  * Uma trilha vertical simplificada contendo no máximo as **3 últimas execuções** (concluídas).
  * Cada linha mostra: Data da execução, Status do checklist (Conforme / Não-Conforme) e fotos associadas em formato thumbnail horizontal.
  * Botão utilitário `"Ver Histórico Completo"` direciona para a aba de laudos e evidências filtrada.

---

## 4. HIERARQUIA VISUAL E DIRETRIZES DE ESTILO

* **Espaçamento Central**: Margens de tela fixadas em `24px` (margem interna de cartões em `16px`).
* **Tipografia**:
  * Título de equipamentos: `14px`, peso `900` (Ultra-bold), UPPERCASE.
  * Etiquetas técnicas (Marca, Série): `12px`, peso `500` (Medium), `--text-secondary`.
  * Datas e Garantias: `10px`, peso `700` (Bold), fonte monoespaçada.
* **Sem Complexidade**: A tela não possui painéis administrativos, relatórios de custo geral de ativos ou dashboards de frota corporativa. O foco é a identificação física rápida no local do serviço.
