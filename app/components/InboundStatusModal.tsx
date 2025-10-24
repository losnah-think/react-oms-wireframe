'use client'

import React, { useState, useEffect } from 'react'
import ApprovalStatusTag from './ApprovalStatusTag'
import { InboundStatusResponse } from '@/app/types/inbound'
import { inboundAPI } from '@/app/services/inboundAPI'

interface InboundStatusModalProps {
  requestId: string
  onClose: () => void
}

export default function InboundStatusModal({ requestId, onClose }: InboundStatusModalProps) {
  const [status, setStatus] = useState<InboundStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [requestId])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      // 실제 API 호출
      // const data = await inboundAPI.getInboundStatus(requestId)
      // setStatus(data)

      // 데모용 응답
      setStatus({
        id: requestId,
        status: '승인대기',
        updatedAt: new Date().toISOString(),
      })
    } catch (err) {
      setError('상태 조회 중 오류가 발생했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">입고 상태 조회</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">요청 ID</p>
            <p className="font-mono text-blue-600 font-semibold">{requestId}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
          ) : status ? (
            <>
              <div>
                <p className="text-sm text-gray-500 mb-2">현재 상태</p>
                <ApprovalStatusTag status={status.status} />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">업데이트 시간</p>
                <p className="text-sm text-gray-700">
                  {new Date(status.updatedAt).toLocaleString('ko-KR')}
                </p>
              </div>

              {status.reason && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">반려 사유</p>
                  <p className="text-sm text-gray-700">{status.reason}</p>
                </div>
              )}

              {status.status === '승인완료' && (
                <div className="p-3 bg-green-50 border border-green-300 rounded-md">
                  <p className="text-sm text-green-700">
                    승인이 완료되었습니다. 입고를 진행할 수 있습니다.
                  </p>
                </div>
              )}

              {status.status === '승인대기' && (
                <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                  <p className="text-sm text-yellow-700">
                    WMS 담당자의 승인을 대기중입니다.
                  </p>
                </div>
              )}

              {status.status === '반려됨' && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-md">
                  <p className="text-sm text-red-700">입고 요청이 반려되었습니다.</p>
                </div>
              )}

              {status.status === '입고완료' && (
                <div className="p-3 bg-blue-50 border border-blue-300 rounded-md">
                  <p className="text-sm text-blue-700">입고가 완료되었습니다.</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={fetchStatus}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-medium"
          >
            새로고침
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
