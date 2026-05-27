# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mvpFunctionalTruth.spec.ts >> MVP Functional Truth Check >> Full User Journey: Client -> Budget -> Workflow -> Finance -> History
- Location: tests/e2e/mvpFunctionalTruth.spec.ts:14:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Operação")')
    - locator resolved to <button type="button" class="bottom-nav-item active">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="sticky-save">Salvar Orçamento</button> from <section class="app-content-area">…</section> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="sticky-save">Salvar Orçamento</button> from <section class="app-content-area">…</section> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    42 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button class="sticky-save">Salvar Orçamento</button> from <section class="app-content-area">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e3]:
  - banner [ref=e4]:
    - button "Abrir menu" [ref=e5] [cursor=pointer]: ☰
    - img "Aferix" [ref=e7]
    - button "Notificações" [ref=e10] [cursor=pointer]:
      - img [ref=e11]
  - main [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - heading "Projeto Hidráulico 1779892782625" [level=1] [ref=e18]
        - generic [ref=e19]: FINALIZADO
      - button "Voltar" [ref=e21] [cursor=pointer]
    - complementary [ref=e23]:
      - generic [ref=e25]: 🔒
      - generic [ref=e26]:
        - strong [ref=e27]: "Orçamento bloqueado para edição (Status: FINALIZADO)"
        - generic [ref=e28]: Os dados principais, itens e custos não podem mais ser alterados.
    - generic [ref=e29]:
      - generic [ref=e31]:
        - text: Preço do Serviço
        - generic [ref=e32]:
          - generic [ref=e33]: R$
          - textbox "Preço do Serviço R$" [disabled] [ref=e34]:
            - /placeholder: 0,00
            - text: 5.000,00
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]: Título do Projeto
          - textbox "Título do Projeto" [disabled] [ref=e38]:
            - /placeholder: "Ex: Instalação Residencial"
            - text: Projeto Hidráulico 1779892782625
        - generic [ref=e39]:
          - generic [ref=e40]: Cliente
          - combobox "Cliente" [disabled] [ref=e42]:
            - option "Cliente Avulso (Nome Livre)"
            - option "Cliente Teste 1779892782625" [selected]
      - generic [ref=e43]:
        - heading "Custos e Deduções" [level=3] [ref=e46]
        - generic [ref=e48]:
          - generic [ref=e49]:
            - text: Materiais
            - generic [ref=e50]:
              - generic [ref=e51]: R$
              - textbox "Materiais R$" [disabled] [ref=e52]:
                - /placeholder: 0,00
                - text: 1.500,00
          - generic [ref=e53]:
            - text: Ajudante
            - generic [ref=e54]:
              - generic [ref=e55]: R$
              - textbox "Ajudante R$" [disabled] [ref=e56]:
                - /placeholder: 0,00
                - text: 500,00
          - generic [ref=e57]:
            - text: Transporte
            - generic [ref=e58]:
              - generic [ref=e59]: R$
              - textbox "Transporte R$" [disabled] [ref=e60]:
                - /placeholder: 0,00
          - generic [ref=e61]:
            - text: Taxas
            - generic [ref=e62]:
              - generic [ref=e63]: R$
              - textbox "Taxas R$" [disabled] [ref=e64]:
                - /placeholder: 0,00
          - generic [ref=e65]:
            - text: Descontos
            - generic [ref=e66]:
              - generic [ref=e67]: R$
              - textbox "Descontos R$" [disabled] [ref=e68]:
                - /placeholder: 0,00
          - generic [ref=e69]:
            - text: Outros
            - generic [ref=e70]:
              - generic [ref=e71]: R$
              - textbox "Outros R$" [disabled] [ref=e72]:
                - /placeholder: 0,00
      - generic [ref=e73]:
        - heading "Notas e Observações" [level=3] [ref=e76]
        - generic [ref=e77]:
          - generic [ref=e78]:
            - generic [ref=e79]: Observações do Cliente
            - textbox "Observações do Cliente" [disabled] [ref=e80]:
              - /placeholder: Termos de pagamento, garantias...
          - generic [ref=e81]:
            - generic [ref=e82]: Notas Internas
            - textbox "Notas Internas" [disabled] [ref=e83]:
              - /placeholder: Detalhes técnicos, dificuldades encontradas...
      - button "Arquivar Orçamento" [ref=e85] [cursor=pointer]
      - toolbar [ref=e86]:
        - button "Salvar Orçamento" [ref=e87] [cursor=pointer]
        - button "Cancelar" [ref=e88] [cursor=pointer]
    - complementary [ref=e90]:
      - generic [ref=e92]: 💰
      - generic [ref=e93]:
        - strong [ref=e94]: "Lucro: R$ 3.000,00"
        - generic [ref=e95]: "Margem: 60,0% • Custo: R$ 2.000,00"
  - navigation [ref=e96]:
    - button "Resumo" [ref=e97] [cursor=pointer]:
      - img [ref=e99]
      - generic [ref=e101]: Resumo
    - button "Operação" [ref=e102] [cursor=pointer]:
      - img [ref=e104]
      - generic [ref=e106]: Operação
    - button "Financeiro" [ref=e107] [cursor=pointer]:
      - img [ref=e109]
      - generic [ref=e111]: Financeiro
    - button "Mais" [ref=e112] [cursor=pointer]:
      - img [ref=e114]
      - generic [ref=e116]: Mais
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('MVP Functional Truth Check', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // iPhone X viewport for mobile-first validation
  6  |     await page.setViewportSize({ width: 375, height: 812 });
  7  |     await page.goto('http://localhost:5175/');
  8  |     await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });
  9  |     
  10 |     // Auto-accept all confirmation dialogs
  11 |     page.on('dialog', dialog => dialog.accept());
  12 |   });
  13 | 
  14 |   test('Full User Journey: Client -> Budget -> Workflow -> Finance -> History', async ({ page }) => {
  15 |     const timestamp = Date.now();
  16 |     const clientName = `Cliente Teste ${timestamp}`;
  17 |     const budgetTitle = `Projeto Hidráulico ${timestamp}`;
  18 | 
  19 |     // 1. Criar Cliente
  20 |     await page.click('button:has-text("Mais")');
  21 |     await page.click('button:has-text("Clientes")');
  22 |     await page.click('button:has-text("Novo Cliente")');
  23 |     await page.fill('input[placeholder="Ex: João da Silva"]', clientName);
  24 |     await page.click('button:has-text("Cadastrar Cliente")');
  25 |     await expect(page.locator(`text=${clientName}`)).toBeVisible();
  26 | 
  27 |     // 2. Criar Orçamento vinculado ao cliente
  28 |     await page.click('button:has-text("Resumo")');
  29 |     await page.click('button:has-text("Novo Orçamento")');
  30 |     
  31 |     // Selecionar cliente
  32 |     await page.locator('label:has-text("Cliente")').locator('select').selectOption({ label: clientName });
  33 |     
  34 |     await page.waitForSelector('input[placeholder="Ex: Instalação Residencial"]');
  35 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', budgetTitle);
  36 |     
  37 |     // Preencher valores
  38 |     const chargedInput = page.locator('label:has-text("Preço do Serviço")').locator('input');
  39 |     await chargedInput.fill('500000'); // R$ 5.000,00
  40 |     
  41 |     // Custos
  42 |     await page.locator('label:has-text("Materiais")').locator('input').fill('150000'); // R$ 1.500,00
  43 |     await page.locator('label:has-text("Ajudante")').locator('input').fill('50000'); // R$ 500,00
  44 | 
  45 |     // 3. Salvar Rascunho e Verificar Persistência
  46 |     await page.click('button:has-text("Salvar Rascunho")');
  47 |     await page.waitForTimeout(1000);
  48 |     await page.reload();
  49 |     await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });
  50 |     
  51 |     // Reabrir do Histórico para garantir que salvou
  52 |     await page.click('button:has-text("Operação")');
  53 |     await page.click(`text=${budgetTitle}`);
  54 |     
  55 |     await expect(page.locator('input[value="' + budgetTitle + '"]')).toBeVisible();
  56 | 
  57 |     // 4. Workflow Completo
  58 |     await page.click('button:has-text("Enviar para Cliente")');
  59 |     await page.click('button:has-text("Autorizar Execução")');
  60 |     await page.click('button:has-text("Iniciar Execução")');
  61 |     await page.click('button:has-text("Finalizar Orçamento")');
  62 |     await page.click('button:has-text("Confirmar")');
  63 | 
  64 |     // Verificar se está em modo leitura
  65 |     await expect(page.locator('input[value="' + budgetTitle + '"]')).toBeDisabled();
  66 |     await expect(page.locator('span:has-text("Finalizado")')).toBeVisible();
  67 | 
  68 |     // 5. Conferir Histórico
> 69 |     await page.click('button:has-text("Operação")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  70 |     await expect(page.locator('.operational-card').filter({ hasText: budgetTitle })).toBeVisible();
  71 |     await expect(page.locator('.operational-card').filter({ hasText: budgetTitle })).toContainText('5.000');
  72 | 
  73 |     // 6. Conferir Financeiro
  74 |     await page.click('button:has-text("Financeiro")');
  75 |     await expect(page.locator('.metric-card').filter({ hasText: 'Faturamento Real' }).locator('strong')).not.toHaveText('R$ 0,00');
  76 |     await expect(page.locator('.metric-card').filter({ hasText: 'Lucro líquido' }).locator('strong')).toContainText('3.000'); // 5000 - 1500 - 500 = 3000 (app currently doesn't auto-deduct tax in overview)
  77 | 
  78 |     // 7. Backup Local (apenas disparar o clique para ver se não quebra)
  79 |     await page.click('button:has-text("Mais")');
  80 |     await page.click('button:has-text("Backup e Sincronização")');
  81 |     const downloadPromise = page.waitForEvent('download');
  82 |     await page.click('button:has-text("Download JSON")');
  83 |     const download = await downloadPromise;
  84 |     expect(download.suggestedFilename()).toContain('aferix-backup');
  85 |   });
  86 | });
  87 | 
```