import { test, expect } from '@playwright/test';

test('P36.5 runtime budget flow verification', async ({ page }) => {
  // Simulate mobile-first viewport
  await page.setViewportSize({ width: 375, height: 812 });
  // Surface browser logs in Playwright runner
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  // Handle any confirmation dialogs automatically
  page.on('dialog', async dialog => {
    console.log('PLAYWRIGHT DIALOG DETECTED:', dialog.type(), dialog.message());
    await dialog.accept();
  });
  // 1. Navigate to app and open navigation menu
  await page.goto('http://localhost:5175/');
  
  const menuToggle = page.locator('button.menu-toggle');
  await expect(menuToggle).toBeVisible({ timeout: 10000 }).catch(() => {});
  
  if (await menuToggle.isVisible() && (await menuToggle.innerText() === '☰')) {
    await menuToggle.click();
  }
  
  // Wait for sidebar layout to load
  const parentBtn = page.locator('button.nav-parent').first();
  await parentBtn.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
  
  if (await parentBtn.count() && !(await page.locator('text=Histórico').isVisible())) {
    await parentBtn.click();
  }
  
  await page.waitForSelector('text=Histórico', { timeout: 10000 });

  // Close menu after certifiying history link exists
  const backdrop = page.locator('.drawer-backdrop');
  if (await backdrop.count() && await backdrop.isVisible()) {
    await backdrop.click({ force: true });
    await page.waitForTimeout(500);
  } else {
    const closeBtn = page.locator('button.drawer-close-button');
    if (await closeBtn.isVisible()) {
      await closeBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
  }

  // Helper to open budgets screen via navigation
  const goToBudgets = async () => {
    await page.waitForTimeout(500);
    // If we are already on the budget form screen, return early.
    const isAlreadyOnForm = await page.locator('input[placeholder="Ex: Instalação Residencial"]').isVisible();
    if (isAlreadyOnForm) {
      return;
    }
    // If HomeScreen primary button is visible, click it directly
    const homeBtn = page.locator('button:has-text("Novo orçamento")').filter({ hasText: /^Novo orçamento$/ }).first();
    if (await homeBtn.count() && await homeBtn.isVisible()) {
      await homeBtn.click({ force: true });
      await page.waitForTimeout(500);
      return;
    }
    
    // Open menu if it exists and is closed (via toggle)
    const menuBtn = page.locator('button.menu-toggle');
    const isCollapsed = await page.locator('.app-main-layout.sidebar-collapsed').count() > 0;
    if (isCollapsed && await menuBtn.isVisible()) {
      await menuBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
    
    // Clicar em "Operacional" para abrir o grupo
    const parentBtn = page.locator('button.nav-parent', { hasText: /Operacional/i }).first();
    if (await parentBtn.count()) {
      const isExpanded = await page.locator('text=Novo orçamento').isVisible();
      if (!isExpanded) {
        await parentBtn.click({ force: true });
      }
    }
    
    // Clicar em "Novo orçamento" no submenu
    const subButton = page.locator('button.nav-subitem', { hasText: /Novo orçamento/i }).first();
    if (await subButton.count()) {
      await subButton.click({ force: true });
    } else {
      // Fallback
      const navButton = page.locator('button', { hasText: /Orçamentos|budgets/i }).first();
      if (await navButton.count()) await navButton.click({ force: true });
    }
  };

  // Helper to open history screen via navigation
  const goToHistory = async () => {
    await page.waitForTimeout(500);
    // If we are already on the history screen, return early.
    const isAlreadyOnHistory = await page.locator('h1:has-text("Histórico")').isVisible();
    if (isAlreadyOnHistory) {
      return;
    }
    // Open menu if it exists and is closed (via toggle)
    const menuBtn = page.locator('button.menu-toggle');
    const isCollapsed = await page.locator('.app-main-layout.sidebar-collapsed').count() > 0;
    if (isCollapsed && await menuBtn.isVisible()) {
      await menuBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
    
    // Clicar em "Operacional" para abrir o grupo
    const parentBtn = page.locator('button.nav-parent', { hasText: /Operacional/i }).first();
    if (await parentBtn.count()) {
      const isExpanded = await page.locator('text=Histórico').isVisible();
      if (!isExpanded) {
        await parentBtn.click({ force: true });
      }
    }
    
    // Clicar em "Histórico" no submenu
    const subButton = page.locator('button.nav-subitem', { hasText: /Histórico/i }).first();
    if (await subButton.count()) {
      await subButton.click({ force: true });
    } else {
      // Fallback
      const navButton = page.locator('button', { hasText: /Operacional/i }).first();
      if (await navButton.count()) await navButton.click({ force: true });
    }
  };

  // Helper to create a budget with given title and values
  const createBudget = async (title: string, charged: string) => {
    // Open new budget form if not already opened
    const newBtn = page.locator('button:has-text("+ Novo"), button:has-text("Novo orçamento")').first();
    if (await newBtn.count() && await newBtn.isVisible()) {
      await newBtn.click({ force: true });
      await page.waitForTimeout(500);
    }
    // Fill title
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', title);
    // Fill charged value (R$ input)
    const chargedInput = page.locator('input[type="number"][value=""], input[type="number"][placeholder="0,00"]').first();
    await chargedInput.fill(charged.replace(',', '.'));
    // Save draft
    await page.click('button:has-text("Salvar Rascunho")', { force: true });
    // Wait for async IndexDB saving process to finish completely
    await page.waitForSelector('button:has-text("Salvar Rascunho")', { timeout: 10000 });
    
    // Go back to the history/list screen to allow consecutive creations
    const backBtn = page.locator('header button').first();
    if (await backBtn.count() && await backBtn.isVisible()) {
      await backBtn.click({ force: true });
      await page.waitForSelector('h1:has-text("Histórico"), h1:has-text("Central Operacional")', { timeout: 5000 }).catch(() => {});
    }
  };

  // Ensure we are on Budgets screen
  await goToBudgets();

  // 2. Create three budgets
  await createBudget('Orçamento 1', '1000');
  await createBudget('Orçamento 2', '2000');
  await createBudget('Orçamento 3', '3000');

  // 3. Go to histórico page
  await goToHistory();
  await page.waitForSelector('h1:has-text("Histórico")', { timeout: 5000 });

  // Verify that three budgets appear
  const budgetCards = page.locator('[data-test-id="budget-card"]');
  // Since no data-test-id, fallback to locating by title text
  const cards = page.locator('div[role="button"]').filter({ hasText: /Orçamento [123]/ });
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
  const firstCard = page.locator('div[role="button"]').filter({ hasText: /Orçamento 1/ }).first();
  // Click delete button inside card
  const deleteBtn = firstCard.locator('button', { hasText: /Excluir/i });
  await deleteBtn.click();
  await page.waitForTimeout(500);

  // Verify only two budgets remain
  const remaining = page.locator('div[role="button"]').filter({ hasText: /Orçamento/ });
  await expect(remaining).toHaveCount(2);

  // 6. Reload page and verify persistence
  await page.reload();
  await goToHistory();
  const afterReload = page.locator('div[role="button"]').filter({ hasText: /Orçamento/ });
  await expect(afterReload).toHaveCount(2);
  await expect(page.locator('text=Orçamento 1')).toBeHidden();
});
