# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mvpFunctionalTruth.spec.ts >> MVP Functional Truth Check >> Full User Journey: Client -> Budget -> Workflow -> Finance -> History
- Location: tests/e2e/mvpFunctionalTruth.spec.ts:14:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.mobile-bottom-nav button:has-text("Catálogo")')

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
    - heading "Painel Operacional" [level=1] [ref=e17]
    - generic [ref=e18]:
      - button "＋ Novo Orçamento" [ref=e20] [cursor=pointer]:
        - generic [ref=e21]: ＋
        - text: Novo Orçamento
      - generic [ref=e22]:
        - heading "Atividade Recente" [level=3] [ref=e25]
        - article [ref=e28] [cursor=pointer]:
          - generic [ref=e29]:
            - generic [ref=e30]:
              - strong [ref=e31]: Projeto Hidráulico 1779898877875
              - generic [ref=e32]: Cliente Teste 1779898877875
            - generic [ref=e34]: R$ 5.000
          - generic [ref=e36]: ● Iniciado
  - navigation [ref=e37]:
    - button "Resumo" [ref=e38] [cursor=pointer]:
      - img [ref=e40]
      - generic [ref=e42]: Resumo
    - button "Operação" [ref=e43] [cursor=pointer]:
      - img [ref=e45]
      - generic [ref=e47]: Operação
    - button "Financeiro" [ref=e48] [cursor=pointer]:
      - img [ref=e50]
      - generic [ref=e52]: Financeiro
    - button "Mais" [ref=e53] [cursor=pointer]:
      - img [ref=e55]
      - generic [ref=e57]: Mais
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('MVP Functional Truth Check', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // iPhone X viewport for mobile-first validation
  6   |     await page.setViewportSize({ width: 375, height: 812 });
  7   |     await page.goto('http://localhost:5175/');
  8   |     // removed waiting for deprecated sticky-action-bar
  9   |     
  10  |     // Auto-accept all confirmation dialogs
  11  |     page.on('dialog', dialog => dialog.accept());
  12  |   });
  13  | 
  14  |   test('Full User Journey: Client -> Budget -> Workflow -> Finance -> History', async ({ page }) => {
  15  |     const timestamp = Date.now();
  16  |     const clientName = `Cliente Teste ${timestamp}`;
  17  |     const budgetTitle = `Projeto Hidráulico ${timestamp}`;
  18  | 
  19  |     // 1. Criar Cliente
  20  |     await page.click('button:has-text("Mais")');
  21  |     await page.click('button:has-text("Clientes")');
  22  |     await page.click('button:has-text("Novo Cliente")');
  23  |     await page.fill('input[placeholder="Ex: João da Silva"]', clientName);
  24  |     await page.click('button:has-text("Cadastrar Cliente")');
  25  |     // KPI panel no longer present; guard existence before checks
  26  |     const kpiPanel = page.locator('.operational-metrics-panel');
  27  |     if (await kpiPanel.count()) {
  28  |       const box = await kpiPanel.boundingBox();
  29  |       expect(box?.width).toBeGreaterThan(280);
  30  |     }
  31  |     await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
  32  |     // Navigate back to Home (Resumo) to validate UI
  33  |     await page.click('.mobile-bottom-nav button:has-text("Resumo")');
  34  |     // Validate key UI elements on Home after login
  35  |     await expect(page.locator('button:has-text("Novo Orçamento")')).toBeVisible();
  36  |     await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
  37  |     // Ensure no horizontal overflow (responsive layout)
  38  |     const viewportWidth = await page.evaluate(() => window.innerWidth);
  39  |     const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  40  |     expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
  41  |     // Optionally verify KPI cards if present
  42  |     const priceInput = page.getByRole('textbox', { name: 'Preço do Serviço R$' });
  43  |     // UI may enable or disable; verify existence without strict state
  44  |     if (await priceInput.count()) {
  45  |       await expect(priceInput).toBeEnabled(); // accept enabled state
  46  |     }
  47  | 
  48  |     // Actions should be 'Autorizar Execução' and 'Recusar Orçamento'")');
  49  |     await page.click('button:has-text("Novo Orçamento")');
  50  |     
  51  |     // Selecionar cliente
  52  |     await page.locator('label:has-text("Cliente")').locator('select').selectOption({ label: clientName });
  53  |     
  54  |     await page.waitForSelector('input[placeholder="Ex: Instalação Residencial"]');
  55  |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', budgetTitle);
  56  |     
  57  |     // Preencher valores
  58  |     const chargedInput = page.locator('label:has-text("Preço do Serviço")').locator('input');
  59  |     await chargedInput.fill('500000'); // R$ 5.000,00
  60  |     
  61  |     // Custos
  62  |     await page.locator('label:has-text("Materiais")').locator('input').fill('150000'); // R$ 1.500,00
  63  |     await page.locator('label:has-text("Ajudante")').locator('input').fill('50000'); // R$ 500,00
  64  | 
  65  |     // 3. Salvar Rascunho e Verificar Persistência
  66  |     await page.click('button:has-text("Salvar Rascunho")');
  67  |     await page.waitForTimeout(1000);
  68  |     await page.reload();
  69  |     // Navigate to Catalog page via bottom nav (assuming exists)
> 70  |     await page.click('.mobile-bottom-nav button:has-text("Catálogo")');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  71  |     await page.waitForTimeout(500); // allow navigation
  72  |     // Optionally verify header if present
  73  |     if (await page.locator('header h1:has-text("Catálogo")').count()) {
  74  |       await expect(page.locator('header h1')).toContainText('Catálogo');
  75  |     }
  76  |     
  77  |     // Reabrir do Histórico para garantir que salvou
  78  |     await page.click('.bottom-nav-item:has-text("Operação")');
  79  |     await page.waitForSelector('h1:has-text("Histórico")');
  80  |     
  81  |     await expect(page.locator('input[value="' + budgetTitle + '"]')).toBeVisible();
  82  | 
  83  |     // 4. Workflow Completo
  84  |     await page.click('button:has-text("Enviar para Cliente")');
  85  |     await page.click('button:has-text("Autorizar Execução")');
  86  |     await page.click('button:has-text("Iniciar Execução")');
  87  |     await page.click('button:has-text("Finalizar Orçamento")');
  88  |     await page.click('button:has-text("Confirmar")');
  89  | 
  90  |     // Verificar se está em modo leitura
  91  |     await expect(page.locator('input[value="' + budgetTitle + '"]')).toBeDisabled();
  92  |     await expect(page.locator('span:has-text("Finalizado")')).toBeVisible();
  93  | 
  94  |     // 5. Conferir Histórico
  95  |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  96  |     await expect(page.locator('.operational-card').filter({ hasText: budgetTitle })).toBeVisible();
  97  |     await expect(page.locator('.operational-card').filter({ hasText: budgetTitle })).toContainText('5.000');
  98  | 
  99  |     // 6. Conferir Financeiro
  100 |     await page.click('button:has-text("Financeiro")');
  101 |     await expect(page.locator('.metric-card').filter({ hasText: 'Faturamento Real' }).locator('strong')).not.toHaveText('R$ 0,00');
  102 |     await expect(page.locator('.metric-card').filter({ hasText: 'Lucro líquido' }).locator('strong')).toContainText('3.000'); // 5000 - 1500 - 500 = 3000 (app currently doesn't auto-deduct tax in overview)
  103 | 
  104 |     // 7. Backup Local (apenas disparar o clique para ver se não quebra)
  105 |     await page.click('button:has-text("Mais")');
  106 |     await page.click('button:has-text("Backup e Sincronização")');
  107 |     const downloadPromise = page.waitForEvent('download');
  108 |     await page.click('button:has-text("Download JSON")');
  109 |     const download = await downloadPromise;
  110 |     expect(download.suggestedFilename()).toContain('aferix-backup');
  111 |   });
  112 | });
  113 | 
```