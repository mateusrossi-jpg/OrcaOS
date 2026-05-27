# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visualAudit.spec.ts >> Mobile Structural Layout Audit >> Catalog page structural integrity
- Location: tests/e2e/visualAudit.spec.ts:70:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('header h1:has-text("Catálogo")') to be visible

```

# Page snapshot

```yaml
- main [ref=e3]:
  - banner [ref=e4]:
    - button "Abrir menu" [ref=e5] [cursor=pointer]: ☰
    - img "Aferix" [ref=e7]
    - button "Notificações" [ref=e10] [cursor=pointer]:
      - img
  - main [ref=e14]:
    - generic [ref=e16]:
      - heading "Histórico" [level=1] [ref=e17]
      - generic [ref=e18]: 0 orçamentos registrados.
    - generic [ref=e19]:
      - textbox "Buscar título ou cliente..." [ref=e21]
      - group "Filtrar orçamentos" [ref=e23]:
        - button "Todos" [pressed] [ref=e24] [cursor=pointer]
        - button "Em andamento" [ref=e25] [cursor=pointer]
        - button "Finalizados" [ref=e26] [cursor=pointer]
    - generic [ref=e27]:
      - strong [ref=e28]: Vazio
      - generic [ref=e29]: Orçamentos salvos aparecerão aqui.
  - navigation [ref=e30]:
    - button "Resumo" [ref=e31] [cursor=pointer]:
      - img [ref=e33]
      - generic [ref=e35]: Resumo
    - button "Operação" [active] [ref=e36] [cursor=pointer]:
      - img [ref=e38]
      - generic [ref=e40]: Operação
    - button "Financeiro" [ref=e41] [cursor=pointer]:
      - img [ref=e43]
      - generic [ref=e45]: Financeiro
    - button "Mais" [ref=e46] [cursor=pointer]:
      - img [ref=e48]
      - generic [ref=e50]: Mais
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Mobile Structural Layout Audit', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // iPhone X viewport
  6  |     await page.setViewportSize({ width: 375, height: 812 });
  7  |     await page.goto('http://localhost:5175/');
  8  |   });
  9  | 
  10 |   const checkLayout = async (page) => {
  11 |     const overflow = await page.evaluate(() => {
  12 |       const docWidth = document.documentElement.scrollWidth;
  13 |       const windowWidth = window.innerWidth;
  14 |       return docWidth > windowWidth;
  15 |     });
  16 |     expect(overflow).toBe(false);
  17 | 
  18 |     // Check if main shell fits width comfortably (at least 90% of screen)
  19 |     const shell = page.locator('.aferix-page-shell').first();
  20 |     if (await shell.count() > 0) {
  21 |       const box = await shell.boundingBox();
  22 |       expect(box?.width).toBeGreaterThanOrEqual(375 * 0.9);
  23 |       expect(box?.width).toBeLessThanOrEqual(375);
  24 |     }
  25 |   };
  26 | 
  27 |   test('Home screen structural integrity', async ({ page }) => {
  28 |     await page.waitForSelector('header h1');
  29 |     await page.waitForTimeout(500);
  30 |     await checkLayout(page);
  31 |     
  32 |     // KPIs should be visible and occupy full width
  33 |     const kpiPanel = page.locator('.operational-metrics-panel');
  34 |     // await expect(page.locator('.sticky-action-bar')).toBeVisible(); // removed as UI no longer shows sticky bar
  35 |     const box = await kpiPanel.boundingBox();
  36 |     expect(box?.width).toBeGreaterThan(280); 
  37 |   });
  38 | 
  39 |   test('History page structural integrity', async ({ page }) => {
  40 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  41 |     await page.waitForSelector('header h1:has-text("Histórico")');
  42 |     await checkLayout(page);
  43 | 
  44 |     // Check list item layout
  45 |     const listItem = page.locator('.continuous-list-item').first();
  46 |     if (await listItem.count() > 0) {
  47 |       const box = await listItem.boundingBox();
  48 |       expect(box?.width).toBeGreaterThan(280);
  49 |     }
  50 |   });
  51 | 
  52 |   test('Finance page structural integrity', async ({ page }) => {
  53 |     await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
  54 |     await page.waitForSelector('header h1:has-text("Fluxo de Caixa")');
  55 |     await checkLayout(page);
  56 |   });
  57 | 
  58 |   test('Menu page structural integrity', async ({ page }) => {
  59 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  60 |     await page.waitForSelector('header h1:has-text("Mais")');
  61 |     await checkLayout(page);
  62 | 
  63 |     // Menu items should be full width
  64 |     const menuItem = page.locator('.menu-utility-item').first();
  65 |     await expect(menuItem).toBeVisible();
  66 |     const box = await menuItem.boundingBox();
  67 |     expect(box?.width).toBeGreaterThan(280);
  68 |   });
  69 | 
  70 |   test('Catalog page structural integrity', async ({ page }) => {
  71 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  72 |     await page.waitForSelector('.sticky-action-bar', { state: 'detached' });
  73 |     await page.click('button:has-text("Operação")');
> 74 |     await page.waitForSelector('header h1:has-text("Catálogo")');
     |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  75 |     
  76 |     await page.waitForTimeout(1000);
  77 |     await checkLayout(page);
  78 | 
  79 |     // Chip wrapper should be visible and not overflow
  80 |     const chips = page.locator('.aferix-filter-chips-wrapper');
  81 |     if (await chips.count() > 0) {
  82 |       await expect(chips).toBeVisible();
  83 |       const box = await chips.boundingBox();
  84 |       expect(box?.width).toBeLessThanOrEqual(375);
  85 |     }
  86 |   });
  87 | });
  88 | 
```