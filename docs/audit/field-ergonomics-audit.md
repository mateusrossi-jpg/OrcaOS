# Auditoria de Ergonomia de Campo (Field-Ready Audit)
**Data:** 31/05/2026
**Foco:** Uso do Aferix em caminhonete, em obra, sob luz solar, com atenção parcial e uso com uma mão.

---

## 1. O que exige dois toques mas poderia exigir um?
**Fricção Alta**
- **Avanço Rápido de Status de OS:** Na listagem do `OperationsHubWorkspace`, para marcar uma OS como "Concluída", é necessário tocar no card para abrir o draft de checkout financeiro. Em trabalhos rápidos onde não há pendência financeira, deveria haver um "swipe-to-complete" ou um checkbox de um toque.
- **Seleção de Item no Orçamento:** Ao adicionar um item ao orçamento, é preciso tocar em "Adicionar Item", aguardar abrir o modal do catálogo, selecionar o item e confirmar. Poderia haver um input híbrido estilo "autocomplete/quick-add" diretamente na tela do `BudgetForm`.

## 2. O que exige abrir um modal mas poderia ser inline?
**Fricção Alta**
- **Catálogo no Orçamento (`showCatalog`):** O `BudgetForm` (uma tela já complexa) abre um modal gigantesco que renderiza internamente todo o `PremiumCatalogWorkspace`. Modais muito densos em mobile são ruins de fechar e lentos. **Correção:** O catálogo deveria ser um "Step" nativo dentro das 11 etapas do formulário, ou um Drawer/BottomSheet nativo.
- **Histórico do Cliente (`Asset360Modal`):** O histórico completo 360 do cliente abre em um modal denso. **Correção:** Deveria ser uma tela própria na pilha de navegação (ex: `/client/:id/history`), permitindo usar o gesto de "voltar" do próprio celular.
- **Fechamento de Orçamento (`showFinalizeModal`):** Ao invés de um modal de "Auditoria Real", o fechamento poderia ser o último "Step" fluido do `BudgetForm`.

## 3. O que exige leitura mas poderia usar ícones ou contexto visual?
**Aceitável**
- **Status Pills Longos:** Status como `EM_EXECUCAO`, `FINALIZADO` ou `INICIADO` ocupam muito espaço e exigem leitura. **Correção:** Uma codificação visual mais forte no ícone da linha (ex: `⚡` para execução, `✅` para finalizado) e suprimir o texto em listas densas.
- **Alertas de Empty State:** Onde lê-se "NENHUM_ITEM_MAPEADO" ou "ATIVO_NÃO_LOCALIZADO" num texto `text-[10px]`, poderia existir um ícone grande esmaecido como contexto imediato.

## 4. Quais elementos estão pequenos para uso com uma mão?
**Bom (com ressalvas)**
- **Labels Tipográficos:** `SectionLabel` (`text-[9px]` a `text-[10px]`) e `Subtitles` pequenos ficam ilegíveis caso a caminhonete esteja vibrando. 
- **Ícones de Expansão/Chevrons:** Ícones tamanho `13px` usados para indicar que um card é clicável.
- **Botões de Fechar Modal (X):** Tradicionalmente pequenos e no topo da tela, dificultam o fechamento com o polegar.

## 5. Quais CTAs estão longe da região natural do polegar?
**Excelente (com exceções focais)**
- O sistema brilha no uso da `StickyActionBar` (como no `BudgetForm`) e no `TacticalActionBar` global, que mantêm a navegação no alcance do polegar.
- **Exceção (Fricção):** As ações principais do `AppHeader`, como o botão "Novo Orçamento" no topo direito do `BudgetsScreen` e `OperationsHubWorkspace`. Em um iPhone Pro Max ou Galaxy S24 Ultra, o topo direito é a "zona morta" para uso com uma mão. **Correção:** Ações de criação deveriam morar flutuantes embaixo (FAB) ou na própria barra tática.

## 6. O que está bonito mas lento?
**Fricção Alta**
- **Animações e Blur:** Efeitos de `animate-in fade-in slide-in-from-top-1` nos selects e o `backdrop-filter: blur` nos headers/action bars. Ficam muito bem em telas premium, mas em celulares em modo de economia de energia ou sob sol (onde o celular esquenta rápido e faz throttling de GPU), eles causam quedas de frame.
- **Workspace-in-Modal:** Renderizar o `PremiumCatalogWorkspace` dentro de um Modal no `BudgetForm` irá pesar severamente a árvore de DOM do React, gerando latência ao abrir a lista de peças no meio do orçamento.

## 7. O que está correto tecnicamente mas ruim operacionalmente?
**Bom (Visão de Negócio)**
- **Pipeline de Orçamentos de 11 Etapas:** Separar materiais, deslocamento, ajudante, lucro e sumário em 11 etapas garante uma auditoria financeira perfeita e margem protegida. Tecnicamente impecável. **Operacionalmente:** Para um serviço rápido (ex: trocar um disjuntor de R$150), preencher 11 etapas de orçamento é exaustivo. **Correção:** Criar um atalho "Express" ou condensar etapas se o valor/complexidade for pequeno.
- **Separação Rígida entre Venda e Operação:** A arquitetura obriga o orçamento a ser criado, autorizado, para depois gerar uma OS. Correto para o backoffice. Porém, o técnico muitas vezes já fechou o trabalho de boca, já executou, e só precisa registrar tudo em 1 minuto para poder cobrar. A arquitetura exige que ele repita a esteira inteira retroativamente.
