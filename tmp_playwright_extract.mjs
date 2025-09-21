import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = 'http://localhost:3000/products/1000/options/v-1000-1';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const data = await page.evaluate(() => {
    const getByLabel = (labelText) => {
      const labels = Array.from(document.querySelectorAll('div, label'));
      const label = labels.find(l => l.textContent && l.textContent.trim().startsWith(labelText));
      if (!label) return null;
      // find input/select/textarea following label
      let el = label.nextElementSibling;
      if (!el) {
        // search within parent
        el = label.parentElement && label.parentElement.querySelector('input, select, textarea')
      }
      return el;
    };

    const pick = (label) => {
      const el = getByLabel(label);
      if (!el) return null;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.value;
      if (el.tagName === 'SELECT') return el.value;
      return el.textContent || null;
    };

    const result = {
      header: (document.querySelector('h1') && document.querySelector('h1').textContent.trim()) || null,
      productName: (Array.from(document.querySelectorAll('div')).find(d=>d.className && d.className.includes('text-sm') && d.textContent && d.textContent.trim()!=='' )||{}).textContent || null,
      barcode: pick('바코드번호'),
      variant_name: pick('옵션명'),
      purchase_variant_name: pick('사입옵션명'),
      warehouse_location: pick('상품위치'),
      sale_status: pick('판매상태'),
      soldout_status: pick('품절여부'),
      grade: pick('관리등급'),
      inbound_expected_date: pick('입고 예정일'),
      inbound_expected_qty: pick('입고 예정수량'),
      created_at: (Array.from(document.querySelectorAll('input')).find(i=>i.value && i.value.includes('2025'))?.value) || null,
      order_status: pick('발주상태'),
    };
    return result;
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();