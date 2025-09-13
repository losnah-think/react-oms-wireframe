// 재고/이력 목업 데이터
import { mockProducts } from './mockProducts';
import { mockWarehouses } from './mockWarehouses';

export const mockStocks = Array.from({length: 100}, (_, i) => ({
  id: i+1,
  product_id: mockProducts[i % mockProducts.length].id,
  variant_id: (mockProducts[i % mockProducts.length].variants && mockProducts[i % mockProducts.length].variants[0]?.id) || 1,
  warehouse_id: mockWarehouses[i % mockWarehouses.length].id,
  stock: 10 + (i%20),
  last_updated_at: `2025-09-${String((i%30)+1).padStart(2,'0')}T10:00:00Z`
}));
