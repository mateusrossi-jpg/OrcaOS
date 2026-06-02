# AFERIX COGNITIVE LOAD AUDIT
**Status:** UX Execution Mode | **Target:** Interface Friction Reduction

## Princípio Fundamental
**"Isso ajuda o usuário AGORA?"** Se não, remova. O usuário não quer usar o software; ele quer terminar a tarefa e voltar para a vida dele. O software é um pedágio. Nosso trabalho é reduzir o pedágio.

## 1. Eliminação de Ruído (Noise Reduction)

### Cards Redundantes
- **Problema:** Mostrar o nome do cliente 3 vezes na mesma tela (Header, Título do Card, Label da OS).
- **Ação:** O Contexto deve ser herdado. Se o usuário está na tela do Cliente, esconda a coluna "Cliente" nas tabelas filhas de OS e Ativos.

### KPIs Inúteis (Vanity Metrics)
- **Problema:** Mostrar "Total de OS criadas na história" para o gestor. Isso não gera ação.
- **Ação:** Substituir por "OS Atrasadas" (Requer Ação Imediata) ou remover.

### Textos Longos
- **Problema:** "Por favor, clique aqui para adicionar uma nova ordem de serviço ao sistema."
- **Ação:** Mudar para botão primário "Nova Ordem". "Don't Make Me Think".

### Ações Secundárias Concorrentes
- **Problema:** Tela com 5 botões de cores fortes (Salvar, Cancelar, Editar, Excluir, Imprimir) disputando atenção.
- **Ação:** Hierarquia estrita. **1 Ação Primária** (Amarelo Aferix), **1 Ação Secundária** (Outline ou Texto), O resto escondido no "Mais Opções" (Três pontos).

## 2. Refatoração Visual Prática

### Padrão de Modais (Slide-overs vs Popups)
- **Desktop:** Entidades longas (Criar OS, Editar Cliente) abrem em Slide-overs laterais à direita, mantendo o contexto da lista no fundo. Popups centrais APENAS para confirmações destrutivas ou rápidas.
- **Mobile:** Bottom Sheets. Nunca use popups no meio da tela que forcem esticar o dedo. Sempre áreas de toque no terço inferior da tela.

### Estados Vazios (Empty States)
- Nunca mostrar uma tela em branco com "Nenhum dado encontrado".
- Todo Empty State deve ser educativo e convidativo: Ícone bonito -> Título: "Ainda não há contratos" -> Subtítulo: "Crie o primeiro contrato para iniciar seu MRR" -> Botão: "Criar Contrato".

### Loading
- Esconder spinners bloqueantes (Loader de tela inteira).
- Usar Skeleton Loaders suaves para dar a sensação de que o app é mais rápido que a rede.
- Usar Mutação Otimista (Optimistic UI): Clicou em "Concluir", a UI atualiza na hora, o servidor resolve no fundo.
