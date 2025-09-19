const { test, expect } = require('@playwright/test');

test.describe('Settings flows', () => {
  test('brands and product groups pages load and show add UI optionally', async ({ page }) => {
    await page.goto('/settings/brands', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/settings\/brands/);
    const addBtn = page.locator('button:has-text("Add"), button:has-text("추가"), a[href*="/settings/brands/add"]');
    if (await addBtn.count()) {
      await addBtn.first().click();
      await page.waitForLoadState('networkidle');
      // check for input presence but do not submit to avoid destructive changes
      const nameInput = page.locator('input[name="name"], input[id*="name"], input[placeholder*="Name"]');
      if (await nameInput.count()) {
        await expect(nameInput.first()).toBeVisible({ timeout: 3000 });
      } else {
        console.warn('Add UI opened but name input not found');
      }
    } else {
      // fallback: check page heading or main container
      const heading = page.locator('text=Brands, text=브랜드, h1, h2');
      if (await heading.count()) await expect(heading.first()).toBeVisible({ timeout: 3000 });
    }

    await page.goto('/settings/product-groups', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/settings\/product-groups/);
    const pgAdd = page.locator('button:has-text("Add"), button:has-text("추가"), a[href*="/settings/product-groups/add"]');
    if (await pgAdd.count()) {
      await pgAdd.first().click();
      await page.waitForLoadState('networkidle');
      const input = page.locator('input[name="name"]');
      if (await input.count()) {
        await expect(input.first()).toBeVisible({ timeout: 3000 });
      } else {
        console.warn('Product-groups add UI opened but name input not found');
      }
    } else {
      const heading = page.locator('text=Product Groups, text=제품 그룹, h1, h2');
      if (await heading.count()) await expect(heading.first()).toBeVisible({ timeout: 3000 });
    }
  });
});
