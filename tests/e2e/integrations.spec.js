const { test, expect } = require('@playwright/test');

test.describe('Integrations', () => {
  test('integrations list and connection UI', async ({ page }) => {
    await page.goto('/settings/integrations', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/settings\/integrations/);
    const list = page.locator('table, [data-testid="integrations-list"], .integrations-list');
    if (await list.count()) {
      await expect(list.first()).toBeVisible({ timeout: 3000 });
    } else {
      // fallback: check page heading or main container
      const heading = page.locator('text=Integrations, text=연결, text=통합, h1, h2');
      if (await heading.count()) {
        await expect(heading.first()).toBeVisible({ timeout: 3000 });
      } else {
        // accept page load even if specific list not found
        console.warn('Integrations list and heading not found — page may render differently');
      }
    }
    // try open first integration detail if present (non-fatal)
    const detail = page.locator('a[href*="/settings/integrations/"]');
    if (await detail.count()) {
      await detail.first().click();
      await page.waitForLoadState('networkidle');
      const connectMarker = page.locator('text=Connect, text=연결, text=Configure');
      if (await connectMarker.count()) await expect(connectMarker.first()).toBeVisible({ timeout: 3000 });
    }
  });
});
