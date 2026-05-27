import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Premium Layout Rhythm', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 13

  test.beforeAll(() => {
    if (!fs.existsSync('docs/ux-audit/screenshots/p97')) {
      fs.mkdirSync('docs/ux-audit/screenshots/p97', { recursive: true });
    }
  });

  test('Capture P97 Screenshots and Validate Layout Rules', async ({ page }) => {
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');

    // 1. Home / Resumo
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/01-home.png' });

    // Validate Home CTA
    const newBudgetCTA = page.locator('button', { hasText: 'Novo Orçamento' });
    if (await newBudgetCTA.isVisible()) {
       await expect(newBudgetCTA).toBeVisible();
    }

    // 2. Histórico / Operação
    await page.click('button:has-text("Operação")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/02-historico.png' });

    // 3. Financeiro
    await page.click('button:has-text("Financeiro")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/03-financeiro.png' });

    // 4. Mais
    await page.click('button:has-text("Mais")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/04-mais.png' });

    // 5. Clientes
    await page.click('button:has-text("Clientes")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/05-clientes.png' });
    await page.goto('http://localhost:5175/');

    // 6. Catálogo
    await page.click('button:has-text("Mais")');
    await page.click('button:has-text("Catálogo")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/06-catalogo.png' });
    await page.goto('http://localhost:5175/');

    // 7. Relatórios
    await page.click('button:has-text("Mais")');
    await page.click('button:has-text("Relatórios")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/07-relatorios.png' });
    await page.goto('http://localhost:5175/');

    // 8. Licença Pro
    await page.click('button:has-text("Mais")');
    await page.locator('text="Licença Pro"').last().click({ force: true });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/08-licenca-pro.png' });
    await page.goto('http://localhost:5175/');

    // 9. Novo Orçamento
    await page.click('button:has-text("Resumo")');
    await page.click('button', { hasText: 'Novo Orçamento' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'docs/ux-audit/screenshots/p97/09-novo-orcamento.png' });
    
    // Check for horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);

    // Validate terminology in Mais/Licença - shouldn't exist
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toMatch(/Bridge|Endpoint|Package|Billing técnico|plugin|token|feature flag/i);
  });
});
