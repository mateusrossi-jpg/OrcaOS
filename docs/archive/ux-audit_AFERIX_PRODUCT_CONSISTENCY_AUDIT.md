# AFERIX PRODUCT CONSISTENCY AUDIT
**Status:** UX Execution Mode | **Target:** "One Single Product" Feeling

## Objetivo
Erradicar o "Efeito Frankenstein" onde cada módulo parece ter sido feito por um time diferente. O Aferix deve parecer UM produto esculpido de um único bloco sólido.

## 1. Auditoria Estrutural

### Headers & Títulos
- Todas as telas de módulo (H1) devem ter a mesma fonte, peso, e padding no Top-bar.
- Se o Header da OS tem um breadcrumb, o Header de Clientes também deve ter, seguindo a mesma anatomia visual.

### Data Displays (Tabelas e Listas)
- A lógica de ordenação e filtro deve ser universal. O ícone de filtro não pode ser um funil na tela de OS e uma lupa na tela de Contratos.
- Paginação, Densidade de Linha e Ações Rápidas (Hover) devem usar o mesmo componente base em todo o sistema.

### Formulários & Inputs
- **Bordas:** Todos os inputs têm o mesmo raio de borda (`rounded-md` ou `rounded-lg`).
- **Estados:** Padrão universal para Hover, Focus (Ring Dourado) e Error (Ring Vermelho).
- **Labels:** Todos acima do input, com tamanho e cor idênticos (`text-sm text-neutral-400`). Sem mistura de placeholders e labels.

### Badges, Pills e Status
- Padronizar paleta semântica:
  - **Success / Finalizado:** Fundo Verde Escuro (Dark Premium), Texto Verde Brilhante.
  - **Warning / Pendente:** Fundo Laranja/Amarelo Escuro, Texto Amarelo Brilhante.
  - **Error / Atrasado:** Fundo Vermelho Escuro, Texto Vermelho Brilhante.
  - **Info / Draft:** Fundo Azul/Cinza Escuro, Texto Azul/Cinza Claro.
- O badge de "Ativo" no cliente DEVE usar a mesma classe CSS que o badge de "Ativo" no equipamento.

## 2. Padrões de Ação

### Sticky Footers (Mobile e Slide-overs)
- O botão de "Salvar" ou "Confirmar" SEMPRE fica ancorado no fundo da tela em dispositivos móveis, para alcance garantido do ergonomia, independente de quão longo seja o formulário.

### Modais de Confirmação (Destrutivos)
- Anatomia única: Título da ação destrutiva em Vermelho -> Texto explicativo claro ("Esta ação não pode ser desfeita") -> Botão de Cancelar (Cinza/Outline) à esquerda, Botão de Confirmar (Vermelho Sólido) à direita.

## 3. Tipografia e Espaçamento (Spacing Rhythm)
- **Hierarquia:** H1 (Tela), H2 (Seção), H3 (Card), Parágrafo, Caption. Aplicar os Design Tokens do Tailwind estritamente.
- **Whitespace:** Não ter medo de espaço em branco (ou preto, no tema Dark). Eliminar a tendência de esmagar componentes usando margens de 4px. Respeitar o sistema de Grid do Tailwind (`gap-4`, `gap-6`).

*A consistência gera confiança. Se o botão de salvar está sempre no mesmo lugar e tem sempre a mesma cor, a carga cognitiva de aprendizado vai a zero.*
