# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobileLayout.spec.ts >> Mobile Layout Hardening >> Home screen layout integrity
- Location: tests/e2e/mobileLayout.spec.ts:10:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Pendentes')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Pendentes')

```

```yaml
- main:
  - banner:
    - button "Abrir menu": ☰
    - img "Aferix"
    - button "Notificações":
      - img
  - main:
    - heading "Painel Operacional" [level=1]
    - button "＋ Novo Orçamento"
    - text: 🚀
    - strong: Sua operação começa aqui
    - text: Crie seu primeiro orçamento para começar a gerenciar seus ganhos com precisão.
    - button "Criar primeiro orçamento"
  - navigation:
    - button "Resumo"
    - button "Operação"
    - button "Financeiro"
    - button "Mais"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Mobile Layout Hardening', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // iPhone X viewport
  6  |     await page.setViewportSize({ width: 375, height: 812 });
  7  |     await page.goto('http://localhost:5175/');
  8  |   });
  9  | 
  10 |   test('Home screen layout integrity', async ({ page }) => {
  11 |     await expect(page.locator('header h1')).toContainText('Painel Operacional');
  12 |     
  13 |     // Metrics should be visible
> 14 |     await expect(page.locator('text=Pendentes')).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
  15 |     await expect(page.locator('text=Em Execução')).toBeVisible();
  16 |     
  17 |     // Bottom nav should be visible and have 4 items
  18 |     const bottomNav = page.locator('.mobile-bottom-nav');
  19 |     await expect(bottomNav).toBeVisible();
  20 |     await expect(bottomNav.locator('button')).toHaveCount(4);
  21 |   });
  22 | 
  23 |   test('History page list integrity', async ({ page }) => {
  24 |     // Navigate to History (Operação)
  25 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  26 |     await expect(page.locator('header h1')).toContainText('Histórico');
  27 |     
  28 |     // Create a budget to see it in history
  29 |     await page.click('.mobile-bottom-nav button:has-text("Resumo")');
  30 |     await page.waitForTimeout(500);
  31 |     await page.click('button:has-text("Novo Orçamento")');
  32 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Mobile Test Budget');
  33 |     await page.click('button:has-text("Salvar Rascunho")');
  34 |     await page.waitForTimeout(1000); // Wait for save
  35 |     await page.click('button:has-text("Voltar")');
  36 |     
  37 |     // Back to history
  38 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  39 |     
  40 |     const listItem = page.locator('.operational-card').first();
  41 |     await expect(listItem).toBeVisible();
  42 |     
  43 |     // Check if title is visible and not broken (hard to check "broken" but we check visibility)
  44 |     await expect(listItem.locator('strong')).toContainText('Mobile Test Budget');
  45 |     
  46 |     // Action menu should be visible (as icon)
  47 |     const menuBtn = listItem.locator('button:has-text("⋮"), button:has-text("…"), [aria-label="Open action menu"]');
  48 |     await expect(menuBtn).toBeVisible();
  49 |   });
  50 | 
  51 |   test('Notification dropdown layout', async ({ page }) => {
  52 |     const notificationBtn = page.locator('button[aria-label="Notificações"]');
  53 |     await expect(notificationBtn).toBeVisible();
  54 |     await notificationBtn.click();
  55 |     
  56 |     const dropdown = page.locator('.notification-dropdown');
  57 |     await expect(dropdown).toBeVisible();
  58 |     
  59 |     // Check if dropdown doesn't overflow screen width (375px)
  60 |     const box = await dropdown.boundingBox();
  61 |     expect(box?.width).toBeLessThanOrEqual(375);
  62 |     expect(box?.x).toBeGreaterThanOrEqual(0);
  63 |   });
  64 | });
  65 | 
```