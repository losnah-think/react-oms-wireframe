import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('response', async (res) => {
    try {
      const url = res.url();
      if (url.includes('/api/products')) {
        const text = await res.text();
        console.log('RESPONSE:', url);
        console.log(text);
      }
    } catch (e) {
      console.error('resp error', e.message);
    }
  });
  const url = 'http://localhost:3000/products/1000/options/v-1000-1';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await browser.close();
})();