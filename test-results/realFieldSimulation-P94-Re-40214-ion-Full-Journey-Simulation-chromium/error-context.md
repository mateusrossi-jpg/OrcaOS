# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: realFieldSimulation.spec.ts >> P94 Real Field Simulation >> Full Journey Simulation
- Location: tests/e2e/realFieldSimulation.spec.ts:14:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Finalizar Trabalho")')

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
        - heading "Field Sim P94" [level=1] [ref=e18]
        - generic [ref=e19]: EM_EXECUCAO
      - button "Voltar" [ref=e21] [cursor=pointer]
    - complementary [ref=e23]:
      - generic [ref=e25]: 🔒
      - generic [ref=e26]:
        - strong [ref=e27]: "Orçamento bloqueado para edição (Status: EM EXECUCAO)"
        - generic [ref=e28]: Os dados principais, itens e custos não podem mais ser alterados.
    - generic [ref=e29]:
      - generic [ref=e31]:
        - text: Preço do Serviço
        - generic [ref=e32]:
          - generic [ref=e33]: R$
          - textbox "Preço do Serviço R$" [disabled] [ref=e34]:
            - /placeholder: 0,00
            - text: 2.500,00
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]: Título do Projeto
          - textbox "Título do Projeto" [disabled] [ref=e38]:
            - /placeholder: "Ex: Instalação Residencial"
            - text: Field Sim P94
        - generic [ref=e39]:
          - generic [ref=e40]: Cliente
          - combobox "Cliente" [disabled] [ref=e42]:
            - option "Cliente Avulso (Nome Livre)" [selected]
        - generic [ref=e43]:
          - generic [ref=e44]: Nome do Cliente Avulso
          - textbox "Nome do Cliente Avulso" [disabled] [ref=e45]:
            - /placeholder: Digite o nome...
            - text: Cliente Simulado P94
      - generic [ref=e46]:
        - heading "Custos e Deduções" [level=3] [ref=e49]
        - generic [ref=e51]:
          - generic [ref=e52]:
            - text: Materiais
            - generic [ref=e53]:
              - generic [ref=e54]: R$
              - textbox "Materiais R$" [disabled] [ref=e55]:
                - /placeholder: 0,00
                - text: 500,00
          - generic [ref=e56]:
            - text: Ajudante
            - generic [ref=e57]:
              - generic [ref=e58]: R$
              - textbox "Ajudante R$" [disabled] [ref=e59]:
                - /placeholder: 0,00
          - generic [ref=e60]:
            - text: Transporte
            - generic [ref=e61]:
              - generic [ref=e62]: R$
              - textbox "Transporte R$" [disabled] [ref=e63]:
                - /placeholder: 0,00
                - text: 100,00
          - generic [ref=e64]:
            - text: Taxas
            - generic [ref=e65]:
              - generic [ref=e66]: R$
              - textbox "Taxas R$" [disabled] [ref=e67]:
                - /placeholder: 0,00
          - generic [ref=e68]:
            - text: Descontos
            - generic [ref=e69]:
              - generic [ref=e70]: R$
              - textbox "Descontos R$" [disabled] [ref=e71]:
                - /placeholder: 0,00
          - generic [ref=e72]:
            - text: Outros
            - generic [ref=e73]:
              - generic [ref=e74]: R$
              - textbox "Outros R$" [disabled] [ref=e75]:
                - /placeholder: 0,00
      - generic [ref=e76]:
        - heading "Notas e Observações" [level=3] [ref=e79]
        - generic [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e82]: Observações do Cliente
            - textbox "Observações do Cliente" [ref=e83]:
              - /placeholder: Termos de pagamento, garantias...
          - generic [ref=e84]:
            - generic [ref=e85]: Notas Internas
            - textbox "Notas Internas" [ref=e86]:
              - /placeholder: Detalhes técnicos, dificuldades encontradas...
      - button "Finalizar Orçamento" [ref=e88] [cursor=pointer]
      - toolbar [ref=e89]:
        - button "Salvar Orçamento" [ref=e90] [cursor=pointer]
        - button "Cancelar" [ref=e91] [cursor=pointer]
    - complementary [ref=e93]:
      - generic [ref=e95]: 💰
      - generic [ref=e96]:
        - strong [ref=e97]: "Lucro: R$ 1.900,00"
        - generic [ref=e98]: "Margem: 76,0% • Custo: R$ 600,00"
  - navigation [ref=e99]:
    - button "Resumo" [ref=e100] [cursor=pointer]:
      - img [ref=e102]
      - generic [ref=e104]: Resumo
    - button "Operação" [ref=e105] [cursor=pointer]:
      - img [ref=e107]
      - generic [ref=e109]: Operação
    - button "Financeiro" [ref=e110] [cursor=pointer]:
      - img [ref=e112]
      - generic [ref=e114]: Financeiro
    - button "Mais" [ref=e115] [cursor=pointer]:
      - img [ref=e117]
      - generic [ref=e119]: Mais
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
  10 |     await page.goto('http://localhost:5175/');
  11 |     await page.waitForTimeout(1000);
  12 |   });
  13 | 
  14 |   test('Full Journey Simulation', async ({ page }) => {
  15 |     // 1. Home Audit
  16 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home.png') });
  17 |     
  18 |     // 2. Create New Budget
  19 |     await page.click('button:has-text("Novo Orçamento")');
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
  54 |     // Note entry handled by autosave (no explicit input needed)
  55 |     // Autosave occurs after note entry; wait briefly for debounce
  56 |     await page.waitForTimeout(6000); // wait for 5s debounce + buffer
  57 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-budget-notes-saved.png') });
  58 | 
  59 |     // 10. Finalize
> 60 |     await page.click('button:has-text("Finalizar Trabalho")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  61 |     await page.waitForTimeout(500);
  62 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-finalize-modal.png') });
  63 |     await page.click('button:has-text("Confirmar")');
  64 |     await page.waitForTimeout(1000);
  65 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-budget-finalized.png') });
  66 | 
  67 |     // 11. Back to History
  68 |     await page.click('button:has-text("Voltar")');
  69 |     await page.waitForTimeout(500);
  70 |     await page.click('.mobile-bottom-nav button:has-text("Operação")');
  71 |     await page.waitForTimeout(500);
  72 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-history.png') });
  73 | 
  74 |     // 12. Search for it
  75 |     await page.fill('input[placeholder="Buscar título ou cliente..."]', 'Field Sim');
  76 |     await page.waitForTimeout(500);
  77 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-history-searched.png') });
  78 | 
  79 |     // 13. Consult Finance
  80 |     await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
  81 |     await page.waitForTimeout(500);
  82 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-finance.png') });
  83 | 
  84 |     // 14. Consult Reports (via Mais)
  85 |     await page.click('.mobile-bottom-nav button:has-text("Mais")');
  86 |     await page.click('.menu-utility-list button:has-text("Relatórios")');
  87 |     await page.waitForTimeout(1000);
  88 |     await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-reports.png') });
  89 |   });
  90 | });
  91 | 
```