import { InboundRequest, ApprovalStatus } from '@/app/types/inbound'

// 임시 인메모리 DB (실제로는 데이터베이스를 사용해야 함)
let inboundRequests: InboundRequest[] = [
  {
    id: 'PO-2024-001',
    poNumber: 'PO-2024-001',
    supplierName: 'ABC Supplier Co.',
    items: [
      {
        id: 'item-001',
        skuCode: 'SKU-001',
        productName: '상품명 A',
        quantity: 100,
        unit: 'EA'
      },
      {
        id: 'item-002',
        skuCode: 'SKU-002',
        productName: '상품명 B',
        quantity: 50,
        unit: 'BOX'
      }
    ],
    requestDate: '2024-10-20',
    expectedDate: '2024-10-25',
    approvalStatus: '승인완료',
    memo: '우선 처리 요청'
  },
  {
    id: 'PO-2024-002',
    poNumber: 'PO-2024-002',
    supplierName: 'XYZ Trading Ltd.',
    items: [
      {
        id: 'item-003',
        skuCode: 'SKU-003',
        productName: '상품명 C',
        quantity: 200,
        unit: 'EA'
      }
    ],
    requestDate: '2024-10-22',
    expectedDate: '2024-10-27',
    approvalStatus: '승인대기',
    memo: ''
  },
  {
    id: 'PO-2024-003',
    poNumber: 'PO-2024-003',
    supplierName: 'Global Supply Inc.',
    items: [
      {
        id: 'item-004',
        skuCode: 'SKU-004',
        productName: '상품명 D',
        quantity: 75,
        unit: 'EA'
      },
      {
        id: 'item-005',
        skuCode: 'SKU-005',
        productName: '상품명 E',
        quantity: 30,
        unit: 'SET'
      }
    ],
    requestDate: '2024-10-19',
    expectedDate: '2024-10-24',
    approvalStatus: '입고완료',
    memo: '입고 완료됨'
  }
]

export const db = {
  // 모든 입고 요청 조회
  getAllInboundRequests: (): InboundRequest[] => {
    return inboundRequests
  },

  // 특정 입고 요청 조회
  getInboundRequestById: (id: string): InboundRequest | undefined => {
    return inboundRequests.find(req => req.id === id)
  },

  // 입고 요청 생성
  createInboundRequest: (data: Omit<InboundRequest, 'id'>): InboundRequest => {
    const id = `PO-${Date.now()}`
    const newRequest: InboundRequest = {
      id,
      ...data
    }
    inboundRequests.push(newRequest)
    return newRequest
  },

  // 입고 요청 상태 업데이트
  updateInboundStatus: (id: string, status: ApprovalStatus, reason?: string): InboundRequest | undefined => {
    const request = inboundRequests.find(req => req.id === id)
    if (request) {
      request.approvalStatus = status
      if (reason) {
        request.memo = reason
      }
    }
    return request
  },

  // 입고 요청 삭제
  deleteInboundRequest: (id: string): boolean => {
    const index = inboundRequests.findIndex(req => req.id === id)
    if (index > -1) {
      inboundRequests.splice(index, 1)
      return true
    }
    return false
  }
}
