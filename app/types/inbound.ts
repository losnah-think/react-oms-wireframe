export type ApprovalStatus = '승인대기' | '승인완료' | '반려됨' | '입고완료'

export interface InboundRequest {
  id: string
  poNumber: string
  supplierName: string
  items: InboundItem[]
  requestDate: string
  expectedDate: string
  approvalStatus: ApprovalStatus
  memo?: string
}

export interface InboundItem {
  id: string
  skuCode: string
  productName: string
  quantity: number
  unit: string
}

export interface InboundStatusResponse {
  id: string
  status: ApprovalStatus
  updatedAt: string
  reason?: string
}
