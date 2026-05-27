import { test, expect } from '@playwright/test';

test.describe('Workflow Locking E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5175/');
    await page.waitForTimeout(1000);
  });

  test('Budget workflow locking: Draft -> Sent -> Authorized', async ({ page }) => {
    // 1. Create Draft
    await page.click('button:has-text("Novo Orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Locking Test');
    await page.getByRole('textbox', { name: 'Preço do Serviço R$' }).fill('100000'); // 1000.00
    
    // Actions should be 'Enviar para Cliente' and 'Salvar Rascunho'
    await expect(page.locator('button:has-text("Enviar para Cliente")')).toBeVisible();
    await expect(page.locator('button:has-text("Salvar Rascunho")')).toBeVisible();

    // 2. Transition to Sent
    await page.click('button:has-text("Enviar para Cliente")');
    await page.waitForTimeout(1000);
    
    // Status should be ENVIADO
    await expect(page.locator('text=ENVIADO')).toBeVisible();
    
    // Financials should be disabled
    const priceInput = page.getByRole('textbox', { name: 'Preço do Serviço R$' });
    await expect(priceInput).toBeDisabled();
    
    // Actions should be 'Autorizar Execução' and 'Recusar Orçamento'
    await expect(page.locator('button:has-text("Autorizar Execução")')).toBeVisible();
    await expect(page.locator('button:has-text("Recusar Orçamento")')).toBeVisible();

    // 3. Transition to Authorized
    await page.click('button:has-text("Autorizar Execução")');
    await page.waitForTimeout(1000);
    
    // Status should be AUTORIZADO
    await expect(page.locator('text=AUTORIZADO')).toBeVisible();
    
    // Title should now be disabled
    const titleInput = page.locator('input[placeholder="Ex: Instalação Residencial"]');
    await expect(titleInput).toBeDisabled();
    
    // Actions should be 'Iniciar Execução'
    await expect(page.locator('button:has-text("Iniciar Execução")')).toBeVisible();
    await expect(page.locator('button:has-text("Recusar Orçamento")')).not.toBeVisible();
  });

  test('Budget workflow locking: Executing -> Finalized', async ({ page }) => {
    // Create and move to Executing (shortcut for test speed)
    await page.click('button:has-text("Novo Orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Execution Test');
    await page.click('button:has-text("Enviar para Cliente")');
    await page.click('button:has-text("Autorizar Execução")');
    await page.click('button:has-text("Iniciar Execução")');
    await page.waitForTimeout(1000);

    // Status should be EM_EXECUCAO
    await expect(page.locator('text=EM_EXECUCAO')).toBeVisible();
    
    // Notes should be editable
    const notesInput = page.locator('textarea[placeholder="Detalhes técnicos, dificuldades encontradas..."]');
    await expect(notesInput).toBeEnabled();
    await notesInput.fill('Operational note during execution');
    await page.click('button:has-text("Salvar Notas")');
    await page.waitForTimeout(1000);

    // 4. Finalize
    await page.click('button:has-text("Finalizar Trabalho")');
    await page.click('button:has-text("Confirmar")');
    await page.waitForTimeout(1000);
    
    // Status should be FINALIZADO
    await expect(page.locator('text=FINALIZADO')).toBeVisible();
    
    // Everything should be disabled
    await expect(notesInput).toBeDisabled();
    
    // Action should be 'Arquivar'
    await expect(page.locator('button:has-text("Arquivar Orçamento")')).toBeVisible();
  });
});
