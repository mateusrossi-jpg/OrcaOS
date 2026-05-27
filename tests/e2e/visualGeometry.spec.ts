import { test, expect } from '@playwright/test';
import * as path from 'path';

const SCREENSHOT_DIR = 'docs/ux-audit/screenshots/p96/';

test.describe('P96 Visual Geometry Audit', () => {
  test.beforeEach(async ({ page }) => {
    // iPhone 13 viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5175/');
    await page.waitForTimeout(2000);
  });

  test('Capture Core Screens for Geometry Audit', async ({ page }) => {
    // 1. Home
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home-topo.png') });
    
    // Create a budget if needed to see "Últimos orçamentos"
    await page.click('button:has-text("Novo Orçamento")');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Geometria Teste P96');
    await page.getByRole('textbox', { name: 'Preço do Serviço R$' }).fill('125000');
    await page.click('button:has-text("Salvar Rascunho")');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Voltar")');
    
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-home-ultimos.png') });

    // 2. Histórico
    await page.click('.mobile-bottom-nav button:has-text("Operação")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-historico-topo.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-historico-lista.png'), fullPage: true });

    // 3. Financeiro
    await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-financeiro.png'), fullPage: true });

    // 4. Mais / Hub
    await page.click('.mobile-bottom-nav button:has-text("Mais")');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mais.png'), fullPage: true });

    // 5. Licença Pro
    await page.click('.menu-utility-list button:has-text("Licença Pro")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-licenca-pro.png'), fullPage: true });

    // 6. Relatórios
    await page.click('button:has-text("Voltar")');
    await page.click('.menu-utility-list button:has-text("Relatórios")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-relatorios.png'), fullPage: true });
  });

  test('Validate No Horizontal Overflow', async ({ page }) => {
    const screens = ['pulse', 'work-history', 'money', 'settings'];
    for (const screen of screens) {
       await page.goto(`http://localhost:5175/`);
       // This is a bit tricky if navigation is only via click, but App.tsx handles it.
       // Let's just click.
       if (screen === 'work-history') await page.click('.mobile-bottom-nav button:has-text("Operação")');
       if (screen === 'money') await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
       if (screen === 'settings') await page.click('.mobile-bottom-nav button:has-text("Mais")');
       
       const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
       expect(overflow).toBe(false);
    }
  });
});
