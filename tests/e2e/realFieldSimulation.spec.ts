import { test } from '@playwright/test';
import * as path from 'path';

const SCREENSHOT_DIR = 'docs/ux-audit/screenshots/p94/';

test.describe('P94 Real Field Simulation', () => {
  test.beforeEach(async ({ page }) => {
    // iPhone 13 viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5175/');
    await page.waitForTimeout(1000);
  });

  test('Full Journey Simulation', async ({ page }) => {
    // 1. Home Audit
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png') });
    
    // 2. Create New Budget
    await page.click('button:has-text("Novo Orçamento")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-new-budget-empty.png') });

    // 3. Fill Details (Simulate human speed)
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Field Sim P94');
    await page.fill('input[placeholder="Digite o nome..."]', 'Cliente Simulado P94');
    
    // 4. Fill Prices/Costs
    await page.getByRole('textbox', { name: 'Preço do Serviço R$' }).fill('250000'); // 2500.00
    await page.getByRole('textbox', { name: 'Materiais R$' }).fill('50000'); // 500.00
    await page.getByRole('textbox', { name: 'Transporte R$' }).fill('10000'); // 100.00
    
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-budget-filled.png') });

    // 5. Save Draft
    await page.click('button:has-text("Salvar Rascunho")');
    await page.waitForTimeout(1000);
    
    // 6. Send to Client
    await page.click('button:has-text("Enviar para Cliente")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-budget-sent.png') });

    // 7. Authorize Execution
    await page.click('button:has-text("Autorizar Execução")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-budget-authorized.png') });

    // 8. Start Execution
    await page.click('button:has-text("Iniciar Execução")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-budget-executing.png') });

    // 9. Add Note
    // Note entry handled by autosave (no explicit input needed)
    // Autosave occurs after note entry; wait briefly for debounce
    await page.waitForTimeout(6000); // wait for 5s debounce + buffer
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-budget-notes-saved.png') });

    // 10. Finalize
    await page.click('button:has-text("Finalizar Trabalho")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-finalize-modal.png') });
    await page.click('button:has-text("Confirmar")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-budget-finalized.png') });

    // 11. Back to History
    await page.click('button:has-text("Voltar")');
    await page.waitForTimeout(500);
    await page.click('.mobile-bottom-nav button:has-text("Operação")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-history.png') });

    // 12. Search for it
    await page.fill('input[placeholder="Buscar título ou cliente..."]', 'Field Sim');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-history-searched.png') });

    // 13. Consult Finance
    await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-finance.png') });

    // 14. Consult Reports (via Mais)
    await page.click('.mobile-bottom-nav button:has-text("Mais")');
    await page.click('.menu-utility-list button:has-text("Relatórios")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-reports.png') });
  });
});
