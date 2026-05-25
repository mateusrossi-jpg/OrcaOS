import { test, expect } from '@playwright/test';

test.describe('ERP Integrity - Financial & Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/');
  });

  test('Financial Calculation Accuracy', async ({ page }) => {
    await page.click('button:has-text("Novo orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'ERP Integrity Test');
    
    // Inputs
    await page.fill('section input[type="number"]', '1000');
    await page.fill('label:has-text("Materiais") + div input', '300'); 
    await page.fill('label:has-text("Transporte") + div input', '100');
    await page.fill('label:has-text("Taxas") + div input', '50');
    await page.fill('label:has-text("Desconto") + div input', '50');

    await page.waitForTimeout(2000);

    // Look for values anywhere on the page
    // Using simple strings to avoid regex/non-breaking space issues
    await expect(page.locator('body')).toContainText('500,00');
    await expect(page.locator('body')).toContainText('52,6%');
    await expect(page.locator('body')).toContainText('450,00');
  });

  test('Status Workflow and Read-Only Mode', async ({ page }) => {
    await page.click('button:has-text("Novo orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Workflow Test');
    
    await page.click('button:has-text("Enviado")');
    await page.click('button:has-text("Autorizar")');
    await page.click('button:has-text("Finalizar Orçamento")');
    await page.click('button:has-text("Confirmar e Congelar")');
    
    await expect(page.locator('input[placeholder="Ex: Instalação Residencial"]')).toBeDisabled();
    await expect(page.locator('span:has-text("finalizado")')).toBeVisible();
  });

  test('Persistence and Multi-Budget Integrity', async ({ page }) => {
    // Create Budget 1
    await page.click('button:has-text("Novo orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Budget 1');
    await page.click('button:has-text("Salvar Rascunho")');
    await page.waitForTimeout(1000); // Wait for save
    
    // Go back to home
    await page.goto('http://localhost:5173/');
    
    // Create Budget 2
    await page.click('button:has-text("Novo orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Budget 2');
    await page.click('button:has-text("Salvar Rascunho")');
    await page.waitForTimeout(1000); // Wait for save

    // Go to history via Home list or navigation
    await page.goto('http://localhost:5173/');
    
    // Check if both appear in the recent list on Home
    await expect(page.locator('text=Budget 1')).toBeVisible();
    await expect(page.locator('text=Budget 2')).toBeVisible();
    
    // Reload and check again
    await page.reload();
    await expect(page.locator('text=Budget 1')).toBeVisible();
    await expect(page.locator('text=Budget 2')).toBeVisible();
  });
});
