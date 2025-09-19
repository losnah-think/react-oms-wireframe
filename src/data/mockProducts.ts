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
  return Array.from({length: 3}, (_, v) => ({
    id: v + 1,
    product_id: productId,
    variant_name: `옵션${v+1}`,
    stock: 10 + v*5,
    cost_price: 8000 + i*100 + v*500,
    selling_price: 10000 + i*100 + v*500,
    supply_price: 9000 + i*100 + v*500,
    code: `VAR${productId}-${v+1}`,
    barcode1: `8800000${productId}${v+1}`,
    barcode2: `9900000${productId}${v+1}`,
    barcode3: `7700000${productId}${v+1}`,
    is_selling: true,
    is_soldout: false,
    is_stock_linked: true,
    width_cm: 10 + v,
    height_cm: 20 + v,
    depth_cm: 2 + v,
    weight_g: 500 + v*50,
    volume_cc: (10 + v) * (20 + v) * (2 + v),
    warehouse_location: `W-${(v%3)+1}`,
    created_at: generateDate(i),
    updated_at: generateDate(i)
  }));
}

export const mockProducts = Array.from({length: 100}, (_, i) => {
  const yearData = generateYearDate(i);
  const productId = i + 1;
  return {
    id: productId, // bigint
    code: generateProductCode(i), // varchar(50)
    name: `상품${i+1}`, // varchar(255)
    brand: mockBrands[i % mockBrands.length].name, // varchar(255)
    brand_id: mockBrands[i % mockBrands.length].id,
    // internal classification used by ReactOMS (e.g., ['의류','남성','셔츠'])
    classificationPath: (i % 5) === 0 ? ['의류','남성','셔츠'] : (i % 5) === 1 ? ['의류','여성','원피스'] : (i % 5) === 2 ? ['전자제품'] : (i % 5) === 3 ? ['뷰티'] : ['식품'],
    classification: ["의류", "전자제품", "잡화", "뷰티", "식품"][i % 5],
    classificationId: `c-${(i % 15) + 1}`,
    selling_price: 10000 + i*100, // int
    supply_price: 9000 + i*100, // int
    cost_price: 8000 + i*100, // int
    hs_code: `${1000 + i}`,
    origin_country: i % 3 === 0 ? 'KR' : i % 3 === 1 ? 'CN' : 'VN',
    images: [
      `https://picsum.photos/seed/${productId}/800/600`,
      `https://picsum.photos/seed/${productId}-1/800/600`,
      `https://picsum.photos/seed/${productId}-2/800/600`
    ],
    invoice_display_name: i % 2 === 0,
    retail_price: 12000 + i*100,
    tags: [`tag${(i%5)+1}`, `tag${(i%7)+1}`],
    memos: Array.from({length: 5}, (_, m) => `메모${m+1} for ${productId}`),
    box_qty: 1 + (i % 5),
    composition: i % 2 === 0 ? 'Cotton 80%, Polyester 20%' : 'Polyester 100%',
    season: i % 4 === 0 ? 'SS' : i % 4 === 1 ? 'FW' : 'ALL',
    supplier_id: i % 20 + 1, // bigint
    category_id: mockCategories[i % mockCategories.length].id, // bigint
    // Provide an HTML description so the detail page can render rich content
    description: `
      <h3>상품 ${i+1} 소개</h3>
      <p>이 상품은 데모용 목업 데이터입니다. 주요 특징:</p>
      <ul>
        <li>브랜드: ${mockBrands[i % mockBrands.length].name}</li>
        <li>카테고리: ${["의류", "전자제품", "잡화", "뷰티", "식품"][i % 5]}</li>
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
    `, // html/text
    // Product-level physical attributes (fallbacks; variants also have per-variant dimensions)
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
    is_dutyfree: i % 10 === 0, // tinyint(1)
    created_at: generateDate(i), // datetime
    updated_at: generateDate(i), // datetime
    made_date: yearData.made_date, // date
    expr_date: yearData.expr_date, // date
    publication_date: yearData.publication_date, // datetime
    first_sale_date: yearData.first_sale_date, // datetime
    variants: generateVariants(productId, i) // 옵션/상세정보
  };
});
