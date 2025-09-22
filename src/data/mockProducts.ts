import { mockBrands } from './mockBrands';
import { mockCategories } from './mockCategories';

function generateProductCode(i: number) {
  const prefix = 'PRD';
  const date = new Date(2025, 8, 13); // 2025-09-13
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const rand = String(Math.floor(Math.random()*9000)+1000); // 4자리 랜덤
  return `${prefix}-${dateStr}-${rand}-${i+1}`;
}

function generateDate(i: number) {
  // 2025-09-01 ~ 2025-09-30
  const day = (i % 30) + 1;
  return `2025-09-${String(day).padStart(2,'0')}T10:00:00Z`;
}

function generateYearDate(i: number) {
  // 연간 데이터: 제조일, 유통기한, 출시일 등
  const year = 2020 + (i % 6);
  return {
    made_date: `${year}-01-01`,
    expr_date: `${year+1}-12-31`,
    publication_date: `${year}-03-01T00:00:00Z`,
    first_sale_date: `${year}-04-01T00:00:00Z`
  };
}

function generateVariants(productId: number, i: number) {
  const count = 1 + (i % 4) // 1..4 variants
  return Array.from({length: count}, (_, v) => ({
    id: `${productId}-${v+1}`,
    product_id: productId,
    variant_name: v === 0 ? '기본 옵션' : `옵션 ${v+1}`,
    stock: Math.max(0, 5 + v * (i % 7)),
    cost_price: 8000 + i*120 + v*450,
    selling_price: 10000 + i*120 + v*450 + (v === 0 ? 0 : 500),
    supply_price: 9000 + i*120 + v*450,
    code: `VAR${productId}-${v+1}`,
    barcodes: [
      `880${String(productId).padStart(6,'0')}${v+1}`,
      `990${String(productId).padStart(6,'0')}${v+1}`,
      `770${String(productId).padStart(6,'0')}${v+1}`,
    ],
  // per-variant location barcode (maps this option to a storage/location code)
  location_code: `LOC-${String(productId).padStart(6,'0')}-${v+1}`,
    is_selling: (i % 10) !== 0 || v !== 0,
    is_soldout: false,
    is_stock_linked: true,
    width_cm: 10 + v + (i % 5),
    height_cm: 20 + v + (i % 4),
    depth_cm: 2 + v,
    weight_g: 300 + v*100 + (i % 200),
    volume_cc: (10 + v) * (20 + v) * (2 + v),
    warehouse_location: `W-${(v%3)+1}`,
    extra_fields: {
      option_supplier_name: (i % 3 === 0) ? 'ACME Supplier' : '',
      channel_option_codes: `CH-${productId}-${v+1}`,
      inbound_expected_date: null,
      inbound_expected_qty: 0,
      option_memos: [],
      hidden_release: false,
      prevent_bundle: false,
      auto_scan: v === 0,
    },
    created_at: generateDate(i),
    updated_at: generateDate(i)
  }));
}

// Generate 10 products per main classification type to make mock data predictable
export const mockProducts = (() => {
  const classificationsArr = ["의류", "전자제품", "잡화", "뷰티", "식품"];
  const perType = 10;
  const products: any[] = [];
  let idx = 0;

  for (let ci = 0; ci < classificationsArr.length; ci++) {
    for (let j = 0; j < perType; j++) {
      const i = idx;
      const productId = i + 1;
      const yearData = generateYearDate(i);
      const classification = classificationsArr[ci];
      const classificationPath =
        ci === 0
          ? ['의류','남성','셔츠']
          : ci === 1
          ? ['전자제품']
          : ci === 2
          ? ['잡화']
          : ci === 3
          ? ['뷰티']
          : ['식품'];

      products.push({
        id: productId,
        code: generateProductCode(i),
        name: `상품${productId}`,
        brand: mockBrands[i % mockBrands.length].name,
        brand_id: mockBrands[i % mockBrands.length].id,
        classificationPath,
        classification,
        classificationId: `c-${(i % 15) + 1}`,
        selling_price: 10000 + i * 100,
        supply_price: 9000 + i * 100,
        cost_price: 8000 + i * 100,
        hs_code: `${1000 + i}`,
        origin_country: i % 3 === 0 ? 'KR' : i % 3 === 1 ? 'CN' : 'VN',
        images: [
          `https://picsum.photos/seed/${productId}/800/600`,
          `https://picsum.photos/seed/${productId}-1/800/600`,
          `https://picsum.photos/seed/${productId}-2/800/600`
        ],
        invoice_display_name: i % 2 === 0,
        retail_price: 12000 + i * 100,
        tags: [`tag${(i % 5) + 1}`, `tag${(i % 7) + 1}`],
        rating: Number((3 + (i % 3) + Math.random()).toFixed(1)),
        is_selling: (i % 8) !== 0,
        is_active: (i % 12) !== 0,
        supplier_name: `공급사${(i % 20) + 1}`,
        memos: Array.from({ length: 5 }, (_, m) => `메모${m + 1} for ${productId}`),
        box_qty: 1 + (i % 5),
        composition: i % 2 === 0 ? 'Cotton 80%, Polyester 20%' : 'Polyester 100%',
        season: (function(){ const arr = ['SS','AW','ALL']; return arr[i % arr.length]; })(),
        year: (function(){ const y = 2020 + (i % 6); return String(y); })(),
        supplier_id: i % 20 + 1,
        category_id: mockCategories[i % mockCategories.length].id,
        description: `
      <h3>상품 ${productId} 소개</h3>
      <p>이 상품은 데모용 목업 데이터입니다. 주요 특징:</p>
      <ul>
        <li>브랜드: ${mockBrands[i % mockBrands.length].name}</li>
        <li>카테고리: ${classification}</li>
      </ul>
      <p><strong>상세 설명:</strong> 고급 소재 사용, 편안한 착용감.</p>
      <h4>제품 사양</h4>
      <table style="width:100%; border-collapse:collapse;">
        <tr><th style="text-align:left; padding:6px; border:1px solid #e5e7eb">가로(cm)</th><td style="padding:6px; border:1px solid #e5e7eb">${30 + (i % 10)}</td></tr>
        <tr><th style="text-align:left; padding:6px; border:1px solid #e5e7eb">세로(cm)</th><td style="padding:6px; border:1px solid #e5e7eb">${40 + (i % 8)}</td></tr>
        <tr><th style="text-align:left; padding:6px; border:1px solid #e5e7eb">높이(cm)</th><td style="padding:6px; border:1px solid #e5e7eb">${5 + (i % 4)}</td></tr>
        <tr><th style="text-align:left; padding:6px; border:1px solid #e5e7eb">무게(g)</th><td style="padding:6px; border:1px solid #e5e7eb">${800 + (i % 500)}</td></tr>
      </table>
      <h4>상품 이미지</h4>
      <div>
        <img src="https://picsum.photos/seed/${productId}/400/300" style="max-width:240px; margin-right:8px; border-radius:4px;" />
        <img src="https://picsum.photos/seed/${productId}-1/400/300" style="max-width:240px; border-radius:4px;" />
      </div>
      <p style="margin-top:8px; font-size:0.95rem; color:#374151">외부 SKU: EXT-${productId} | 외부몰: ${i % 3 === 0 ? 'Café24' : i % 3 === 1 ? 'Shopify' : 'Naver Smart Store'}</p>
    `,
        width_cm: 30 + (i % 10),
        height_cm: 40 + (i % 8),
        depth_cm: 5 + (i % 4),
        weight_g: 800 + (i % 500),
        volume_cc: (30 + (i % 10)) * (40 + (i % 8)) * (5 + (i % 4)),
        externalMall: {
          platform: i % 3 === 0 ? 'Café24' : i % 3 === 1 ? 'Shopify' : 'Naver Smart Store',
          platformName: i % 3 === 0 ? 'cafe24_store' : i % 3 === 1 ? 'shopify_store' : 'naver_shop',
          external_sku: `EXT-${productId}`
        },
        location_codes: (function(){
          try {
            return generateVariants(productId, i).map((vv:any)=> vv.location_code);
          } catch (e) { return []; }
        })(),
        meta: {
          weight_class: i % 2 === 0 ? 'g' : 'kg',
          fragile: i % 10 === 0,
          origin_label: i % 3 === 0 ? '국내' : '해외'
        },
        is_dutyfree: i % 10 === 0,
        created_at: generateDate(i),
        updated_at: generateDate(i),
        made_date: yearData.made_date,
        expr_date: yearData.expr_date,
        publication_date: yearData.publication_date,
        first_sale_date: yearData.first_sale_date,
        variants: generateVariants(productId, i)
      });

      idx++;
    }
  }

  return products;
})();
