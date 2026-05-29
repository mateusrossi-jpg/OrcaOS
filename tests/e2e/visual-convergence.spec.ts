import { test, expect } from '@playwright/test';

test.describe('Aferix Visual Convergence Audit', () => {
  test('Capture core screens for audit', async ({ page }) => {
    // Console logging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    // Increase viewport
    await page.setViewportSize({ width: 440, height: 900 });

    // 1. Initial Load & Setup
    await page.goto('http://localhost:5175/', { waitUntil: 'networkidle' });
    
    // Inject bypasses
    await page.evaluate(() => {
      localStorage.setItem('aferix-app-intro-seen', 'true');
      sessionStorage.setItem('aferix-intro-seen', 'true');
      localStorage.setItem('app-access-unlocked', 'true');
      localStorage.setItem('app-pin-enabled', 'false');
    });
    
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for the app to actually load
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Give some time for transitions
    await page.waitForTimeout(2000);

    // Take Home screenshot
    await page.screenshot({ path: 'screenshots/audit-home.png' });

    // Try to find the bottom nav
    const navButtons = page.locator('nav button');
    const count = await navButtons.count();
    console.log(`Found ${count} nav buttons`);

    // 2. Operations (Budgets)
    try {
      await page.click('nav button:nth-child(2)');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/audit-operations.png' });
    } catch (e) { console.log('Failed to capture Operations'); }

    // 3. Finance (Ledger)
    try {
      await page.click('nav button:nth-child(3)');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/audit-finance.png' });
    } catch (e) { console.log('Failed to capture Finance'); }

    // 4. Agenda (History)
    try {
      await page.click('nav button:nth-child(4)');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/audit-agenda.png' });
    } catch (e) { console.log('Failed to capture Agenda'); }

    // 5. Settings (Menu)
    try {
      await page.click('nav button:nth-child(5)');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/audit-settings.png' });
    } catch (e) { console.log('Failed to capture Settings'); }
  });
});
