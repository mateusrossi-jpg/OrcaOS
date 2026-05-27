import { test, expect } from '@playwright/test';

test.describe('MVP Functional Truth Check', () => {
  test.beforeEach(async ({ page }) => {
    // iPhone X viewport for mobile-first validation
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5175/');
    await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });
    
    // Auto-accept all confirmation dialogs
    page.on('dialog', dialog => dialog.accept());
  });

  test('Full User Journey: Client -> Budget -> Workflow -> Finance -> History', async ({ page }) => {
    const timestamp = Date.now();
    const clientName = `Cliente Teste ${timestamp}`;
    const budgetTitle = `Projeto Hidráulico ${timestamp}`;

    // 1. Criar Cliente
    await page.click('button:has-text("Mais")');
    await page.click('button:has-text("Clientes")');
    await page.click('button:has-text("Novo Cliente")');
    await page.fill('input[placeholder="Ex: João da Silva"]', clientName);
    await page.click('button:has-text("Cadastrar Cliente")');
    await expect(page.locator(`text=${clientName}`)).toBeVisible();

    // 2. Criar Orçamento vinculado ao cliente
    await page.click('button:has-text("Resumo")');
    await page.click('button:has-text("Novo Orçamento")');
    
    // Selecionar cliente
    await page.locator('label:has-text("Cliente")').locator('select').selectOption({ label: clientName });
    
    await page.waitForSelector('input[placeholder="Ex: Instalação Residencial"]');
    await page.fill('input[placeholder="Ex: Instalação Residencial"]', budgetTitle);
    
    // Preencher valores
    const chargedInput = page.locator('label:has-text("Preço do Serviço")').locator('input');
    await chargedInput.fill('500000'); // R$ 5.000,00
    
    // Custos
    await page.locator('label:has-text("Materiais")').locator('input').fill('150000'); // R$ 1.500,00
    await page.locator('label:has-text("Ajudante")').locator('input').fill('50000'); // R$ 500,00

    // 3. Salvar Rascunho e Verificar Persistência
    await page.click('button:has-text("Salvar Rascunho")');
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForSelector('.mobile-bottom-nav', { timeout: 10000 });
    
    // Reabrir do Histórico para garantir que salvou
    await page.click('button:has-text("Operação")');
    await page.click(`text=${budgetTitle}`);
    
    await expect(page.locator('input[value="' + budgetTitle + '"]')).toBeVisible();

    // 4. Workflow Completo
    await page.click('button:has-text("Enviar para Cliente")');
    await page.click('button:has-text("Autorizar Execução")');
    await page.click('button:has-text("Iniciar Execução")');
    await page.click('button:has-text("Finalizar Orçamento")');
    await page.click('button:has-text("Confirmar")');

    // Verificar se está em modo leitura
    await expect(page.locator('input[value="' + budgetTitle + '"]')).toBeDisabled();
    await expect(page.locator('span:has-text("Finalizado")')).toBeVisible();

    // 5. Conferir Histórico
    await page.click('button:has-text("Operação")');
    await expect(page.locator('.operational-card').filter({ hasText: budgetTitle })).toBeVisible();
    await expect(page.locator('.operational-card').filter({ hasText: budgetTitle })).toContainText('5.000');

    // 6. Conferir Financeiro
    await page.click('button:has-text("Financeiro")');
    await expect(page.locator('.metric-card').filter({ hasText: 'Faturamento Real' }).locator('strong')).not.toHaveText('R$ 0,00');
    await expect(page.locator('.metric-card').filter({ hasText: 'Lucro líquido' }).locator('strong')).toContainText('3.000'); // 5000 - 1500 - 500 = 3000 (app currently doesn't auto-deduct tax in overview)

    // 7. Backup Local (apenas disparar o clique para ver se não quebra)
    await page.click('button:has-text("Mais")');
    await page.click('button:has-text("Backup e Sincronização")');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download JSON")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('aferix-backup');
  });
});
