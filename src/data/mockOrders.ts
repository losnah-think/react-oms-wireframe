import { mockProducts } from './mockProducts';
import { mockOrderStatus, mockShippingStatus, mockPaymentStatus } from './mockStatus';

export const mockOrders = Array.from({length: 100}, (_, i) => ({
  id: `order-${i+1}`,
  orderCode: `ORD${String(i+1).padStart(6, '0')}`,
  productId: mockProducts[i % mockProducts.length].productCode,
  productName: mockProducts[i % mockProducts.length].productName,
  quantity: 1 + (i%5),
  price: mockProducts[i % mockProducts.length].pricing.sellingPrice,
  status: mockOrderStatus[i % mockOrderStatus.length],
  createdAt: `2025-09-${String((i%30)+1).padStart(2,'0')}T10:00:00Z`,
  updatedAt: `2025-09-${String((i%30)+1).padStart(2,'0')}T10:10:00Z`,
  customer: {
    id: `user-${(i%20)+1}`,
    name: `고객${(i%20)+1}`,
    phone: `010-0000-${String((i%1000)+1000).padStart(4,'0')}`,
    address: `서울시 강남구 ${i+1}번지`
  },
  shipping: {
    address: `서울시 강남구 ${i+1}번지`,
    method: '택배',
    status: mockShippingStatus[i % mockShippingStatus.length]
  },
  payment: {
    method: ['카드','무통장','페이팔'][i%3],
    status: mockPaymentStatus[i % mockPaymentStatus.length],
    amount: mockProducts[i % mockProducts.length].pricing.sellingPrice * (1 + (i%5))
  }
}));