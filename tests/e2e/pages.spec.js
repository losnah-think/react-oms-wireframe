const { test, expect } = require('@playwright/test');

const pagesToCheck = [
  '/',
  '/products',
  '/products/csv',
  '/products/import',
  '/products/add',
  '/orders',
  '/settings',
  '/settings/integrations',
  '/profile'
];

test.describe('Basic page load checks', () => {
  for (const path of pagesToCheck) {
    test(`loads ${path}`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'networkidle' });
      // Accept either 200 or 204 responses; treat redirects followed by 200 as success
      const status = response ? response.status() : 0;
      expect([200, 204]).toContain(status);
      // Also check that the main app shell is present
      await expect(page.locator('body')).not.toHaveText(/404|Not Found|페이지를 찾을 수 없습니다/i);
    });
  }
});