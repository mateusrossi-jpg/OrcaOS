# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: realFieldSimulation.spec.ts >> P94 Real Field Simulation >> Full Journey Simulation
- Location: tests/e2e/realFieldSimulation.spec.ts:14:3

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
  4  | const SCREENSHOT_DIR = 'docs/ux-audit/screenshots/p94/';
  5  | 
  6  | test.describe('P94 Real Field Simulation', () => {
  7  |   test.beforeEach(async ({ page }) => {
  8  |     // iPhone 13 viewport
  9  |     await page.setViewportSize({ width: 390, height: 844 });
> 10 |     await page.goto('http://localhost:5175/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/
  11 |     await page.waitForTimeout(1000);
  12 |   });
  13 | 
  14 |   test('Full Journey Simulation', async ({ page }) => {
  15 |     // 1. Home Audit
  16 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png') });
  17 |     
  18 |     // 2. Create New Budget
  19 |     await page.click('button:has-text("Novo orçamento")');
  20 |     await page.waitForTimeout(500);
  21 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-new-budget-empty.png') });
  22 | 
  23 |     // 3. Fill Details (Simulate human speed)
  24 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Field Sim P94');
  25 |     await page.fill('input[placeholder="Digite o nome..."]', 'Cliente Simulado P94');
  26 |     
  27 |     // 4. Fill Prices/Costs
  28 |     await page.getByRole('textbox', { name: 'Preço do Serviço R$' }).fill('250000'); // 2500.00
  29 |     await page.getByRole('textbox', { name: 'Materiais R$' }).fill('50000'); // 500.00
  30 |     await page.getByRole('textbox', { name: 'Transporte R$' }).fill('10000'); // 100.00
  31 |     
  32 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-budget-filled.png') });
  33 | 
  34 |     // 5. Save Draft
  35 |     await page.click('button:has-text("Salvar Rascunho")');
  36 |     await page.waitForTimeout(1000);
  37 |     
  38 |     // 6. Send to Client
  39 |     await page.click('button:has-text("Enviar para Cliente")');
  40 |     await page.waitForTimeout(1000);
  41 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-budget-sent.png') });
  42 | 
  43 |     // 7. Authorize Execution
  44 |     await page.click('button:has-text("Autorizar Execução")');
  45 |     await page.waitForTimeout(1000);
  46 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-budget-authorized.png') });
  47 | 
  48 |     // 8. Start Execution
  49 |     await page.click('button:has-text("Iniciar Execução")');
  50 |     await page.waitForTimeout(1000);
  51 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-budget-executing.png') });
  52 | 
  53 |     // 9. Add Note
  54 |     const notesInput = page.locator('textarea[placeholder="Detalhes técnicos, dificuldades encontradas..."]');
  55 |     await notesInput.fill('Note from the field: All good.');
  56 |     await page.click('button:has-text("Salvar Notas")');
  57 |     await page.waitForTimeout(1000);
  58 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-budget-notes-saved.png') });
  59 | 
  60 |     // 10. Finalize
  61 |     await page.click('button:has-text("Finalizar Trabalho")');
  62 |     await page.waitForTimeout(500);
  63 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-finalize-modal.png') });
  64 |     await page.click('button:has-text("Confirmar")');
  65 |     await page.waitForTimeout(1000);
  66 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-budget-finalized.png') });
  67 | 
  68 |     // 11. Back to History
  69 |     await page.click('button:has-text("Voltar")');
  70 |     await page.waitForTimeout(500);
  71 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  72 |     await page.waitForTimeout(500);
  73 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-history.png') });
  74 | 
  75 |     // 12. Search for it
  76 |     await page.fill('input[placeholder="Buscar título ou cliente..."]', 'Field Sim');
  77 |     await page.waitForTimeout(500);
  78 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-history-searched.png') });
  79 | 
  80 |     // 13. Consult Finance
  81 |     await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
  82 |     await page.waitForTimeout(500);
  83 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-finance.png') });
  84 | 
  85 |     // 14. Consult Reports (via Mais)
  86 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  87 |     await page.click('.menu-utility-list button:has-text("Relatórios")');
  88 |     await page.waitForTimeout(1000);
  89 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-reports.png') });
  90 |   });
  91 | });
  92 | 
```