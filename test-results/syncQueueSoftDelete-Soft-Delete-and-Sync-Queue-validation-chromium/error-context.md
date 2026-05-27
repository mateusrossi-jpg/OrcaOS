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
Error: expect(locator).toBeVisible() failed

Locator: locator('h1:has-text("Histórico")')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for locator('h1:has-text("Histórico")')

```

```yaml
- main:
  - banner:
    - button "Abrir menu": ☰
    - img "Aferix"
    - button "Notificações":
      - img
  - main:
    - heading "Orçamento Sync Test 1779901733131" [level=1]
    - text: INICIADO
    - button "Voltar"
    - text: Preço do Serviço R$
    - textbox "Preço do Serviço R$":
      - /placeholder: 0,00
      - text: 15,00
    - text: Título do Projeto
    - textbox "Título do Projeto":
      - /placeholder: "Ex: Instalação Residencial"
      - text: Orçamento Sync Test 1779901733131
    - text: Cliente
    - combobox "Cliente":
      - option "Cliente Avulso (Nome Livre)" [selected]
    - text: Nome do Cliente Avulso
    - textbox "Nome do Cliente Avulso":
      - /placeholder: Digite o nome...
    - heading "Custos e Deduções" [level=3]
    - text: Materiais R$
    - textbox "Materiais R$":
      - /placeholder: 0,00
    - text: Ajudante R$
    - textbox "Ajudante R$":
      - /placeholder: 0,00
    - text: Transporte R$
    - textbox "Transporte R$":
      - /placeholder: 0,00
    - text: Taxas R$
    - textbox "Taxas R$":
      - /placeholder: 0,00
    - text: Descontos R$
    - textbox "Descontos R$":
      - /placeholder: 0,00
    - text: Outros R$
    - textbox "Outros R$":
      - /placeholder: 0,00
    - heading "Notas e Observações" [level=3]
    - text: Observações do Cliente
    - textbox "Observações do Cliente":
      - /placeholder: Termos de pagamento, garantias...
    - text: Notas Internas
    - textbox "Notas Internas":
      - /placeholder: Detalhes técnicos, dificuldades encontradas...
    - button "Enviar para Cliente"
    - button "Salvar Rascunho"
    - toolbar:
      - button "Salvar Orçamento"
      - button "Cancelar"
    - complementary:
      - text: 💰
      - strong: "Lucro: R$ 15,00"
      - text: "Margem: 100,0% • Custo: R$ 0,00"
  - navigation:
    - button "Resumo"
    - button "Operação"
    - button "Financeiro"
    - button "Mais"
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
  74  |   // Skipping wait for sticky-action-bar as it no longer exists
  75  |   await page.click('.bottom-nav-item:has-text("Operação")', { force: true });
  76  |   await page.waitForTimeout(500);
  77  |   await page.waitForTimeout(1000);
> 78  | await expect(page.locator('h1:has-text("Histórico")')).toBeVisible({ timeout: 30000 });
      |                                                        ^ Error: expect(locator).toBeVisible() failed
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
  89  | await page.waitForTimeout(1000); // allow delete processing
  90  |   await page.waitForTimeout(1000); // Wait for IndexedDB
  91  | 
  92  |   // 4. Confirm it disappeared from UI
  93  |   await page.reload();
  94  |   await page.waitForTimeout(1000);
  95  |   await page.click('.bottom-nav-item:has-text("Operação")');
  96  |   await page.waitForSelector('h1:has-text("Histórico")');
  97  |   await expect(page.locator('article.operational-card').filter({ hasText: budgetTitle })).toBeHidden();
  98  | 
  99  |   // 5. Confirm it remains in getPendingChanges as deleted
  100 |   const pendingAfterDelete = await checkPending();
  101 |   const deletedBudgetInSync = pendingAfterDelete.budgets.find((b: { id: string, syncStatus: string }) => b.id === createdBudgetInSync.id);
  102 |   expect(deletedBudgetInSync).toBeDefined();
  103 |   expect(deletedBudgetInSync.syncStatus).toBe('deleted');
  104 | 
  105 |   // 6. Confirm reports/history ignores deleted (already verified from UI vanishing)
  106 |   // Check the 'Resumo' total doesn't include 1500 from the deleted budget
  107 |   await page.click('.bottom-nav-item:has-text("Resumo")');
  108 |   await page.waitForTimeout(500);
  109 |   
  110 |   // Read Faturamento
  111 |   const faturamentoCard = page.locator('.metric-card').filter({ hasText: 'Receita do Mês' }).first();
  112 |   if (await faturamentoCard.isVisible()) {
  113 |      // If the deleted record was Finalizado, we'd check if it doesn't appear. 
  114 |      // Since it was Rascunho it wouldn't appear anyway. But we proved soft delete works.
  115 |   }
  116 | });
  117 | 
```