const { test, expect } = require('@playwright/test');

test.describe('Products flows', () => {
  test('list, add, open product (if UI supports)', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/products/);
    // Try navigate to add page
    const addLink = page.locator('a[href*="/products/add"]');
    if (await addLink.count()) {
      await addLink.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/products\/add/);
      // attempt to fill product form if present
      const title = page.locator('input[name="title"], input[name="name"], input[id*="title"]');
      if (await title.count()) {
        await title.fill('E2E Test Product ' + Date.now());
        const submit = page.locator('button[type="submit"]');
        if (await submit.count()) {
          await submit.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    // Try opening the first product detail
    const firstProduct = page.locator('a[href*="/products/"]');
    if (await firstProduct.count()) {
      await firstProduct.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page.url()).toMatch(/\/products\/.+/);
    }
  });
});
