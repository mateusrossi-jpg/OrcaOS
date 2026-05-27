import { test, expect } from '@playwright/test';

test('Internal Diagnostics validation (P100)', async ({ page }) => {
  // Surface browser logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('dialog', async dialog => await dialog.accept());
  
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });

  // 1. Trigger the Hidden Debug Panel
  await page.evaluate(() => {
    // @ts-expect-error injected
    if (window.AFERIX_DEBUG) {
      // @ts-expect-error injected
      window.AFERIX_DEBUG();
    }
  });

  // 2. Validate Debug Panel UI
  await page.waitForSelector('h2:has-text("Aferix Internal Diagnostics Panel")');
  
  // Wait for the scan to finish by checking for the health score string
  await expect(page.locator('h3:has-text("Health Score:")')).toBeVisible({ timeout: 10000 });

  // Score should be 100 initially on a clean db
  const scoreText = await page.locator('h3:has-text("Health Score:")').innerText();
  expect(scoreText).toMatch(/100\/100/);

  // Close Panel
  await page.click('button:has-text("CLOSE")');
  await expect(page.locator('h2:has-text("Aferix Internal Diagnostics Panel")')).toBeHidden();

  // 3. Create a budget to test sync queue health
  const homeBtn = page.locator('button:has-text("Novo Orçamento")').first();
  if (await homeBtn.isVisible()) {
    await homeBtn.click({ force: true });
  } else {
    await page.click('.bottom-nav-item:has-text("Resumo")');
    await page.click('button:has-text("Novo Orçamento")');
  }
  await page.waitForTimeout(500);

  const budgetTitle = `Diag Test ${Date.now()}`;
  await page.fill('input[placeholder="Ex: Instalação Residencial"]', budgetTitle);
  const chargedInput = page.locator('input[inputmode="numeric"]').first();
  await chargedInput.fill('2000');
  await page.click('button:has-text("Salvar Rascunho")', { force: true });
  await page.waitForTimeout(1000); // Wait for Dexie

  // 4. Re-open Debug Panel
  await page.evaluate(() => {
    // @ts-expect-error injected
    if (window.AFERIX_DEBUG) window.AFERIX_DEBUG();
  });

  await expect(page.locator('p:has-text("Total Budgets: 1")')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('p:has-text("Pending Sync: 1")')).toBeVisible();

  // Health should still be 100 (pending is normal)
  const newScore = await page.locator('h3:has-text("Health Score:")').innerText();
  expect(newScore).toMatch(/100\/100/);

  await page.click('button:has-text("CLOSE")');
});
