import { test, expect } from '@playwright/test';

test.describe('Mobile Structural Layout Audit', () => {
  test.beforeEach(async ({ page }) => {
    // iPhone X viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5175/');
  });

  const checkLayout = async (page) => {
    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const windowWidth = window.innerWidth;
      return docWidth > windowWidth;
    });
    expect(overflow).toBe(false);

    // Check if main shell fits width comfortably (at least 90% of screen)
    const shell = page.locator('.aferix-page-shell').first();
    if (await shell.count() > 0) {
      const box = await shell.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(375 * 0.9);
      expect(box?.width).toBeLessThanOrEqual(375);
    }
  };

  test('Home screen structural integrity', async ({ page }) => {
    await page.waitForSelector('header h1');
    await page.waitForTimeout(500);
    await checkLayout(page);
    
    // KPIs should be visible and occupy full width
    const kpiPanel = page.locator('.operational-metrics-panel');
    await expect(kpiPanel).toBeVisible();
    const box = await kpiPanel.boundingBox();
    expect(box?.width).toBeGreaterThan(280); 
  });

  test('History page structural integrity', async ({ page }) => {
    await page.click('.mobile-bottom-nav button:has-text("Operação")');
    await page.waitForSelector('header h1:has-text("Histórico")');
    await checkLayout(page);

    // Check list item layout
    const listItem = page.locator('.continuous-list-item').first();
    if (await listItem.count() > 0) {
      const box = await listItem.boundingBox();
      expect(box?.width).toBeGreaterThan(280);
    }
  });

  test('Finance page structural integrity', async ({ page }) => {
    await page.click('.mobile-bottom-nav button:has-text("Financeiro")');
    await page.waitForSelector('header h1:has-text("Fluxo de Caixa")');
    await checkLayout(page);
  });

  test('Menu page structural integrity', async ({ page }) => {
    await page.click('.mobile-bottom-nav button:has-text("Mais")');
    await page.waitForSelector('header h1:has-text("Mais")');
    await checkLayout(page);

    // Menu items should be full width
    const menuItem = page.locator('.menu-utility-item').first();
    await expect(menuItem).toBeVisible();
    const box = await menuItem.boundingBox();
    expect(box?.width).toBeGreaterThan(280);
  });

  test('Catalog page structural integrity', async ({ page }) => {
    await page.click('.mobile-bottom-nav button:has-text("Mais")');
    await page.click('button:has-text("Catálogo")');
    await page.waitForSelector('header h1:has-text("Catálogo")');
    
    await page.waitForTimeout(1000);
    await checkLayout(page);

    // Chip wrapper should be visible and not overflow
    const chips = page.locator('.aferix-filter-chips-wrapper');
    if (await chips.count() > 0) {
      await expect(chips).toBeVisible();
      const box = await chips.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(375);
    }
  });
});
