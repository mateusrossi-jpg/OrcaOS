import { test, expect } from '@playwright/test';

test.describe('ERP Integrity - Financial & Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5175/');
  });

  test('Financial Calculation Accuracy', async ({ page }) => {
    await page.click('button:has-text("Novo Orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'ERP Integrity Test');
    
    // Inputs (MonetaryInput uses inputmode="numeric")
    const inputs = page.locator('input[inputmode="numeric"]');
    await inputs.nth(0).fill('100000'); // Charged: 1000.00
    await inputs.nth(1).fill('30000');  // Material: 300.00
    await inputs.nth(3).fill('10000');  // Transport: 100.00 (nth(2) is helperCost)
    await inputs.nth(4).fill('5000');   // Fees: 50.00
    await inputs.nth(5).fill('5000');   // Discounts: 50.00

    await page.waitForTimeout(2000);

    // Look for values anywhere on the page
    await expect(page.locator('body')).toContainText('500,00');
    await expect(page.locator('body')).toContainText('52,6%');
    await expect(page.locator('body')).toContainText('450,00');
  });

  test('Status Workflow and Read-Only Mode', async ({ page }) => {
    await page.click('button:has-text("Novo Orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Workflow Test');
    
    await page.click('button:has-text("Enviar para Cliente")');
    await page.click('button:has-text("Autorizar Execução")');
    await page.click('button:has-text("Iniciar Execução")');
    await page.click('button:has-text("Finalizar Orçamento")');
    await page.click('button:has-text("Confirmar")');
    
    await expect(page.locator('input[placeholder="Ex: Instalação Residencial"]')).toBeDisabled();
    await expect(page.locator('span:has-text("Finalizado")')).toBeVisible();
  });

  test('Persistence and Multi-Budget Integrity', async ({ page }) => {
    // Create Budget 1
    await page.click('button:has-text("Novo Orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Budget 1');
    await page.click('button:has-text("Salvar Rascunho")');
    await page.waitForTimeout(1000); // Wait for save
    
    // Go back to home
    await page.goto('http://localhost:5175/');
    
    // Create Budget 2
    await page.click('button:has-text("Novo Orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Budget 2');
    await page.click('button:has-text("Salvar Rascunho")');
    await page.waitForTimeout(1000); // Wait for save

    // Go to history via Home list or navigation
    await page.goto('http://localhost:5175/');
    
    // Check if both appear in the recent list on Home
    await expect(page.locator('text=Budget 1').first()).toBeVisible();
    await expect(page.locator('text=Budget 2').first()).toBeVisible();
    
    // Reload and check again
    await page.reload();
    await expect(page.locator('text=Budget 1').first()).toBeVisible();
    await expect(page.locator('text=Budget 2').first()).toBeVisible();
  });
});
