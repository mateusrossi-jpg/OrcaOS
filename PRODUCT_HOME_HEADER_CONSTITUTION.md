# Aferix — Home & Header Constitution V1

A partir deste momento, a **HOME** do Aferix torna-se a referência oficial de UX, UI e Design System para toda a plataforma. Nenhuma tela ou módulo futuro deve criar padrões próprios antes de consultar, herdar e reutilizar as regras e componentes definidos na Home e no Header.

---

## 1. Diretriz de Governança
* **A Home é a tela-mãe** do sistema: a fonte primária de verdade de design e comportamento do Aferix.
* **O Header é universal**: um componente global obrigatório em qualquer tela.
* **Herdabilidade Total**: todas as outras telas devem herdar a mesma linguagem visual. Nenhuma tela futura pode inventar novos padrões (cores, espaçamentos, hierarquia, cards, botões, badges, notificações, comportamento).
* **Consistência Estrita**: toda nova tela deve parecer uma evolução direta da Home, e nunca um sistema à parte.

---

## 2. O Header Universal
O Header deixa de ser específico da Home e passa a ser um componente global obrigatório. O mesmo padrão estrutural e visual deve ser mantido em:
* Home (Início)
* Clientes
* Orçamentos
* Agenda
* Financeiro
* Relatórios
* Configurações
* Qualquer módulo futuro

### Estrutura do Header
1. **Esquerda (Menu Hambúrguer)**
   * **Função**: Abrir navegação lateral (Side Drawer).
   * **Comportamento**: Sempre presente, com o mesmo tamanho de ícone, alinhamento e área de toque mínima de `44px x 44px`.
2. **Centro (Título Contextual)**
   * **Função**: Indicar a tela atual (ex: *Início*, *Clientes*, *Orçamentos*, *Agenda*, *Financeiro*).
   * **Comportamento**: Tipografia consistente, peso de fonte e cor herdados diretamente. Nunca utilizar estilos diferentes ou fontes alternativas por módulo.
3. **Direita (Notificações)**
   * **Função**: Central de notificações rápida e universal.
   * **Requisitos**: Deve possuir um badge de quantidade numérico.
   * **Estados Visuais**:
     * *Sem Notificações*: Ícone simples em cor neutra, sem badge.
     * *Notificações Pendentes*: Badge discreto na cor principal (Amarelo Aferix).
     * *Notificações Críticas*: Badge destacado na cor de alerta (Vermelho).
   * **Restrição**: Evitar excesso de cores ou poluição visual, mantendo a identidade premium do sistema.

---

## 3. Identidade Visual Oficial (Dark Premium)
O tema oficial é o **Dark Premium**, projetado para uso sob luz solar intensa e baixa fadiga cognitiva em campo:

* **Base Cromática**:
  * **Preto Profundo (`#2C2C2E` a `#262628`)**: Fundo principal (Background Canvas) para contraste elegante.
  * **Grafite Escuro (`#363638`, `#3A3A3C`)**: Camadas de profundidade para cards, campos de busca e inputs.
* **Cor Principal (Amarelo/Dourado Aferix - `#FFD60A`)**:
  * Usada estritamente para seleções, estados ativos, CTAs secundários importantes e indicadores críticos de atenção.
* **Verde de Sucesso (`#30D158`)**:
  * Reservado única e exclusivamente para sucesso financeiro (receitas, lucros) ou conclusões positivas de processos.
* **Vermelho de Alerta (`#FF453A`)**:
  * Reservado única e exclusivamente para erros críticos, atrasos operacionais ou pendências financeiras vencidas.
* **Restrições Estéticas**:
  * Evitar cores decorativas sem significado funcional.
  * Evitar qualquer estética gamer ou cyberpunk.
  * Evitar excesso de ícones que poluam o fluxo visual.
  * O Aferix é uma ferramenta profissional de trabalho de altíssimo nível.

---

## 4. A Home como Referência de Componentes
Toda decisão de design em novos módulos deve responder à pergunta mestre:
> *"Este componente parece pertencer à Home?"*

Se a resposta for não, o componente deve ser redesenhado.

### Padrões Obrigatórios a Reutilizar:
* **Espaçamentos**: Margens e paddings consistentes com os cartões da Home (ex: `p-6` para cards, `gap-10` para divisões).
* **Bordas e Raios**: Cards com `rounded-[24px]` ou `rounded-[28px]`, sem bordas visíveis exceto em foco ou seleção.
* **Botões**: Altura padrão (`h-14` / 56px para botões principais), estilo pílula (`rounded-full`) ou cantos suavizados (`rounded-[16px]`).
* **Tipografia & Hierarquia**: Títulos principais em `24px`, subtítulos em `15px`, meta-dados em `13px` / `12px`.
* **Componentes de Controle**: Inputs estilo ChatGPT iOS (`h-12`, `rounded-[14px]`, background contrastante), popovers, modais, dropdowns e toasts devem seguir estritamente o comportamento da Home.
* **Estados Vazios (Empty States)**: Centralizados visualmente, usando a convenção de texto claro e call-to-action minimalista central.

---

## 5. Princípios de Experiência do Usuário (UX)
Qualquer fluxo ou tela nova no Aferix precisa cumprir os seguintes pilares operacionais:
* **Mobile First**: Desenvolvido prioritariamente para a tela do celular.
* **Field First**: Otimizado para o uso real do operador em campo, sob reflexo solar e movimentação.
* **Action First**: Foco em executar ações com o menor número de cliques possíveis.
* **Baixa Carga Cognitiva**: Textos curtos, limites de largura para evitar transbordos, e clareza imediata.
* **Uso com Uma Mão**: Elementos cruciais de navegação posicionados ao alcance do polegar (como o Dock flutuante inferior).

Toda tela deve permitir ao usuário responder instantaneamente:
1. O que precisa de atenção?
2. O que precisa ser executado agora?
3. O que gera receita imediata?
4. Qual é o próximo passo óbvio?

---

## 6. Regra de Ouro da Consistência
Ao construir ou atualizar qualquer tela:
1. **Reutilize** o Header Universal.
2. **Reutilize** os componentes nativos criados para a Home.
3. **Reutilize** os tokens de cores do tema Dark Premium.
4. **Reutilize** a tipografia e as classes utilitárias de texto.
5. **Reutilize** o comportamento tátil (`active:scale-[0.975]`).
6. **Não crie novos padrões** de design quando as soluções da Home forem suficientes.
