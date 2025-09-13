import { ProductBasicInfo, ProductOption, ProductOptionValue } from '../types/multitenant';
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

function generateOptions(i: number): ProductOption[] {
  return [
    {
      id: `opt-color-${i+1}`,
      name: '색상',
      type: 'color',
      isRequired: true,
      values: [
        { id: `optval-${i+1}-red`, value: 'Red', additionalPrice: 0, stock: 10, isActive: true },
        { id: `optval-${i+1}-blue`, value: 'Blue', additionalPrice: 500, stock: 8, isActive: true },
        { id: `optval-${i+1}-green`, value: 'Green', additionalPrice: 1000, stock: 5, isActive: true }
      ]
    },
    {
      id: `opt-size-${i+1}`,
      name: '사이즈',
      type: 'size',
      isRequired: true,
      values: [
        { id: `optval-${i+1}-s`, value: 'S', additionalPrice: 0, stock: 7, isActive: true },
        { id: `optval-${i+1}-m`, value: 'M', additionalPrice: 0, stock: 12, isActive: true },
        { id: `optval-${i+1}-l`, value: 'L', additionalPrice: 0, stock: 6, isActive: true }
      ]
    },
    {
      id: `opt-material-${i+1}`,
      name: '소재',
      type: 'material',
      isRequired: false,
      values: [
        { id: `optval-${i+1}-cotton`, value: 'Cotton', additionalPrice: 0, stock: 10, isActive: true },
        { id: `optval-${i+1}-poly`, value: 'Poly', additionalPrice: 0, stock: 10, isActive: true }
      ]
    }
  ];
}

function generateVariants(i: number) {
  return [
    {
      id: `variant-${i+1}-1`,
      variantName: 'Red / S',
      code: `V${i+1}-RS`,
      barcode1: `8800000${i+1}01`,
      sellingPrice: 10000 + i*100,
      supplyPrice: 9000 + i*100,
      costPrice: 8000 + i*100,
      stock: 10,
      isSelling: true,
      isActive: true
    },
    {
      id: `variant-${i+1}-2`,
      variantName: 'Blue / M',
      code: `V${i+1}-BM`,
      barcode1: `8800000${i+1}02`,
      sellingPrice: 10500 + i*100,
      supplyPrice: 9500 + i*100,
      costPrice: 8500 + i*100,
      stock: 8,
      isSelling: true,
      isActive: true
    }
  ];
}

export const mockProducts = Array.from({length: 100}, (_, i) => ({
  id: `prd-${i+1}`,
  productName: `상품${i+1}`,
  englishProductName: `Product${i+1}`,
  productCode: generateProductCode(i),
  productCategory: mockCategories[i % mockCategories.length].name,
  brandId: mockBrands[i % mockBrands.length].id,
  supplierId: `supplier-${(i%10)+1}`,
  codes: { internal: generateProductCode(i), cafe24: `C24${String(i+1).padStart(5, '0')}`, channels: [] },
  categoryId: mockCategories[i % mockCategories.length].id,
  pricing: { sellingPrice: 10000 + i*100, consumerPrice: 12000 + i*100, supplyPrice: 9000 + i*100, commissionRate: 10 + (i%10), isSupplyPriceCalculated: true, calculationMethod: 'commission' },
  originalCost: 8000 + i*100,
  representativeSellingPrice: 10000 + i*100,
  representativeSupplyPrice: 9000 + i*100,
  marketPrice: 13000 + i*100,
  consumerPrice: 12000 + i*100,
  foreignCurrencyPrice: 10 + i,
  stock: 50 + i,
  safeStock: 5 + (i%10),
  isOutOfStock: i % 20 === 0,
  isSelling: i % 3 !== 0,
  isSoldout: i % 25 === 0,
  description: `상품${i+1} 설명입니다.`,
  representativeImage: '',
  descriptionImages: [],
  thumbnailUrl: '',
  images: [],
  width: 10 + i,
  height: 5 + (i%10),
  depth: 2 + (i%5),
  weight: 100 + i*2,
  volume: 50 + i*3,
  hsCode: `HS${1000+i}`,
  origin: 'KR',
  isTaxExempt: i % 10 === 0,
  showProductNameOnInvoice: true,
  productDesigner: `디자이너${(i%10)+1}`,
  productRegistrant: `등록자${(i%5)+1}`,
  classification: `분류${(i%10)+1}`,
  productYear: `202${i%10}`,
  productSeason: ['SS','FW','ALL'][i%3],
  externalProductId: `EXT-${i+1}`,
  externalUrl: `https://example.com/product/${i+1}`,
  active: i % 2 === 0,
  tags: [{ id: `tag-${(i%5)+1}`, name: `태그${(i%5)+1}`, category: 'general' }],
  logistics: { width: 10 + i, height: 5 + (i%10), depth: 2 + (i%5), weight: 100 + i*2, packagingUnit: 'ea', packagingQuantity: 1, isFragile: i%2===0, isLiquid: i%3===0 },
  policies: { showProductNameOnInvoice: true, preventConsolidation: false, shippingPolicyId: undefined, giftPolicyId: undefined, isSampleIncluded: false, isReturnable: true, isExchangeable: true, returnPeriodDays: 14 },
  createdAt: generateDate(i),
  updatedAt: generateDate(i),
  options: generateOptions(i),
  variants: generateVariants(i)
}));
