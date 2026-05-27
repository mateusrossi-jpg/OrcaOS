import { test, expect } from '@playwright/test';

test('runtime budget flow verification', async ({ page }) => {
  // Simulate mobile-first viewport
  await page.setViewportSize({ width: 375, height: 812 });
  // Surface browser logs in Playwright runner
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  // Handle any confirmation dialogs automatically
  page.on('dialog', async dialog => {
    console.log('PLAYWRIGHT DIALOG DETECTED:', dialog.type(), dialog.message());
    await dialog.accept();
  });
  // 1. Navigate to app
  await page.goto('http://localhost:5173/');
  
  // Wait for app to be ready
  await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });

  // Helper to open budgets screen via navigation
  const goToBudgets = async () => {
    await page.waitForTimeout(500);
    // Use bottom nav on mobile to go to Home/Pulse
    const bottomNavPulse = page.locator('.bottom-nav-item', { hasText: /Resumo/i });
    if (await bottomNavPulse.isVisible()) {
      await bottomNavPulse.click();
      await page.waitForTimeout(500);
    }

    // If we are already on the budget form screen, return early.
    const isAlreadyOnForm = await page.locator('input[placeholder="Ex: Instalação Residencial"]').isVisible();
    if (isAlreadyOnForm) {
      return;
    }
    // If HomeScreen primary button is visible, click it directly
    const homeBtn = page.locator('button:has-text("Novo Orçamento"), button:has-text("Novo Orçamento", button:has-text("Novo orçamento"))').first();
    if (await homeBtn.count() && await homeBtn.isVisible()) {
      await homeBtn.click({ force: true });
      await page.waitForTimeout(500);
      return;
    }
  };

  // Helper to open history screen via navigation
  const goToHistory = async () => {
    await page.waitForTimeout(500);
    // Use bottom nav on mobile
    const bottomNavOp = page.locator('.bottom-nav-item', { hasText: /Operação/i });
    if (await bottomNavOp.isVisible()) {
      await bottomNavOp.click();
      await page.waitForTimeout(500);
    }
  };

  // Helper to create a budget with given title and values
  const createBudget = async (title: string, charged: string) => {
    // Fill title
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', title);
    // Fill charged value
    const chargedInput = page.locator('input[inputmode="numeric"]').first();
    await chargedInput.fill(charged);
    // Save draft
    await page.click('button:has-text("Salvar Rascunho")', { force: true });
    // Wait for async IndexDB saving process
    await page.waitForTimeout(500);
    
    // Go back to the history
    const backBtn = page.locator('button:has-text("Voltar")').first();
    if (await backBtn.count() && await backBtn.isVisible()) {
      await backBtn.click({ force: true });
    }
  };

  // Ensure we are on Budgets screen
  await goToBudgets();

  // 2. Create three budgets
  // Budget 1
  await createBudget('Orçamento 1', '1000');
  await page.waitForTimeout(500);
  await goToBudgets();
  
  // Budget 2
  await createBudget('Orçamento 2', '2000');
  await page.waitForTimeout(500);
  await goToBudgets();
  
  // Budget 3
  await createBudget('Orçamento 3', '3000');
  await page.waitForTimeout(500);

  // 3. Go to histórico page
  await goToHistory();
  await page.waitForSelector('h1:has-text("Histórico")', { timeout: 10000 });

  // Verify that three budgets appear
  const cards = page.locator('article.operational-card').filter({ hasText: /Orçamento/ });
  await expect(cards).toHaveCount(3);

  // 4. Edit the second budget (change title)
  const secondCard = cards.nth(1);
  await secondCard.click({ force: true }); // opens detail (BudgetDetailScreen) - not needed for edit, using form directly
  // In detail view, click edit button if exists, else back to form via edit flow
  // Assuming the edit button is present with text "Editar" or similar
  const editBtn = page.locator('button', { hasText: /Editar/i }).first();
  await editBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  if (await editBtn.count()) {
    await editBtn.click({ force: true });
    await page.waitForTimeout(500); // Wait for transition to form
  }
  // Change title
  await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Orçamento 2 EDITADO');
  // Save draft
  await page.click('button:has-text("Salvar Rascunho")', { force: true });
  await page.waitForSelector('button:has-text("Salvar Rascunho")', { timeout: 10000 });

  // Return to histórico and verify changed title appears
  await goToHistory();
  await expect(page.locator('text=Orçamento 2 EDITADO')).toBeVisible();

  // 5. Delete the first budget
  const firstCard = page.locator('article.operational-card').filter({ hasText: /Orçamento 1/ }).first();
  await firstCard.locator('button').last().click({ force: true });
  
  const deleteBtn = page.locator('button', { hasText: /^Excluir$/ }).last();
  await expect(deleteBtn).toBeVisible({ timeout: 10000 });
  await deleteBtn.click({ force: true });
  await page.waitForTimeout(500);

  // Verify only two budgets remain
  const remaining = page.locator('article.operational-card').filter({ hasText: /Orçamento/ });
  await expect(remaining).toHaveCount(2);

  // 6. Reload page and verify persistence
  await page.reload();
  await goToHistory();
  const afterReload = page.locator('article.operational-card').filter({ hasText: /Orçamento/ });
  await expect(afterReload).toHaveCount(2);
  await expect(page.locator('text=Orçamento 1')).toBeHidden();
});
