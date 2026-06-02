# AFERIX MOBILE AUDIT

## AUDITORIA DE RESPONSIVIDADE E INTERAÇÃO

O Aferix segue uma filosofia Mobile-First profunda (Operational Dock, Bottom Sheets).

### Validação de Estrutura

1. **iPhone / Android (Telas Pequenas e Médias):**
   * O `AppShell` com `aferix-mobile-container` garante que o app se comporte como um PWA de tela cheia.
   * A "Operational Dock" no rodapé absorve a área do polegar, facilitando o uso com uma mão em campo.

2. **Safe Areas e Keyboard:**
   * A aplicação faz uso de `pb-32` e `pb-[124px]` no `OperationsHubWorkspace` para evitar sobreposição do conteúdo com a Dock. Contudo, em modais que demandam digitação (como o *Checkout de Execução*), inputs próximos à parte inferior podem ser cobertos pelo teclado nativo do dispositivo. **(Risco de usabilidade).**

3. **Scroll e Bottom Sheet / Sticky Footer:**
   * O `ProposalGeneratorPage` tem um Sticky Footer ("GERAR PROPOSTA") muito bem implementado com `fixed bottom-0` e `z-40`, o que funciona perfeitamente para prender a ação final.
   * **Erro Identificado:** Telas longas sem "padding bottom" dinâmico podem cortar o último item da lista dependendo do `safe-area-inset-bottom` do iPhone.

4. **Landscape (Modo Paisagem):**
   * Em landscape, o "Operational Dock" pode ocupar muito espaço vertical da tela (que já é curto). Uma visualização em Tablets deve, preferencialmente, migrar a Dock para uma Sidebar (Rail). Atualmente é travado no estilo Mobile.

### Veredito
Mobile UI é sólida e fluida, obedecendo ao padrão de Dark Premium. É preciso atenção extra ao comportamento do teclado (Keyboard Avoiding View) no PWA, especialmente nas telas de proposta comercial com muitos inputs (preço, quantidade, desconto).
