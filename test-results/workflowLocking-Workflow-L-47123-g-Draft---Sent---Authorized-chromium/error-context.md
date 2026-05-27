# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflowLocking.spec.ts >> Workflow Locking E2E >> Budget workflow locking: Draft -> Sent -> Authorized
- Location: tests/e2e/workflowLocking.spec.ts:10:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/
Call log:
  - navigating to "http://localhost:5175/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Workflow Locking E2E', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.setViewportSize({ width: 375, height: 812 });
> 6  |     await page.goto('http://localhost:5175/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/
  7  |     await page.waitForTimeout(1000);
  8  |   });
  9  | 
  10 |   test('Budget workflow locking: Draft -> Sent -> Authorized', async ({ page }) => {
  11 |     // 1. Create Draft
  12 |     await page.click('button:has-text("Novo Orçamento")');
  13 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Locking Test');
  14 |     await page.getByRole('textbox', { name: 'Preço do Serviço R$' }).fill('100000'); // 1000.00
  15 |     
  16 |     // Actions should be 'Enviar para Cliente' and 'Salvar Rascunho'
  17 |     await expect(page.locator('button:has-text("Enviar para Cliente")')).toBeVisible();
  18 |     await expect(page.locator('button:has-text("Salvar Rascunho")')).toBeVisible();
  19 | 
  20 |     // 2. Transition to Sent
  21 |     await page.click('button:has-text("Enviar para Cliente")');
  22 |     await page.waitForTimeout(1000);
  23 |     
  24 |     // Status should be ENVIADO
  25 |     await expect(page.locator('text=ENVIADO')).toBeVisible();
  26 |     
  27 |     // Financials should be disabled
  28 |     const priceInput = page.getByRole('textbox', { name: 'Preço do Serviço R$' });
  29 |     await expect(priceInput).toBeDisabled();
  30 |     
  31 |     // Actions should be 'Autorizar Execução' and 'Recusar Orçamento'
  32 |     await expect(page.locator('button:has-text("Autorizar Execução")')).toBeVisible();
  33 |     await expect(page.locator('button:has-text("Recusar Orçamento")')).toBeVisible();
  34 | 
  35 |     // 3. Transition to Authorized
  36 |     await page.click('button:has-text("Autorizar Execução")');
  37 |     await page.waitForTimeout(1000);
  38 |     
  39 |     // Status should be AUTORIZADO
  40 |     await expect(page.locator('text=AUTORIZADO')).toBeVisible();
  41 |     
  42 |     // Title should now be disabled
  43 |     const titleInput = page.locator('input[placeholder="Ex: Instalação Residencial"]');
  44 |     await expect(titleInput).toBeDisabled();
  45 |     
  46 |     // Actions should be 'Iniciar Execução'
  47 |     await expect(page.locator('button:has-text("Iniciar Execução")')).toBeVisible();
  48 |     await expect(page.locator('button:has-text("Recusar Orçamento")')).not.toBeVisible();
  49 |   });
  50 | 
  51 |   test('Budget workflow locking: Executing -> Finalized', async ({ page }) => {
  52 |     // Create and move to Executing (shortcut for test speed)
  53 |     await page.click('button:has-text("Novo Orçamento")');
  54 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Execution Test');
  55 |     await page.click('button:has-text("Enviar para Cliente")');
  56 |     await page.click('button:has-text("Autorizar Execução")');
  57 |     await page.click('button:has-text("Iniciar Execução")');
  58 |     await page.waitForTimeout(1000);
  59 | 
  60 |     // Status should be EM_EXECUCAO
  61 |     await expect(page.locator('text=EM_EXECUCAO')).toBeVisible();
  62 |     
  63 |     // Notes should be editable
  64 |     const notesInput = page.locator('textarea[placeholder="Detalhes técnicos, dificuldades encontradas..."]');
  65 |     await expect(notesInput).toBeEnabled();
  66 |     await notesInput.fill('Operational note during execution');
  67 |     await page.click('button:has-text("Salvar Notas")');
  68 |     await page.waitForTimeout(1000);
  69 | 
  70 |     // 4. Finalize
  71 |     await page.click('button:has-text("Finalizar Trabalho")');
  72 |     await page.click('button:has-text("Confirmar")');
  73 |     await page.waitForTimeout(1000);
  74 |     
  75 |     // Status should be FINALIZADO
  76 |     await expect(page.locator('text=FINALIZADO')).toBeVisible();
  77 |     
  78 |     // Everything should be disabled
  79 |     await expect(notesInput).toBeDisabled();
  80 |     
  81 |     // Action should be 'Arquivar'
  82 |     await expect(page.locator('button:has-text("Arquivar Orçamento")')).toBeVisible();
  83 |   });
  84 | });
  85 | 
```