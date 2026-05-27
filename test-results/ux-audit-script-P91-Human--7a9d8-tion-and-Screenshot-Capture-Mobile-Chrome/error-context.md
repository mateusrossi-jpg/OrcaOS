# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux-audit-script.spec.ts >> P91 Human UX Audit >> Perform Full UX Navigation and Screenshot Capture
- Location: tests/e2e/ux-audit-script.spec.ts:15:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/
Call log:
  - navigating to "http://localhost:5175/", waiting until "load"

```

# Test source

```ts
  1  | import { test } from '@playwright/test';
  2  | import * as path from 'path';
  3  | 
  4  | const SCREENSHOT_DIR = 'docs/ux-audit/screenshots/p91/';
  5  | 
  6  | test.describe('P91 Human UX Audit', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     // iPhone 13 Pro viewport
  9  |     await page.setViewportSize({ width: 390, height: 844 });
> 10 |     await page.goto('http://localhost:5175/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/
  11 |     // Wait for the app to settle and intro to disappear
  12 |     await page.waitForTimeout(2000);
  13 |   });
  14 | 
  15 |   test('Perform Full UX Navigation and Screenshot Capture', async ({ page }) => {
  16 |     // 1. Home
  17 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png'), fullPage: true });
  18 |     
  19 |     // 2. Lateral Menu (Drawer)
  20 |     const menuToggle = page.locator('button.menu-toggle').first();
  21 |     if (await menuToggle.count() > 0) {
  22 |       await menuToggle.click();
  23 |       await page.waitForTimeout(1000);
  24 |       await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-menu-lateral.png') });
  25 |       // Close menu - try close button first, then forced backdrop
  26 |       const closeBtn = page.locator('.drawer-close-button');
  27 |       if (await closeBtn.isVisible()) {
  28 |         await closeBtn.click();
  29 |       } else {
  30 |         await page.locator('.drawer-backdrop').click({ force: true });
  31 |       }
  32 |       await page.waitForTimeout(1000);
  33 |     }
  34 | 
  35 |     // 3. Mais (Menu tab)
  36 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  37 |     await page.waitForTimeout(500);
  38 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-mais.png'), fullPage: true });
  39 | 
  40 |     // 4. Novo Orçamento (Top and Bottom)
  41 |     await page.click('.mobile-bottom-nav button:has-text("Resumo")'); // Back home
  42 |     await page.click('button:has-text("Novo Orçamento", button:has-text("Novo orçamento"))');
  43 |     await page.waitForTimeout(1000);
  44 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-novo-orcamento-topo.png') });
  45 |     
  46 |     // Fill title to scroll a bit
  47 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Auditoria UX P91');
  48 |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  49 |     await page.waitForTimeout(500);
  50 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-novo-orcamento-final.png') });
  51 |     
  52 |     // Back to Home
  53 |     await page.click('button:has-text("Voltar")');
  54 |     await page.waitForTimeout(500);
  55 | 
  56 |     // 6. Histórico (Operação)
  57 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  58 |     await page.waitForTimeout(1000);
  59 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-historico.png'), fullPage: true });
  60 | 
  61 |     // 7. Financeiro
  62 |     await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
  63 |     await page.waitForTimeout(1000);
  64 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-financeiro.png'), fullPage: true });
  65 | 
  66 |     // 8. Clientes (via Mais)
  67 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  68 |     await page.click('.menu-utility-list button:has-text("Clientes")');
  69 |     await page.waitForTimeout(1000);
  70 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-clientes.png'), fullPage: true });
  71 |     // Back to Mais
  72 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  73 | 
  74 |     // 9. Catálogo (via Mais)
  75 |     await page.click('.menu-utility-list button:has-text("Catálogo")');
  76 |     await page.waitForTimeout(1000);
  77 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-catalogo.png'), fullPage: true });
  78 |     // Back to Mais
  79 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  80 | 
  81 |     // 10. Relatórios (via Mais)
  82 |     await page.click('.menu-utility-list button:has-text("Relatórios")');
  83 |     await page.waitForTimeout(1000);
  84 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-relatorios.png'), fullPage: true });
  85 |     // Back to Mais
  86 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  87 | 
  88 |     // 11. Perfil Profissional (Detail)
  89 |     await page.click('.menu-utility-list button:has-text("Perfil Profissional")');
  90 |     await page.waitForTimeout(1000);
  91 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-configuracoes-ou-mais-detalhe.png'), fullPage: true });
  92 |   });
  93 | });
  94 | 
```