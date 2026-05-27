import { test, expect } from '@playwright/test';

test.describe('Mobile Layout Hardening', () => {
  test.beforeEach(async ({ page }) => {
    // iPhone X viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/');
  });

  test('Home screen layout integrity', async ({ page }) => {
    await expect(page.locator('header h1')).toContainText('Painel Operacional');
    
    // Metrics should be visible
    await expect(page.locator('text=Pendentes')).toBeVisible();
    await expect(page.locator('text=Em Execução')).toBeVisible();
    
    // Bottom nav should be visible and have 4 items
    const bottomNav = page.locator('.mobile-bottom-nav');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.locator('button')).toHaveCount(4);
  });

  test('History page list integrity', async ({ page }) => {
    // Navigate to History (Operação)
    await page.click('.mobile-bottom-nav button:has-text("Operação")');
    await expect(page.locator('header h1')).toContainText('Histórico');
    
    // Create a budget to see it in history
    await page.click('.mobile-bottom-nav button:has-text("Resumo")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Novo Orçamento"), button:has-text("Novo Orçamento", button:has-text("Novo orçamento"))');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Mobile Test Budget');
    await page.click('button:has-text("Salvar Rascunho")');
    await page.waitForTimeout(1000); // Wait for save
    await page.click('button:has-text("Voltar")');
    
    // Back to history
    await page.click('.mobile-bottom-nav button:has-text("Operação")');
    
    const listItem = page.locator('.operational-card').first();
    await expect(listItem).toBeVisible();
    
    // Check if title is visible and not broken (hard to check "broken" but we check visibility)
    await expect(listItem.locator('strong')).toContainText('Mobile Test Budget');
    
    // Action menu should be visible (as icon)
    const menuBtn = listItem.locator('button:has-text("⋮"), button:has-text("…"), [aria-label="Open action menu"]');
    await expect(menuBtn).toBeVisible();
  });

  test('Notification dropdown layout', async ({ page }) => {
    const notificationBtn = page.locator('button[aria-label="Notificações"]');
    await expect(notificationBtn).toBeVisible();
    await notificationBtn.click();
    
    const dropdown = page.locator('.notification-dropdown');
    await expect(dropdown).toBeVisible();
    
    // Check if dropdown doesn't overflow screen width (375px)
    const box = await dropdown.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
    expect(box?.x).toBeGreaterThanOrEqual(0);
  });
});
