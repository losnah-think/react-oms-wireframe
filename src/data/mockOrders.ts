import { mockProducts } from './mockProducts';
import { mockOrderStatus, mockShippingStatus, mockPaymentStatus } from './mockStatus';

const mockShops = Array.from({length: 10}, (_, i) => ({
  shop_no: `SHOP${i+1}`,
  shop_name: `쇼핑몰${i+1}`,
  site_id: i+1,
  mall_id: `MALL${i+1}`
}));

const mockSuppliers = Array.from({length: 20}, (_, i) => ({
  supplier_id: i+1,
  supplier_name: `공급사${i+1}`
}));

export const mockOrders = Array.from({length: 100}, (_, i) => {
  const product = mockProducts[i % mockProducts.length];
  const shop = mockShops[i % mockShops.length];
  const supplier = mockSuppliers[product.supplier_id % mockSuppliers.length];
  return {
    id: i + 1, // 주문 id
    order_code: `ORD${String(i+1).padStart(6, '0')}`,
    shop_no: shop.shop_no,
    shop_name: shop.shop_name,
    site_id: shop.site_id,
    mall_id: shop.mall_id,
    shop_order_no: `SHOPORD${i+1}`,
    ordered_qty: 1 + (i%5),
    product_id: product.id,
    product_code: product.code,
    product_name: product.name,
    variant_id: (product.variants && product.variants[0]?.id) || 1,
    variant_name: (product.variants && product.variants[0]?.variant_name) || '옵션1',
    supplier_id: supplier.supplier_id,
    supplier_name: supplier.supplier_name,
    category_id: product.category_id,
    category_name: `카테고리${product.category_id}`,
    barcode_no: (product.variants && product.variants[0]?.barcode1) || '',
    is_soldout: false,
    orderer: `고객${(i%20)+1}`,
    receipient: `수령인${(i%20)+1}`,
    address: `서울시 강남구 ${i+1}번지`,
    mobile_no: `010-0000-${String((i%1000)+1000).padStart(4,'0')}`,
    payment_method: ['카드','무통장','페이팔'][i%3],
    payment_status: mockPaymentStatus[i % mockPaymentStatus.length],
    payment_amount: product.selling_price * (1 + (i%5)),
    shipping_method: '택배',
    shipping_status: mockShippingStatus[i % mockShippingStatus.length],
    invoice_number: `INV${i+1}`,
    created_at: `2025-09-${String((i%30)+1).padStart(2,'0')}T10:00:00Z`,
    updated_at: `2025-09-${String((i%30)+1).padStart(2,'0')}T10:10:00Z`,
    status: mockOrderStatus[i % mockOrderStatus.length]
  };
});

// Options for filters (used by OrderFilters)
export const orderStatusOptions = (mockOrderStatus || []).map((s: string) => ({ value: s, label: s }));
export const paymentMethodOptions = ['all', '카드', '무통장', '페이팔'].map(m => ({ value: m, label: m }));
export const paymentStatusOptions = (mockPaymentStatus || []).map((s: string) => ({ value: s, label: s }));