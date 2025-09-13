import { OrderStatus } from './database';

// Order 타입 정의 (OrderListPage, 서비스 등에서 사용)
export interface Order {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: Array<{
    productId: number;
    productName: string;
    variantId: number;
    variantName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod?: string;
  paymentStatus?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  notes?: string;
  // 기타 필요한 필드 추가 가능
}
