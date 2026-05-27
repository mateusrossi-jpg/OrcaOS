# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflowLocking.spec.ts >> Workflow Locking E2E >> Budget workflow locking: Executing -> Finalized
- Location: tests/e2e/workflowLocking.spec.ts:58:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/finalizado/i')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/finalizado/i')

```

```yaml
- main:
  - banner:
    - button "Abrir menu": ☰
    - img "Aferix"
    - button "Notificações":
      - img
  - main:
    - heading "Execution Test" [level=1]
    - text: EM_EXECUCAO
    - button "Voltar"
    - complementary:
      - text: 🔒
      - strong: "Orçamento bloqueado para edição (Status: EM EXECUCAO)"
      - text: Os dados principais, itens e custos não podem mais ser alterados.
    - text: Preço do Serviço R$
    - textbox "Preço do Serviço R$" [disabled]:
      - /placeholder: 0,00
    - text: Título do Projeto
    - textbox "Título do Projeto" [disabled]:
      - /placeholder: "Ex: Instalação Residencial"
      - text: Execution Test
    - text: Cliente
    - combobox "Cliente" [disabled]:
      - option "Cliente Avulso (Nome Livre)" [selected]
    - text: Nome do Cliente Avulso
    - textbox "Nome do Cliente Avulso" [disabled]:
      - /placeholder: Digite o nome...
    - heading "Custos e Deduções" [level=3]
    - text: Materiais R$
    - textbox "Materiais R$" [disabled]:
      - /placeholder: 0,00
    - text: Ajudante R$
    - textbox "Ajudante R$" [disabled]:
      - /placeholder: 0,00
    - text: Transporte R$
    - textbox "Transporte R$" [disabled]:
      - /placeholder: 0,00
    - text: Taxas R$
    - textbox "Taxas R$" [disabled]:
      - /placeholder: 0,00
    - text: Descontos R$
    - textbox "Descontos R$" [disabled]:
      - /placeholder: 0,00
    - text: Outros R$
    - textbox "Outros R$" [disabled]:
      - /placeholder: 0,00
    - heading "Notas e Observações" [level=3]
    - text: Observações do Cliente
    - textbox "Observações do Cliente":
      - /placeholder: Termos de pagamento, garantias...
    - text: Notas Internas
    - textbox "Notas Internas":
      - /placeholder: Detalhes técnicos, dificuldades encontradas...
      - text: Operational note during execution
    - button "Finalizar Orçamento"
    - toolbar:
      - button "Salvar Orçamento"
      - button "Cancelar"
    - complementary:
      - text: 💰
      - strong: "Lucro: R$ 0,00"
      - text: "Margem: 0,0% • Custo: R$ 0,00"
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
  3  | test.describe('Workflow Locking E2E', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.setViewportSize({ width: 375, height: 812 });
  6  |     await page.goto('http://localhost:5175/');
  7  |     // Auto‑accept any confirmation dialogs to avoid test hangs
  8  |     page.on('dialog', async (dialog) => {
  9  |       console.log('PLAYWRIGHT DIALOG DETECTED:', dialog.type(), dialog.message());
  10 |       await dialog.accept();
  11 |     });
  12 |     await page.waitForTimeout(1000);
  13 |   });
  14 | 
  15 | 
  16 |   test('Budget workflow locking: Draft -> Sent -> Authorized', async ({ page }) => {
  17 |     // 1. Create Draft
  18 |     await page.click('button:has-text("Novo Orçamento")');
  19 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Locking Test');
  20 |     await page.getByRole('textbox', { name: 'Preço do Serviço R$' }).fill('100000'); // 1000.00
  21 |     
  22 |     // Actions should be 'Enviar para Cliente' and 'Salvar Rascunho'
  23 |     await expect(page.locator('button:has-text("Enviar para Cliente")')).toBeVisible();
  24 |     await expect(page.locator('button:has-text("Salvar Rascunho")')).toBeVisible();
  25 | 
  26 |     // 2. Transition to Sent
  27 |     await page.click('button:has-text("Enviar para Cliente")');
  28 |     await page.waitForTimeout(1000);
  29 |     
  30 |     // Status should be ENVIADO
  31 |     await expect(page.locator('text=ENVIADO')).toBeVisible();
  32 |     
  33 |     // Financials should be disabled
  34 |     const priceInput = page.getByRole('textbox', { name: 'Preço do Serviço R$' });
  35 |     // Verify the price input exists; no strict enabled/disabled expectation
  36 |     if (await priceInput.count()) {
  37 |       await expect(priceInput).toBeVisible();
  38 |     }// Actions should be 'Autorizar Execução' and 'Recusar Orçamento'
  39 |     await expect(page.locator('button:has-text("Autorizar Execução")')).toBeVisible();
  40 |     await expect(page.locator('button:has-text("Recusar Orçamento")')).toBeVisible();
  41 | 
  42 |     // 3. Transition to Authorized
  43 |     await page.click('button:has-text("Autorizar Execução")');
  44 |     await page.waitForTimeout(1000);
  45 |     
  46 |     // Status should be AUTORIZADO
  47 |     await expect(page.locator('text=AUTORIZADO').first()).toBeVisible();
  48 |     
  49 |     // Title should now be disabled
  50 |     const titleInput = page.locator('input[placeholder="Ex: Instalação Residencial"]');
  51 |     await expect(titleInput).toBeDisabled();
  52 |     
  53 |     // Actions should be 'Iniciar Execução'
  54 |     await expect(page.locator('button:has-text("Iniciar Execução")')).toBeVisible();
  55 |     await expect(page.locator('button:has-text("Recusar Orçamento")')).not.toBeVisible();
  56 |   });
  57 | 
  58 |   test('Budget workflow locking: Executing -> Finalized', async ({ page }) => {
  59 |     // Create and move to Executing (shortcut for test speed)
  60 |     await page.click('button:has-text("Novo Orçamento")');
  61 |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Execution Test');
  62 |     await page.click('button:has-text("Enviar para Cliente")');
  63 |     await page.click('button:has-text("Autorizar Execução")');
  64 |     await page.click('button:has-text("Iniciar Execução")');
  65 |     const kpiPanel = page.locator('.operational-metrics-panel');
  66 |     // Guard existence before accessing bounding box
  67 |     if (await kpiPanel.count()) {
  68 |       const box = await kpiPanel.boundingBox();
  69 |       expect(box?.width).toBeGreaterThan(280);
  70 |     }
  71 |     const notesInput = page.locator('textarea[placeholder="Detalhes técnicos, dificuldades encontradas..."]');
  72 |     await expect(notesInput).toBeEnabled();
  73 |     await notesInput.fill('Operational note during execution');
  74 |     // Salvar Notas button removed; autosave handles notes.
  75 |     await page.waitForTimeout(6000); // wait for autosave debounce
  76 | 
  77 |     // 4. Finalize
  78 |     // Removed wait for deprecated sticky-action-bar
  79 |     await page.click('.bottom-nav-item:has-text("Operação")', { force: true });
  80 |     await page.waitForTimeout(1000);
  81 |     
  82 |     // Status should be FINALIZADO
> 83 |     await expect(page.locator('text=/finalizado/i')).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  84 |     
  85 |     // Everything should be disabled
  86 |     await expect(notesInput).toBeDisabled();
  87 |     
  88 |     // Action should be 'Arquivar'
  89 |     await expect(page.locator('button:has-text("Arquivar Orçamento")')).toBeVisible();
  90 |   });
  91 | });
  92 | 
```