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

Locator: locator('.mobile-bottom-nav').locator('.bottom-nav-item')
Expected: visible
Error: strict mode violation: locator('.mobile-bottom-nav').locator('.bottom-nav-item') resolved to 4 elements:
    1) <button type="button" class="bottom-nav-item active">…</button> aka getByRole('button', { name: 'Resumo' })
    2) <button type="button" class="bottom-nav-item ">…</button> aka getByRole('button', { name: 'Operação' })
    3) <button type="button" class="bottom-nav-item ">…</button> aka getByRole('button', { name: 'Financeiro' })
    4) <button type="button" class="bottom-nav-item ">…</button> aka getByRole('button', { name: 'Mais' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.mobile-bottom-nav').locator('.bottom-nav-item')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - dialog [ref=e3]:
    - generic [ref=e4]:
      - img "Aferix" [ref=e5]
      - heading "Controle seu lucro com clareza" [level=1] [ref=e6]
      - paragraph [ref=e7]: Gestão financeira para autônomos
  - main [ref=e10]:
    - banner [ref=e11]:
      - button "Abrir menu" [ref=e12] [cursor=pointer]: ☰
      - img "Aferix" [ref=e14]
      - button "Notificações" [ref=e17] [cursor=pointer]:
        - img
    - main [ref=e21]:
      - heading "Painel Operacional" [level=1] [ref=e24]
      - generic [ref=e25]:
        - button "＋ Novo Orçamento" [ref=e27] [cursor=pointer]:
          - generic [ref=e28]: ＋
          - text: Novo Orçamento
        - generic [ref=e29]:
          - generic [ref=e30]: 🚀
          - strong [ref=e31]: Sua operação começa aqui
          - generic [ref=e32]: Crie seu primeiro orçamento para começar a gerenciar seus ganhos com precisão.
          - button "Criar primeiro orçamento" [ref=e34] [cursor=pointer]
    - navigation [ref=e35]:
      - button "Resumo" [ref=e36] [cursor=pointer]:
        - img [ref=e38]
        - generic [ref=e40]: Resumo
      - button "Operação" [ref=e41] [cursor=pointer]:
        - img [ref=e43]
        - generic [ref=e45]: Operação
      - button "Financeiro" [ref=e46] [cursor=pointer]:
        - img [ref=e48]
        - generic [ref=e50]: Financeiro
      - button "Mais" [ref=e51] [cursor=pointer]:
        - img [ref=e53]
        - generic [ref=e55]: Mais
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
  13 |     // Verify essential Home elements
  14 |     await expect(page.locator('button:has-text("Novo Orçamento")')).toBeVisible();
  15 |     // Ensure bottom navigation is present (already checked later)
  16 |     // Bottom nav should be visible and have 4 items
  17 |     const bottomNav = page.locator('.mobile-bottom-nav');
  18 |     await expect(bottomNav).toBeVisible();
> 19 |     await expect(bottomNav.locator('.bottom-nav-item')).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  20 |   });
  21 | 
  22 |   test('History page list integrity', async ({ page }) => {
  23 |     // Navigate to History (Operação)
  24 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  25 |     await expect(page.locator('header h1')).toContainText('Histórico');
  26 |     
  27 |     // Create a budget to see it in history
  28 |     await page.click('.mobile-bottom-nav button:has-text("Resumo")');
  29 |     await page.waitForTimeout(500);
  30 |     await page.click('button:has-text("Novo Orçamento")');
  31 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Mobile Test Budget');
  32 |     await page.click('button:has-text("Salvar Rascunho")');
  33 |     await page.waitForTimeout(1000); // Wait for save
  34 |     await page.click('button:has-text("Voltar")');
  35 |     
  36 |     // Back to history
  37 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  38 |     
  39 |     const listItem = page.locator('.operational-card').first();
  40 |     await expect(listItem).toBeVisible();
  41 |     
  42 |     // Check if title is visible and not broken (hard to check "broken" but we check visibility)
  43 |     await expect(listItem.locator('strong')).toContainText('Mobile Test Budget');
  44 |     
  45 |     // Action menu should be visible (as icon)
  46 |     const menuBtn = listItem.locator('button:has-text("⋮"), button:has-text("…"), [aria-label="Open action menu"]');
  47 |     await expect(menuBtn).toBeVisible();
  48 |   });
  49 | 
  50 |   test('Notification dropdown layout', async ({ page }) => {
  51 |     const notificationBtn = page.locator('button[aria-label="Notificações"]');
  52 |     await expect(notificationBtn).toBeVisible();
  53 |     await notificationBtn.click();
  54 |     
  55 |     const dropdown = page.locator('.notification-dropdown');
  56 |     await expect(dropdown).toBeVisible();
  57 |     
  58 |     // Check if dropdown doesn't overflow screen width (375px)
  59 |     const box = await dropdown.boundingBox();
  60 |     expect(box?.width).toBeLessThanOrEqual(375);
  61 |     expect(box?.x).toBeGreaterThanOrEqual(0);
  62 |   });
  63 | });
  64 | 
```