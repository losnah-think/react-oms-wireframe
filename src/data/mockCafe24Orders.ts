import { Cafe24Order } from '../lib/types/cafe24';

export const mockCafe24Orders: Cafe24Order[] = [
  {
    orderId: '20250913001',
    orderCode: 'A123456',
    memberId: 'user001',
    orderStatus: '결제완료',
    orderDate: '2025-09-13T12:00:00+09:00',
    items: [
      { productNo: 'P001', productName: '상품A', quantity: 2, price: 10000 },
      { productNo: 'P002', productName: '상품B', quantity: 1, price: 15000 }
    ],
    shipping: { receiverName: '홍길동', address: '서울시 강남구 ...', status: '배송준비' },
    payment: { method: '신용카드', amount: 35000, status: '결제완료' },
  },
  {
    orderId: '20250913002',
    orderCode: 'A123457',
    memberId: 'user002',
    orderStatus: '배송중',
    orderDate: '2025-09-12T15:30:00+09:00',
    items: [
      { productNo: 'P003', productName: '상품C', quantity: 1, price: 20000 }
    ],
    shipping: { receiverName: '김철수', address: '부산시 해운대구 ...', status: '배송중' },
    payment: { method: '가상계좌', amount: 20000, status: '결제완료' },
  }
];
