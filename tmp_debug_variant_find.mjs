import { getProduct } from './src/lib/products.js';

(async () => {
  const pid = '1000';
  const vid = 'v-1000-1';
  const p = await getProduct(pid);
  console.log('product variants:', p?.variants);
  const candidates = Array.isArray(p?.variants) ? p.variants : [];
  const found = candidates.find((v, idx) => {
    const possibleIds = [
      v.id,
      v.variant_id,
      v.option_id,
      v.code,
      v.option_code,
      v.barcode1,
      v.barcode,
      `index-${idx}`,
      String(idx),
    ]
      .filter(Boolean)
      .map((x) => String(x));
    return possibleIds.includes(String(vid));
  });
  console.log('found:', found);
})();