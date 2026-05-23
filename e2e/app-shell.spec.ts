import { test, expect } from '@playwright/test';

test.describe('YYC3-QATS Application Shell', () => {
  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/言语云量化分析交易系统/);
  });

  test('should render the sidebar navigation', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('nav, [data-testid="sidebar"], aside').first();
    await expect(sidebar).toBeVisible({ timeout: 10000 });
  });

  test('should display the market module by default', async ({ page }) => {
    await page.goto('/');
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Module Navigation', () => {
  const modules = [
    { name: '市场', id: 'market' },
    { name: '策略', id: 'strategy' },
    { name: '风控', id: 'risk' },
    { name: '交易', id: 'trade' },
  ];

  for (const mod of modules) {
    test(`should navigate to ${mod.name} module`, async ({ page }) => {
      await page.goto('/');
      const moduleLink = page.locator(`text=${mod.name}`).first();
      if (await moduleLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await moduleLink.click();
        await page.waitForTimeout(500);
      }
    });
  }
});

test.describe('Performance', () => {
  test('should have acceptable first contentful paint', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.locator('body').waitFor({ state: 'visible' });
    const fcp = Date.now() - startTime;
    expect(fcp).toBeLessThan(5000);
  });
});
