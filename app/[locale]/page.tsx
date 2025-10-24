'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import InboundRequestForm from '@/app/components/InboundRequestForm'
import { InboundRequest } from '@/app/types/inbound'
import { inboundAPI } from '@/app/services/inboundAPI'

const titleTranslations = {
  ko: {
    title: 'OMS-WMS 통합 시스템',
    subtitle: '주문 관리 시스템 - 창고 관리 시스템 연동',
    recentRequests: '최근 입고 요청',
    poNumber: 'PO 번호',
    supplier: '공급업체',
    date: '요청 날짜',
    id: 'ID',
    loading: '로딩 중...',
    error: '오류 발생',
  },
  en: {
    title: 'OMS-WMS Integration',
    subtitle: 'Order Management System - Warehouse Management System Integration',
    recentRequests: 'Recent Inbound Requests',
    poNumber: 'PO Number',
    supplier: 'Supplier',
    date: 'Request Date',
    id: 'ID',
    loading: 'Loading...',
    error: 'Error occurred',
  },
  vi: {
    title: 'Hệ thống tích hợp OMS-WMS',
    subtitle: 'Hệ thống quản lý đơn hàng - Tích hợp hệ thống quản lý kho',
    recentRequests: 'Yêu cầu nhập hàng gần đây',
    poNumber: 'Số PO',
    supplier: 'Nhà cung cấp',
    date: 'Ngày yêu cầu',
    id: 'ID',
    loading: 'Đang tải...',
    error: 'Đã xảy ra lỗi',
  },
}

export default function LocaleHome() {
  const params = useParams()
  const locale = (params.locale as string) || 'ko'
  const t = titleTranslations[locale as keyof typeof titleTranslations] || titleTranslations.ko

  const [requests, setRequests] = useState<InboundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await inboundAPI.getInboundRequests()
      if (response.success && response.data) {
        setRequests(response.data)
      }
    } catch (error) {
      console.error('Failed to load requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSuccess = (request: InboundRequest) => {
    setRequests([request, ...requests])
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* 입고 요청 폼 */}
        <div className="mb-12">
          <InboundRequestForm onSubmitSuccess={handleSubmitSuccess} locale={locale} />
        </div>

        {/* 최근 요청 목록 */}
        {requests.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.recentRequests}</h2>
            {loading ? (
              <p className="text-gray-500">{t.loading}</p>
            ) : (
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
                          {t.id}: {request.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(request.requestDate).toLocaleDateString(
                            locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'vi-VN'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
