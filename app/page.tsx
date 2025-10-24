'use client'

import { useEffect, useState } from 'react'
import InboundRequestForm from './components/InboundRequestForm'
import { InboundRequest } from './types/inbound'

export default function Home() {
  const [requests, setRequests] = useState<InboundRequest[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmitSuccess = (request: InboundRequest) => {
    setRequests([request, ...requests])
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📦 OMS-WMS Wireframe</h1>
          <p className="text-gray-600">Order Management System - Warehouse Management System Integration</p>
        </div>

        {/* 입고 요청 폼 */}
        <div className="mb-12">
          <InboundRequestForm onSubmitSuccess={handleSubmitSuccess} />
        </div>

        {/* 최근 요청 목록 */}
        {requests.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 최근 입고 요청</h2>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{request.poNumber}</p>
                      <p className="text-sm text-gray-500">{request.supplierName}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {request.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">{/* ApprovalStatusTag will be rendered here */}</div>
                      <p className="text-xs text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
