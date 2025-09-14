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
    is_selling: true,
    is_soldout: false,
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
    supplier_id: i % 20 + 1, // bigint
    category_id: mockCategories[i % mockCategories.length].id, // bigint
    description: `상품${i+1} 설명입니다.`, // text
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
