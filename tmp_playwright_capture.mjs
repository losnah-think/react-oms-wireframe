import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'http://localhost:3000/products/1000/options/v-1000-1';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  // wait for a selector that indicates the option UI loaded (use h1 or container)
  await page.waitForTimeout(1000);
  const content = await page.content();
  console.log(content.slice(0, 2000));
  await browser.close();
})();