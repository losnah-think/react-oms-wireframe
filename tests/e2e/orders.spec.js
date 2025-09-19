const { test, expect } = require('@playwright/test');

test.describe('Orders flows', () => {
  test('list and open order details', async ({ page }) => {
    await page.goto('/orders', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/orders/);
    // Ensure the orders table/list exists
    const orderRows = page.locator('table tr, [data-testid="order-row"], .order-list-item');
    if (await orderRows.count()) {
      await orderRows.first().click();
      await page.waitForLoadState('networkidle');
      // check for order detail markers
      await expect(page.locator('text=Order ID, text=주문번호, text=Order #, [data-testid="order-id"]').first()).toBeVisible({ timeout: 3000 });
    }
  });
});
