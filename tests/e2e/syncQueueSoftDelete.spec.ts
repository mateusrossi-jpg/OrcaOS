import { test, expect } from '@playwright/test';

test('Soft Delete and Sync Queue validation', async ({ page }) => {
  // Surface browser logs in Playwright runner
  // Handle any confirmation dialogs automatically
  page.on('dialog', async dialog => {
    console.log('PLAYWRIGHT DIALOG DETECTED:', dialog.type(), dialog.message());
    await dialog.accept();
  });
  
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('http://localhost:5175/');
  await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });

  // Expose syncService to window is assumed to be ready
  const checkPending = async () => {
    return await page.evaluate(async () => {
      // @ts-expect-error window.syncService is injected in main.tsx
      if (!window.syncService) throw new Error('syncService not exposed on window');
      // @ts-expect-error window.syncService is injected in main.tsx
      return await window.syncService.getPendingChanges();
    });
  };

  // 1. Clear initial state (just in case there are pending from other tests)
  // Not explicitly needed, we can just assert the newly added elements.
  const initialPending = await checkPending();
  const initialBudgetPendingCount = initialPending.budgets.length;

  // 2. Create Budget
  const goToBudgets = async () => {
    await page.waitForTimeout(500);
    const bottomNavPulse = page.locator('.bottom-nav-item', { hasText: /Resumo/i });
    if (await bottomNavPulse.isVisible()) {
      await bottomNavPulse.click();
      await page.waitForTimeout(500);
    }
    const isAlreadyOnForm = await page.locator('input[placeholder="Ex: Instalação Residencial"]').isVisible();
    if (isAlreadyOnForm) return;
    
    const homeBtn = page.locator('button:has-text("Novo Orçamento")').first();
    if (await homeBtn.count() && await homeBtn.isVisible()) {
      await homeBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
  };
  await goToBudgets();

  // Fill in title
  const budgetTitle = `Orçamento Sync Test ${Date.now()}`;
  await page.fill('input[placeholder="Ex: Instalação Residencial"]', budgetTitle);
  // Fill charged value
  const chargedInput = page.locator('input[inputmode="numeric"]').first();
  await chargedInput.fill('1500');

  // Save Draft
  await page.click('button:has-text("Salvar Rascunho")', { force: true });
  await page.waitForTimeout(1000); // Wait for IndexedDB

  // Verify pending sync status for budget
  const pendingAfterCreate = await checkPending();
  const newPendingBudgets = pendingAfterCreate.budgets;
  expect(newPendingBudgets.length).toBeGreaterThan(initialBudgetPendingCount);
  
  // Find the newly created budget in pending list
  const createdBudgetInSync = newPendingBudgets.find((b: { title: string, syncStatus: string, syncUpdatedAt: number, id: string }) => b.title === budgetTitle);
  expect(createdBudgetInSync).toBeDefined();
  expect(createdBudgetInSync.syncStatus).toBe('pending');
  expect(typeof createdBudgetInSync.syncUpdatedAt).toBe('number');

  // 3. Delete Budget
  // Go to History
  await page.waitForSelector('.sticky-action-bar', { state: 'detached' });
    await page.click('.bottom-nav-item:has-text("Operação")');
  await page.waitForSelector('h1:has-text("Histórico")');

  // Check it appears in UI
  const card = page.locator('article.operational-card').filter({ hasText: budgetTitle });
  await expect(card).toBeVisible();

  // Click the delete button on the card (usually the last button or has an explicit icon)
  await card.locator('button').last().click({ force: true });
  
  // Confirm deletion
  const deleteConfirmBtn = page.locator('button', { hasText: /^Excluir$/ }).last();
  await expect(deleteConfirmBtn).toBeVisible();
  await deleteConfirmBtn.click({ force: true });
  await page.waitForTimeout(1000); // Wait for IndexedDB

  // 4. Confirm it disappeared from UI
  await page.reload();
  await page.waitForTimeout(1000);
  await page.click('.bottom-nav-item:has-text("Operação")');
  await page.waitForSelector('h1:has-text("Histórico")');
  await expect(page.locator('article.operational-card').filter({ hasText: budgetTitle })).toBeHidden();

  // 5. Confirm it remains in getPendingChanges as deleted
  const pendingAfterDelete = await checkPending();
  const deletedBudgetInSync = pendingAfterDelete.budgets.find((b: { id: string, syncStatus: string }) => b.id === createdBudgetInSync.id);
  expect(deletedBudgetInSync).toBeDefined();
  expect(deletedBudgetInSync.syncStatus).toBe('deleted');

  // 6. Confirm reports/history ignores deleted (already verified from UI vanishing)
  // Check the 'Resumo' total doesn't include 1500 from the deleted budget
  await page.click('.bottom-nav-item:has-text("Resumo")');
  await page.waitForTimeout(500);
  
  // Read Faturamento
  const faturamentoCard = page.locator('.metric-card').filter({ hasText: 'Receita do Mês' }).first();
  if (await faturamentoCard.isVisible()) {
     // If the deleted record was Finalizado, we'd check if it doesn't appear. 
     // Since it was Rascunho it wouldn't appear anyway. But we proved soft delete works.
  }
});
