# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visualGeometry.spec.ts >> P96 Visual Geometry Audit >> Capture Core Screens for Geometry Audit
- Location: tests/e2e/visualGeometry.spec.ts:14:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/
Call log:
  - navigating to "http://localhost:5175/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as path from 'path';
  3  | 
  4  | const SCREENSHOT_DIR = 'docs/ux-audit/screenshots/p96/';
  5  | 
  6  | test.describe('P96 Visual Geometry Audit', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     // iPhone 13 viewport
  9  |     await page.setViewportSize({ width: 390, height: 844 });
> 10 |     await page.goto('http://localhost:5175/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/
  11 |     await page.waitForTimeout(2000);
  12 |   });
  13 | 
  14 |   test('Capture Core Screens for Geometry Audit', async ({ page }) => {
  15 |     // 1. Home
  16 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home-topo.png') });
  17 |     
  18 |     // Create a budget if needed to see "Últimos orçamentos"
  19 |     await page.click('button:has-text("Novo Orçamento", button:has-text("Novo orçamento"))');
  20 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Geometria Teste P96');
  21 |     await page.getByRole('textbox', { name: 'Preço do Serviço R$' }).fill('125000');
  22 |     await page.click('button:has-text("Salvar Rascunho")');
  23 |     await page.waitForTimeout(1000);
  24 |     await page.click('button:has-text("Voltar")');
  25 |     
  26 |     await page.evaluate(() => window.scrollTo(0, 500));
  27 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-home-ultimos.png') });
  28 | 
  29 |     // 2. Histórico
  30 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  31 |     await page.waitForTimeout(500);
  32 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-historico-topo.png') });
  33 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-historico-lista.png'), fullPage: true });
  34 | 
  35 |     // 3. Financeiro
  36 |     await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
  37 |     await page.waitForTimeout(500);
  38 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-financeiro.png'), fullPage: true });
  39 | 
  40 |     // 4. Mais / Hub
  41 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  42 |     await page.waitForTimeout(500);
  43 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mais.png'), fullPage: true });
  44 | 
  45 |     // 5. Licença Pro
  46 |     await page.click('.menu-utility-list button:has-text("Licença Pro")');
  47 |     await page.waitForTimeout(1000);
  48 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-licenca-pro.png'), fullPage: true });
  49 | 
  50 |     // 6. Relatórios
  51 |     await page.click('button:has-text("Voltar")');
  52 |     await page.click('.menu-utility-list button:has-text("Relatórios")');
  53 |     await page.waitForTimeout(1000);
  54 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-relatorios.png'), fullPage: true });
  55 |   });
  56 | 
  57 |   test('Validate No Horizontal Overflow', async ({ page }) => {
  58 |     const screens = ['pulse', 'work-history', 'money', 'settings'];
  59 |     for (const screen of screens) {
  60 |        await page.goto(`http://localhost:5175/`);
  61 |        // This is a bit tricky if navigation is only via click, but App.tsx handles it.
  62 |        // Let's just click.
  63 |        if (screen === 'work-history') await page.click('.mobile-bottom-nav button:has-text("Operação")');
  64 |        if (screen === 'money') await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
  65 |        if (screen === 'settings') await page.click('.mobile-bottom-nav button:has-text("Mais")');
  66 |        
  67 |        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  68 |        expect(overflow).toBe(false);
  69 |     }
  70 |   });
  71 | });
  72 | 
```