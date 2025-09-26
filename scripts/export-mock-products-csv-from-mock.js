#!/usr/bin/env node
// scripts/export-mock-products-csv-from-mock.js
// Generate mock products (based on src/data/mockProducts.ts) and export CSV

const fs = require('fs');
const path = require('path');

function generateBrandCode(i) {
  const prefix = 'BRAND';
  const date = new Date(2025, 8, 13);
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const rand = String(1000 + (i % 9000));
  return `${prefix}-${dateStr}-${rand}-${i+1}`;
}

function generateCategoryCode(i) {
  const prefix = 'CAT';
  const date = new Date(2025, 8, 13);
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const rand = String(1000 + (i % 9000));
  return `${prefix}-${dateStr}-${rand}-${i+1}`;
}

const mockBrands = Array.from({length: 100}, (_, i) => ({
  id: `brand-${i+1}`,
  code: generateBrandCode(i),
  name: `브랜드${i+1}`
}));

const mockCategories = Array.from({length: 100}, (_, i) => ({
  id: `cat-${i+1}`,
  code: generateCategoryCode(i),
  name: `카테고리${i+1}`
}));

function generateProductCode(i) {
  const prefix = 'PRD';
  const date = new Date(2025, 8, 13);
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const rand = String(1000 + (i % 9000));
  return `${prefix}-${dateStr}-${rand}-${i+1}`;
}

function generateDate(i) {
  const day = (i % 30) + 1;
  return `2025-09-${String(day).padStart(2,'0')}T10:00:00Z`;
}

function generateYearDate(i) {
  const year = 2020 + (i % 6);
  return {
    made_date: `${year}-01-01`,
    expr_date: `${year+1}-12-31`,
    publication_date: `${year}-03-01T00:00:00Z`,
    first_sale_date: `${year}-04-01T00:00:00Z`
  };
}

function generateVariants(productId, i) {
  const count = 1 + (i % 4);
  return Array.from({length: count}, (_, v) => ({
    id: `${productId}-${v+1}`,
    product_id: productId,
    variant_name: v === 0 ? '기본 옵션' : `옵션 ${v+1}`,
    stock: Math.max(0, 5 + v * (i % 7)),
    cost_price: 8000 + i*120 + v*450,
    selling_price: 10000 + i*120 + v*450 + (v === 0 ? 0 : 500),
    supply_price: 9000 + i*120 + v*450,
    code: `VAR${productId}-${v+1}`,
    created_at: generateDate(i),
    updated_at: generateDate(i)
  }));
}

function buildMockProducts() {
  const classificationsArr = ["의류", "전자제품", "잡화", "뷰티", "식품"];
  const perType = 10;
  const products = [];
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

      const variants = generateVariants(productId, i);
      const totalStock = variants.reduce((s, v) => s + (v.stock || 0), 0);

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
          `https://picsum.photos/seed/${productId}-1/800/600`
        ],
        retail_price: 12000 + i * 100,
        tags: [`tag${(i % 5) + 1}`],
        is_selling: (i % 8) !== 0,
        is_active: (i % 12) !== 0,
        supplier_name: `공급사${(i % 20) + 1}`,
        box_qty: 1 + (i % 5),
        variants,
        created_at: generateDate(i),
        updated_at: generateDate(i),
        made_date: yearData.made_date,
        expr_date: yearData.expr_date,
        publication_date: yearData.publication_date,
        first_sale_date: yearData.first_sale_date,
        images_thumb: `https://picsum.photos/seed/${productId}/400/300`,
        product_stock: totalStock
      });
      idx++;
    }
  }
  return products;
}

function csvEscape(s) {
  if (s === null || s === undefined) return '';
  const str = String(s);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function exportCsv(outPath) {
  const products = buildMockProducts();
  const header = ['id','product_code','product_name','brand','price','stock','thumbnail_url','variant_id','variant_name','variant_price','variant_stock'];
  const rows = [header.join(',')];
  for (const p of products) {
    const pid = p.id;
    const pcode = p.code;
    const pname = p.name;
    const brand = p.brand;
    const price = p.selling_price;
    const stock = p.product_stock;
    const thumb = p.images && p.images.length ? p.images[0] : p.images_thumb || '';
    const variants = p.variants || [];
    if (variants.length === 0) {
      rows.push([pid,pcode,pname,brand,price,stock,thumb,'','','',''].map(csvEscape).join(','));
    } else {
      for (const v of variants) {
        rows.push([pid,pcode,pname,brand,price,stock,thumb,v.id,v.variant_name || v.name || '',v.selling_price || v.price || '',v.stock || ''].map(csvEscape).join(','));
      }
    }
  }
  fs.writeFileSync(outPath, rows.join('\n'), { encoding: 'utf8' });
  console.log(`Wrote ${products.length} products (with variants) to ${outPath}`);
}

if (require.main === module) {
  const out = process.argv.slice(2).find(a => a.startsWith('--out=')) || '--out=products-mock-export.csv';
  const outPath = path.resolve(process.cwd(), out.split('=')[1]);
  exportCsv(outPath);
}
