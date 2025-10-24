'use client'

import React, { useState } from 'react'
import ApprovalStatusTag from './ApprovalStatusTag'
import InboundStatusModal from './InboundStatusModal'
import { InboundRequest } from '@/app/types/inbound'

interface InboundRequestFormProps {
  onSubmitSuccess?: (request: InboundRequest) => void
}

export default function InboundRequestForm({ onSubmitSuccess }: InboundRequestFormProps) {
  const [formData, setFormData] = useState({
    poNumber: '',
    supplierName: '',
    expectedDate: '',
    items: [{ skuCode: '', productName: '', quantity: 1, unit: '개' }],
    memo: '',
  })

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [lastRequestId, setLastRequestId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { skuCode: '', productName: '', quantity: 1, unit: '개' }],
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // API 호출 시뮬레이션
      const requestId = `INB-${Date.now()}`
      setLastRequestId(requestId)

      // 실제 API 호출
      // const response = await inboundAPI.submitInboundRequest(formData)
      // setLastRequestId(response.id)

      setShowSuccessModal(true)

      // 폼 리셋
      setFormData({
        poNumber: '',
        supplierName: '',
        expectedDate: '',
        items: [{ skuCode: '', productName: '', quantity: 1, unit: '개' }],
        memo: '',
      })

      if (onSubmitSuccess) {
        onSubmitSuccess({
          id: requestId,
          ...formData,
          requestDate: new Date().toISOString(),
          approvalStatus: '승인대기',
        } as InboundRequest)
      }
    } catch (error) {
      console.error('Failed to submit inbound request:', error)
      alert('입고 요청 제출에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">📥 입고 요청</h1>

          <form onSubmit={handleSubmit}>
            {/* 기본 정보 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">기본 정보</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    발주번호 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.poNumber}
                    onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="PO-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    공급업체명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="공급업체명"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    예정 입고일 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    승인 상태
                  </label>
                  <div className="flex items-center">
                    <ApprovalStatusTag status="승인대기" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                <textarea
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="특별 요청사항이 있으면 입력하세요."
                />
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">상품 정보</h2>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition"
                >
                  + 상품 추가
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                    <input
                      type="text"
                      value={item.skuCode}
                      onChange={(e) => handleItemChange(index, 'skuCode', e.target.value)}
                      placeholder="SKU 코드"
                      className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={item.productName}
                      onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                      placeholder="상품명"
                      className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      placeholder="수량"
                      className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option>개</option>
                      <option>박스</option>
                      <option>팔레트</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="px-2 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowStatusModal(true)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
                disabled={!lastRequestId}
              >
                📋 입고 상태 조회
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:bg-gray-400"
              >
                {isLoading ? '처리중...' : '✓ 입고 요청'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">✓ 입고 요청 완료</h3>
            <p className="text-gray-600 mb-4">
              입고 요청이 WMS로 전송되었습니다. 승인 완료 후 입고가 진행됩니다.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              요청 ID: <span className="font-mono font-semibold text-blue-600">{lastRequestId}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-medium"
              >
                상태 조회
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상태 조회 모달 */}
      {showStatusModal && (
        <InboundStatusModal
          requestId={lastRequestId}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </>
  )
}
