# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: syncQueueSoftDelete.spec.ts >> Soft Delete and Sync Queue validation
- Location: tests/e2e/syncQueueSoftDelete.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.sticky-action-bar') to be detached
    50 × locator resolved to visible <div role="toolbar" class="sticky-action-bar">…</div>

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
        - heading "Orçamento Sync Test 1779898919643" [level=1] [ref=e18]
        - generic [ref=e19]: INICIADO
      - button "Voltar" [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - generic [ref=e24]:
        - text: Preço do Serviço
        - generic [ref=e25]:
          - generic [ref=e26]: R$
          - textbox "Preço do Serviço R$" [ref=e27]:
            - /placeholder: 0,00
            - text: 15,00
      - generic [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e30]: Título do Projeto
          - textbox "Título do Projeto" [ref=e31]:
            - /placeholder: "Ex: Instalação Residencial"
            - text: Orçamento Sync Test 1779898919643
        - generic [ref=e32]:
          - generic [ref=e33]: Cliente
          - combobox "Cliente" [ref=e35]:
            - option "Cliente Avulso (Nome Livre)" [selected]
        - generic [ref=e36]:
          - generic [ref=e37]: Nome do Cliente Avulso
          - textbox "Nome do Cliente Avulso" [ref=e38]:
            - /placeholder: Digite o nome...
      - generic [ref=e39]:
        - heading "Custos e Deduções" [level=3] [ref=e42]
        - generic [ref=e44]:
          - generic [ref=e45]:
            - text: Materiais
            - generic [ref=e46]:
              - generic [ref=e47]: R$
              - textbox "Materiais R$" [ref=e48]:
                - /placeholder: 0,00
          - generic [ref=e49]:
            - text: Ajudante
            - generic [ref=e50]:
              - generic [ref=e51]: R$
              - textbox "Ajudante R$" [ref=e52]:
                - /placeholder: 0,00
          - generic [ref=e53]:
            - text: Transporte
            - generic [ref=e54]:
              - generic [ref=e55]: R$
              - textbox "Transporte R$" [ref=e56]:
                - /placeholder: 0,00
          - generic [ref=e57]:
            - text: Taxas
            - generic [ref=e58]:
              - generic [ref=e59]: R$
              - textbox "Taxas R$" [ref=e60]:
                - /placeholder: 0,00
          - generic [ref=e61]:
            - text: Descontos
            - generic [ref=e62]:
              - generic [ref=e63]: R$
              - textbox "Descontos R$" [ref=e64]:
                - /placeholder: 0,00
          - generic [ref=e65]:
            - text: Outros
            - generic [ref=e66]:
              - generic [ref=e67]: R$
              - textbox "Outros R$" [ref=e68]:
                - /placeholder: 0,00
      - generic [ref=e69]:
        - heading "Notas e Observações" [level=3] [ref=e72]
        - generic [ref=e73]:
          - generic [ref=e74]:
            - generic [ref=e75]: Observações do Cliente
            - textbox "Observações do Cliente" [ref=e76]:
              - /placeholder: Termos de pagamento, garantias...
          - generic [ref=e77]:
            - generic [ref=e78]: Notas Internas
            - textbox "Notas Internas" [ref=e79]:
              - /placeholder: Detalhes técnicos, dificuldades encontradas...
      - generic [ref=e80]:
        - button "Enviar para Cliente" [ref=e81] [cursor=pointer]
        - button "Salvar Rascunho" [ref=e82] [cursor=pointer]
      - toolbar [ref=e83]:
        - button "Salvar Orçamento" [ref=e84] [cursor=pointer]
        - button "Cancelar" [ref=e85] [cursor=pointer]
    - complementary [ref=e87]:
      - generic [ref=e89]: 💰
      - generic [ref=e90]:
        - strong [ref=e91]: "Lucro: R$ 15,00"
        - generic [ref=e92]: "Margem: 100,0% • Custo: R$ 0,00"
  - navigation [ref=e93]:
    - button "Resumo" [ref=e94] [cursor=pointer]:
      - img [ref=e96]
      - generic [ref=e98]: Resumo
    - button "Operação" [ref=e99] [cursor=pointer]:
      - img [ref=e101]
      - generic [ref=e103]: Operação
    - button "Financeiro" [ref=e104] [cursor=pointer]:
      - img [ref=e106]
      - generic [ref=e108]: Financeiro
    - button "Mais" [ref=e109] [cursor=pointer]:
      - img [ref=e111]
      - generic [ref=e113]: Mais
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test('Soft Delete and Sync Queue validation', async ({ page }) => {
  4   |   // Surface browser logs in Playwright runner
  5   |   // Handle any confirmation dialogs automatically
  6   |   page.on('dialog', async dialog => {
  7   |     console.log('PLAYWRIGHT DIALOG DETECTED:', dialog.type(), dialog.message());
  8   |     await dialog.accept();
  9   |   });
  10  |   
  11  |   await page.setViewportSize({ width: 375, height: 812 });
  12  | 
  13  |   await page.goto('http://localhost:5175/');
  14  |   await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });
  15  | 
  16  |   // Expose syncService to window is assumed to be ready
  17  |   const checkPending = async () => {
  18  |     return await page.evaluate(async () => {
  19  |       // @ts-expect-error window.syncService is injected in main.tsx
  20  |       if (!window.syncService) throw new Error('syncService not exposed on window');
  21  |       // @ts-expect-error window.syncService is injected in main.tsx
  22  |       return await window.syncService.getPendingChanges();
  23  |     });
  24  |   };
  25  | 
  26  |   // 1. Clear initial state (just in case there are pending from other tests)
  27  |   // Not explicitly needed, we can just assert the newly added elements.
  28  |   const initialPending = await checkPending();
  29  |   const initialBudgetPendingCount = initialPending.budgets.length;
  30  | 
  31  |   // 2. Create Budget
  32  |   const goToBudgets = async () => {
  33  |     await page.waitForTimeout(500);
  34  |     const bottomNavPulse = page.locator('.bottom-nav-item', { hasText: /Resumo/i });
  35  |     if (await bottomNavPulse.isVisible()) {
  36  |       await bottomNavPulse.click();
  37  |       await page.waitForTimeout(500);
  38  |     }
  39  |     const isAlreadyOnForm = await page.locator('input[placeholder="Ex: Instalação Residencial"]').isVisible();
  40  |     if (isAlreadyOnForm) return;
  41  |     
  42  |     const homeBtn = page.locator('button:has-text("Novo Orçamento")').first();
  43  |     if (await homeBtn.count() && await homeBtn.isVisible()) {
  44  |       await homeBtn.click({ force: true });
  45  |       await page.waitForTimeout(500);
  46  |     }
  47  |   };
  48  |   await goToBudgets();
  49  | 
  50  |   // Fill in title
  51  |   const budgetTitle = `Orçamento Sync Test ${Date.now()}`;
  52  |   await page.fill('input[placeholder="Ex: Instalação Residencial"]', budgetTitle);
  53  |   // Fill charged value
  54  |   const chargedInput = page.locator('input[inputmode="numeric"]').first();
  55  |   await chargedInput.fill('1500');
  56  | 
  57  |   // Save Draft
  58  |   await page.click('button:has-text("Salvar Rascunho")', { force: true });
  59  |   await page.waitForTimeout(1000); // Wait for IndexedDB
  60  | 
  61  |   // Verify pending sync status for budget
  62  |   const pendingAfterCreate = await checkPending();
  63  |   const newPendingBudgets = pendingAfterCreate.budgets;
  64  |   expect(newPendingBudgets.length).toBeGreaterThan(initialBudgetPendingCount);
  65  |   
  66  |   // Find the newly created budget in pending list
  67  |   const createdBudgetInSync = newPendingBudgets.find((b: { title: string, syncStatus: string, syncUpdatedAt: number, id: string }) => b.title === budgetTitle);
  68  |   expect(createdBudgetInSync).toBeDefined();
  69  |   expect(createdBudgetInSync.syncStatus).toBe('pending');
  70  |   expect(typeof createdBudgetInSync.syncUpdatedAt).toBe('number');
  71  | 
  72  |   // 3. Delete Budget
  73  |   // Go to History
> 74  |   await page.waitForSelector('.sticky-action-bar', { state: 'detached' });
      |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  75  |     await page.click('.bottom-nav-item:has-text("Operação")');
  76  |   await page.waitForSelector('h1:has-text("Histórico")');
  77  | 
  78  |   // Check it appears in UI
  79  |   const card = page.locator('article.operational-card').filter({ hasText: budgetTitle });
  80  |   await expect(card).toBeVisible();
  81  | 
  82  |   // Click the delete button on the card (usually the last button or has an explicit icon)
  83  |   await card.locator('button').last().click({ force: true });
  84  |   
  85  |   // Confirm deletion
  86  |   const deleteConfirmBtn = page.locator('button', { hasText: /^Excluir$/ }).last();
  87  |   await expect(deleteConfirmBtn).toBeVisible();
  88  |   await deleteConfirmBtn.click({ force: true });
  89  |   await page.waitForTimeout(1000); // Wait for IndexedDB
  90  | 
  91  |   // 4. Confirm it disappeared from UI
  92  |   await page.reload();
  93  |   await page.waitForTimeout(1000);
  94  |   await page.click('.bottom-nav-item:has-text("Operação")');
  95  |   await page.waitForSelector('h1:has-text("Histórico")');
  96  |   await expect(page.locator('article.operational-card').filter({ hasText: budgetTitle })).toBeHidden();
  97  | 
  98  |   // 5. Confirm it remains in getPendingChanges as deleted
  99  |   const pendingAfterDelete = await checkPending();
  100 |   const deletedBudgetInSync = pendingAfterDelete.budgets.find((b: { id: string, syncStatus: string }) => b.id === createdBudgetInSync.id);
  101 |   expect(deletedBudgetInSync).toBeDefined();
  102 |   expect(deletedBudgetInSync.syncStatus).toBe('deleted');
  103 | 
  104 |   // 6. Confirm reports/history ignores deleted (already verified from UI vanishing)
  105 |   // Check the 'Resumo' total doesn't include 1500 from the deleted budget
  106 |   await page.click('.bottom-nav-item:has-text("Resumo")');
  107 |   await page.waitForTimeout(500);
  108 |   
  109 |   // Read Faturamento
  110 |   const faturamentoCard = page.locator('.metric-card').filter({ hasText: 'Receita do Mês' }).first();
  111 |   if (await faturamentoCard.isVisible()) {
  112 |      // If the deleted record was Finalizado, we'd check if it doesn't appear. 
  113 |      // Since it was Rascunho it wouldn't appear anyway. But we proved soft delete works.
  114 |   }
  115 | });
  116 | 
```