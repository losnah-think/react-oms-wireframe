const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000/products/csv', { waitUntil: 'networkidle' });
    console.log('Loaded /products/csv ->', await page.url());

    // Click the 상품 목록 sidebar item (selector by text)
    await page.click('text=상품 목록', { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    console.log('After click 상품 목록 ->', await page.url());

    // Click first product detail if exists (button with 특정 텍스트)
    const productLink = await page.$('text=상세 보기') || await page.$('a:has-text("상세")');
    if (productLink) {
      await productLink.click();
      await page.waitForTimeout(500);
      console.log('After click detail ->', await page.url());

      // Go back
      await page.goBack();
      await page.waitForTimeout(500);
      console.log('After goBack ->', await page.url());
    } else {
      console.log('No product detail link found to click');
    }

    await browser.close();
  } catch (e) {
    console.error('E2E error', e);
    await browser.close();
    process.exit(1);
  }
})();