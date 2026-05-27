import { test } from '@playwright/test';
import * as path from 'path';

const SCREENSHOT_DIR = 'docs/ux-audit/screenshots/p91/';

test.describe('P91 Human UX Audit', () => {
  test.beforeEach(async ({ page }) => {
    // iPhone 13 Pro viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5175/');
    // Wait for the app to settle and intro to disappear
    await page.waitForTimeout(2000);
  });

  test('Perform Full UX Navigation and Screenshot Capture', async ({ page }) => {
    // 1. Home
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png'), fullPage: true });
    
    // 2. Lateral Menu (Drawer)
    const menuToggle = page.locator('button.menu-toggle').first();
    if (await menuToggle.count() > 0) {
      await menuToggle.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-menu-lateral.png') });
      // Close menu - try close button first, then forced backdrop
      const closeBtn = page.locator('.drawer-close-button');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.locator('.drawer-backdrop').click({ force: true });
      }
      await page.waitForTimeout(1000);
    }

    // 3. Mais (Menu tab)
    await page.click('.mobile-bottom-nav button:has-text("Mais")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-mais.png'), fullPage: true });

    // 4. Novo Orçamento (Top and Bottom)
    await page.click('.mobile-bottom-nav button:has-text("Resumo")'); // Back home
    await page.click('button:has-text("Novo Orçamento")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-novo-orcamento-topo.png') });
    
    // Fill title to scroll a bit
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Auditoria UX P91');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-novo-orcamento-final.png') });
    
    // Back to Home
    await page.click('button:has-text("Voltar")');
    await page.waitForTimeout(500);

    // 6. Histórico (Operação)
    await page.click('.mobile-bottom-nav button:has-text("Operação")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-historico.png'), fullPage: true });

    // 7. Financeiro
    await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-financeiro.png'), fullPage: true });

    // 8. Clientes (via Mais)
    await page.click('.mobile-bottom-nav button:has-text("Mais")');
    await page.click('.menu-utility-list button:has-text("Clientes")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-clientes.png'), fullPage: true });
    // Back to Mais
    await page.click('.mobile-bottom-nav button:has-text("Mais")');

    // 9. Catálogo (via Mais)
    await page.click('.menu-utility-list button:has-text("Catálogo")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-catalogo.png'), fullPage: true });
    // Back to Mais
    await page.click('.mobile-bottom-nav button:has-text("Mais")');

    // 10. Relatórios (via Mais)
    await page.click('.menu-utility-list button:has-text("Relatórios")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-relatorios.png'), fullPage: true });
    // Back to Mais
    await page.click('.mobile-bottom-nav button:has-text("Mais")');

    // 11. Perfil Profissional (Detail)
    await page.click('.menu-utility-list button:has-text("Perfil Profissional")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-configuracoes-ou-mais-detalhe.png'), fullPage: true });
  });
});
