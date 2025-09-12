import { Order as IOrder, OrderItem, OrderStatus } from '../types/database';

export const mockOrders: IOrder[] = [
  {
    id: 'ORD-001',
    createdAt: new Date('2024-01-15T09:30:00Z'),
    updatedAt: new Date('2024-01-18T11:45:00Z'),
    orderNumber: 'ORD-001',
    customerName: '김철수',
    customerPhone: '010-1234-5678',
    customerEmail: 'kim.cheolsu@email.com',
    shippingAddress: '서울특별시 강남구 테헤란로 123, 456호',
    paymentMethod: '카드결제',
    paymentStatus: 'paid',
    status: OrderStatus.DELIVERED,
    totalAmount: 1299000,
    trackingNumber: 'TN-001-2024-0115',
    notes: '문 앞에 놓아주세요',
    items: [
      {
        id: 'ITEM-001-001',
        orderId: 'ORD-001',
        productId: 'PROD-001',
        productName: '삼성 갤럭시 S24 Ultra 256GB',
        variantId: 'VAR-001-001',
        quantity: 1,
        unitPrice: 1299000,
        totalPrice: 1299000
      }
    ]
  },
  {
    id: 'ORD-002',
    createdAt: new Date('2024-01-20T14:15:00Z'),
    updatedAt: new Date('2024-01-21T10:30:00Z'),
    orderNumber: 'ORD-002',
    customerName: '박영희',
    customerPhone: '010-9876-5432',
    customerEmail: 'park.younghee@email.com',
    shippingAddress: '부산광역시 해운대구 해운대해변로 456, 789호',
    paymentMethod: '무통장입금',
    paymentStatus: 'paid',
    status: OrderStatus.SHIPPED,
    totalAmount: 1899000,
    trackingNumber: 'TN-002-2024-0120',
    notes: '부재 시 경비실에 맡겨주세요',
    items: [
      {
        id: 'ITEM-002-001',
        orderId: 'ORD-002',
        productId: 'PROD-002',
        productName: 'LG 그램 17인치 노트북 32GB',
        variantId: 'VAR-002-001',
        quantity: 1,
        unitPrice: 1899000,
        totalPrice: 1899000
      }
    ]
  },
  {
    id: 'ORD-003',
    createdAt: new Date('2024-01-25T16:45:00Z'),
    updatedAt: new Date('2024-01-25T16:45:00Z'),
    orderNumber: 'ORD-003',
    customerName: '이민수',
    customerPhone: '010-1111-2222',
    customerEmail: 'lee.minsu@email.com',
    shippingAddress: '대구광역시 수성구 동대구로 789, 101호',
    paymentMethod: '카드결제',
    paymentStatus: 'paid',
    status: OrderStatus.PROCESSING,
    totalAmount: 1299000,
    notes: '배송 전 연락 부탁드립니다',
    items: [
      {
        id: 'ITEM-003-001',
        orderId: 'ORD-003',
        productId: 'PROD-003',
        productName: '애플 아이패드 프로 12.9 128GB',
        variantId: 'VAR-003-001',
        quantity: 1,
        unitPrice: 1299000,
        totalPrice: 1299000
      }
    ]
  },
  {
    id: 'ORD-004',
    createdAt: new Date('2024-01-28T11:20:00Z'),
    updatedAt: new Date('2024-01-28T11:20:00Z'),
    orderNumber: 'ORD-004',
    customerName: '정수연',
    customerPhone: '010-3333-4444',
    customerEmail: 'jung.sooyeon@email.com',
    shippingAddress: '인천광역시 남동구 인하로 321, 202호',
    paymentMethod: '페이팔',
    paymentStatus: 'pending',
    status: OrderStatus.PENDING,
    totalAmount: 589000,
    items: [
      {
        id: 'ITEM-004-001',
        orderId: 'ORD-004',
        productId: 'PROD-004',
        productName: '다이슨 V15 디텍트 무선청소기',
        variantId: 'VAR-004-001',
        quantity: 1,
        unitPrice: 589000,
        totalPrice: 589000
      }
    ]
  }
];

// 필터링을 위한 옵션들
export const orderStatusOptions = [
  { value: 'all', label: '전체' },
  { value: OrderStatus.PENDING, label: '대기중' },
  { value: OrderStatus.CONFIRMED, label: '확인됨' },
  { value: OrderStatus.PROCESSING, label: '처리중' },
  { value: OrderStatus.SHIPPED, label: '배송중' },
  { value: OrderStatus.DELIVERED, label: '배송완료' },
  { value: OrderStatus.CANCELLED, label: '취소됨' }
] as const;

export const paymentMethodOptions = [
  { value: 'all', label: '전체' },
  { value: '카드결제', label: '카드결제' },
  { value: '무통장입금', label: '무통장입금' },
  { value: '페이팔', label: '페이팔' },
  { value: '토스페이', label: '토스페이' },
  { value: '카카오페이', label: '카카오페이' }
] as const;

export const paymentStatusOptions = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '결제대기' },
  { value: 'paid', label: '결제완료' },
  { value: 'cancelled', label: '결제취소' },
  { value: 'refunded', label: '환불완료' }
] as const;