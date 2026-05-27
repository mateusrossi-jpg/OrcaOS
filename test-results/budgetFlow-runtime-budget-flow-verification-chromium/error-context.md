# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: budgetFlow.spec.ts >> runtime budget flow verification
- Location: tests/e2e/budgetFlow.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.bottom-nav-item').filter({ hasText: /Operação/i })
    - locator resolved to <button type="button" class="bottom-nav-item active">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="sticky-save">Salvar Orçamento</button> from <section class="app-content-area">…</section> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="sticky-save">Salvar Orçamento</button> from <section class="app-content-area">…</section> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    20 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button class="sticky-save">Salvar Orçamento</button> from <section class="app-content-area">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e3]:
  - banner [ref=e4]:
    - button "Abrir menu" [ref=e5] [cursor=pointer]: ☰
    - img "Aferix" [ref=e7]
    - button "Notificações" [ref=e10] [cursor=pointer]:
      - img [ref=e11]
  - main [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - heading "Orçamento 2 EDITADO" [level=1] [ref=e18]
        - generic [ref=e19]: INICIADO
      - button "Voltar" [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - generic [ref=e24]:
        - text: Preço do Serviço
        - generic [ref=e25]:
          - generic [ref=e26]: R$
          - textbox "Preço do Serviço R$" [ref=e27]:
            - /placeholder: 0,00
            - text: 20,00
      - generic [ref=e28]:
        - generic [ref=e29]:
          - generic [ref=e30]: Título do Projeto
          - textbox "Título do Projeto" [ref=e31]:
            - /placeholder: "Ex: Instalação Residencial"
            - text: Orçamento 2 EDITADO
        - generic [ref=e32]:
          - generic [ref=e33]: Cliente
          - combobox "Cliente" [ref=e35]:
            - option "Cliente Avulso (Nome Livre)" [selected]
        - generic [ref=e36]:
          - generic [ref=e37]: Nome do Cliente Avulso
          - textbox "Nome do Cliente Avulso" [ref=e38]:
            - /placeholder: Digite o nome...
      - generic [ref=e39]:
        - heading "Custos e Deduções" [level=3] [ref=e42]
        - generic [ref=e44]:
          - generic [ref=e45]:
            - text: Materiais
            - generic [ref=e46]:
              - generic [ref=e47]: R$
              - textbox "Materiais R$" [ref=e48]:
                - /placeholder: 0,00
          - generic [ref=e49]:
            - text: Ajudante
            - generic [ref=e50]:
              - generic [ref=e51]: R$
              - textbox "Ajudante R$" [ref=e52]:
                - /placeholder: 0,00
          - generic [ref=e53]:
            - text: Transporte
            - generic [ref=e54]:
              - generic [ref=e55]: R$
              - textbox "Transporte R$" [ref=e56]:
                - /placeholder: 0,00
          - generic [ref=e57]:
            - text: Taxas
            - generic [ref=e58]:
              - generic [ref=e59]: R$
              - textbox "Taxas R$" [ref=e60]:
                - /placeholder: 0,00
          - generic [ref=e61]:
            - text: Descontos
            - generic [ref=e62]:
              - generic [ref=e63]: R$
              - textbox "Descontos R$" [ref=e64]:
                - /placeholder: 0,00
          - generic [ref=e65]:
            - text: Outros
            - generic [ref=e66]:
              - generic [ref=e67]: R$
              - textbox "Outros R$" [ref=e68]:
                - /placeholder: 0,00
      - generic [ref=e69]:
        - heading "Notas e Observações" [level=3] [ref=e72]
        - generic [ref=e73]:
          - generic [ref=e74]:
            - generic [ref=e75]: Observações do Cliente
            - textbox "Observações do Cliente" [ref=e76]:
              - /placeholder: Termos de pagamento, garantias...
          - generic [ref=e77]:
            - generic [ref=e78]: Notas Internas
            - textbox "Notas Internas" [ref=e79]:
              - /placeholder: Detalhes técnicos, dificuldades encontradas...
      - generic [ref=e80]:
        - button "Enviar para Cliente" [ref=e81] [cursor=pointer]
        - button "Salvar Rascunho" [ref=e82] [cursor=pointer]
      - toolbar [ref=e83]:
        - button "Salvar Orçamento" [ref=e84] [cursor=pointer]
        - button "Cancelar" [ref=e85] [cursor=pointer]
    - complementary [ref=e87]:
      - generic [ref=e89]: 💰
      - generic [ref=e90]:
        - strong [ref=e91]: "Lucro: R$ 20,00"
        - generic [ref=e92]: "Margem: 100,0% • Custo: R$ 0,00"
  - navigation [ref=e93]:
    - button "Resumo" [ref=e94] [cursor=pointer]:
      - img [ref=e96]
      - generic [ref=e98]: Resumo
    - button "Operação" [ref=e99] [cursor=pointer]:
      - img [ref=e101]
      - generic [ref=e103]: Operação
    - button "Financeiro" [ref=e104] [cursor=pointer]:
      - img [ref=e106]
      - generic [ref=e108]: Financeiro
    - button "Mais" [ref=e109] [cursor=pointer]:
      - img [ref=e111]
      - generic [ref=e113]: Mais
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test('runtime budget flow verification', async ({ page }) => {
  4   |   // Simulate mobile-first viewport
  5   |   await page.setViewportSize({ width: 375, height: 812 });
  6   |   // Surface browser logs in Playwright runner
  7   |   page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  8   |   // Handle any confirmation dialogs automatically
  9   |   page.on('dialog', async dialog => {
  10  |     console.log('PLAYWRIGHT DIALOG DETECTED:', dialog.type(), dialog.message());
  11  |     await dialog.accept();
  12  |   });
  13  |   // 1. Navigate to app
  14  |   await page.goto('http://localhost:5175/');
  15  |   
  16  |   // Wait for app to be ready
  17  |   await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });
  18  | 
  19  |   // Helper to open budgets screen via navigation
  20  |   const goToBudgets = async () => {
  21  |     await page.waitForTimeout(500);
  22  |     // Use bottom nav on mobile to go to Home/Pulse
  23  |     const bottomNavPulse = page.locator('.bottom-nav-item', { hasText: /Resumo/i });
  24  |     if (await bottomNavPulse.isVisible()) {
  25  |       await bottomNavPulse.click();
  26  |       await page.waitForTimeout(500);
  27  |     }
  28  | 
  29  |     // If we are already on the budget form screen, return early.
  30  |     const isAlreadyOnForm = await page.locator('input[placeholder="Ex: Instalação Residencial"]').isVisible();
  31  |     if (isAlreadyOnForm) {
  32  |       return;
  33  |     }
  34  |     // If HomeScreen primary button is visible, click it directly
  35  |     const homeBtn = page.locator('button:has-text("Novo Orçamento")').first();
  36  |     if (await homeBtn.count() && await homeBtn.isVisible()) {
  37  |       await homeBtn.click({ force: true });
  38  |       await page.waitForTimeout(500);
  39  |       return;
  40  |     }
  41  |   };
  42  | 
  43  |   // Helper to open history screen via navigation
  44  |   const goToHistory = async () => {
  45  |     await page.waitForTimeout(500);
  46  |     // Use bottom nav on mobile
  47  |     const bottomNavOp = page.locator('.bottom-nav-item', { hasText: /Operação/i });
  48  |     if (await bottomNavOp.isVisible()) {
> 49  |       await bottomNavOp.click();
      |                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  50  |       await page.waitForTimeout(500);
  51  |     }
  52  |   };
  53  | 
  54  |   // Helper to create a budget with given title and values
  55  |   const createBudget = async (title: string, charged: string) => {
  56  |     // Fill title
  57  |     await page.fill('input[placeholder="Ex: Instalação Residencial"]', title);
  58  |     // Fill charged value
  59  |     const chargedInput = page.locator('input[inputmode="numeric"]').first();
  60  |     await chargedInput.fill(charged);
  61  |     // Save draft
  62  |     await page.click('button:has-text("Salvar Rascunho")', { force: true });
  63  |     // Wait for async IndexDB saving process
  64  |     await page.waitForTimeout(500);
  65  |     
  66  |     // Go back to the history
  67  |     const backBtn = page.locator('button:has-text("Voltar")').first();
  68  |     if (await backBtn.count() && await backBtn.isVisible()) {
  69  |       await backBtn.click({ force: true });
  70  |     }
  71  |   };
  72  | 
  73  |   // Ensure we are on Budgets screen
  74  |   await goToBudgets();
  75  | 
  76  |   // 2. Create three budgets
  77  |   // Budget 1
  78  |   await createBudget('Orçamento 1', '1000');
  79  |   await page.waitForTimeout(500);
  80  |   await goToBudgets();
  81  |   
  82  |   // Budget 2
  83  |   await createBudget('Orçamento 2', '2000');
  84  |   await page.waitForTimeout(500);
  85  |   await goToBudgets();
  86  |   
  87  |   // Budget 3
  88  |   await createBudget('Orçamento 3', '3000');
  89  |   await page.waitForTimeout(500);
  90  | 
  91  |   // 3. Go to histórico page
  92  |   await goToHistory();
  93  |   await page.waitForSelector('h1:has-text("Histórico")', { timeout: 10000 });
  94  | 
  95  |   // Verify that three budgets appear
  96  |   const cards = page.locator('article.operational-card').filter({ hasText: /Orçamento/ });
  97  |   await expect(cards).toHaveCount(3);
  98  | 
  99  |   // 4. Edit the second budget (change title)
  100 |   const secondCard = cards.nth(1);
  101 |   await secondCard.click({ force: true }); // opens detail (BudgetDetailScreen) - not needed for edit, using form directly
  102 |   // In detail view, click edit button if exists, else back to form via edit flow
  103 |   // Assuming the edit button is present with text "Editar" or similar
  104 |   const editBtn = page.locator('button', { hasText: /Editar/i }).first();
  105 |   await editBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  106 |   if (await editBtn.count()) {
  107 |     await editBtn.click({ force: true });
  108 |     await page.waitForTimeout(500); // Wait for transition to form
  109 |   }
  110 |   // Change title
  111 |   await page.fill('input[placeholder="Ex: Instalação Residencial"]', 'Orçamento 2 EDITADO');
  112 |   // Save draft
  113 |   await page.click('button:has-text("Salvar Rascunho")', { force: true });
  114 |   await page.waitForSelector('button:has-text("Salvar Rascunho")', { timeout: 10000 });
  115 | 
  116 |   // Return to histórico and verify changed title appears
  117 |   await goToHistory();
  118 |   await expect(page.locator('text=Orçamento 2 EDITADO')).toBeVisible();
  119 | 
  120 |   // 5. Delete the first budget
  121 |   const firstCard = page.locator('article.operational-card').filter({ hasText: /Orçamento 1/ }).first();
  122 |   await firstCard.locator('button').last().click({ force: true });
  123 |   
  124 |   const deleteBtn = page.locator('button', { hasText: /^Excluir$/ }).last();
  125 |   await expect(deleteBtn).toBeVisible({ timeout: 10000 });
  126 |   await deleteBtn.click({ force: true });
  127 |   await page.waitForTimeout(500);
  128 | 
  129 |   // Verify only two budgets remain
  130 |   const remaining = page.locator('article.operational-card').filter({ hasText: /Orçamento/ });
  131 |   await expect(remaining).toHaveCount(2);
  132 | 
  133 |   // 6. Reload page and verify persistence
  134 |   await page.reload();
  135 |   await goToHistory();
  136 |   const afterReload = page.locator('article.operational-card').filter({ hasText: /Orçamento/ });
  137 |   await expect(afterReload).toHaveCount(2);
  138 |   await expect(page.locator('text=Orçamento 1')).toBeHidden();
  139 | });
  140 | 
```