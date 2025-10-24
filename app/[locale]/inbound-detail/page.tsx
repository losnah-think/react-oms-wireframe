'use client'

import { useParams } from 'next/navigation'
import ApprovalStatusTag from '@/app/components/ApprovalStatusTag'

const translations = {
  ko: {
    title: '입고 상세 정보',
    summary: '요약',
    requestId: '요청 ID',
    requestDate: '요청 날짜',
    shipper: '배송자',
    warehouse: '창고',
    timeline: '진행 상황',
    items: '상품 목록',
    productName: '상품명',
    sku: 'SKU',
    quantity: '수량',
    unit: '단위',
    status: '상태',
    actions: '작업',
    checkStatus: '상태 조회',
    cancelRequest: '요청 취소',
    response: '응답 정보',
    lastUpdated: '마지막 업데이트',
    invoiceNumber: '청구 번호',
    timelineSteps: [
      '요청됨',
      '승인 대기',
      '승인됨',
      '구역 할당',
      '구역 이동',
      '청구 발행됨'
    ]
  },
  en: {
    title: 'Inbound Request Details',
    summary: 'Summary',
    requestId: 'Request ID',
    requestDate: 'Request Date',
    shipper: 'Shipper',
    warehouse: 'Warehouse',
    timeline: 'Timeline',
    items: 'Item List',
    productName: 'Product Name',
    sku: 'SKU',
    quantity: 'Quantity',
    unit: 'Unit',
    status: 'Status',
    actions: 'Actions',
    checkStatus: 'Check Status',
    cancelRequest: 'Cancel Request',
    response: 'Response Info',
    lastUpdated: 'Last Updated',
    invoiceNumber: 'Invoice Number',
    timelineSteps: [
      'Requested',
      'Pending',
      'Approved',
      'Zone Allocated',
      'Zone Moved',
      'Invoice Issued'
    ]
  },
  vi: {
    title: 'Chi tiết yêu cầu nhập hàng',
    summary: 'Tóm tắt',
    requestId: 'ID yêu cầu',
    requestDate: 'Ngày yêu cầu',
    shipper: 'Người vận chuyển',
    warehouse: 'Kho',
    timeline: 'Dòng thời gian',
    items: 'Danh sách mặt hàng',
    productName: 'Tên sản phẩm',
    sku: 'SKU',
    quantity: 'Số lượng',
    unit: 'Đơn vị',
    status: 'Trạng thái',
    actions: 'Hành động',
    checkStatus: 'Kiểm tra trạng thái',
    cancelRequest: 'Hủy yêu cầu',
    response: 'Thông tin phản hồi',
    lastUpdated: 'Cập nhật lần cuối',
    invoiceNumber: 'Số hóa đơn',
    timelineSteps: [
      'Đã yêu cầu',
      'Chờ duyệt',
      'Đã duyệt',
      'Phân bổ khu vực',
      'Di chuyển khu vực',
      'Phát hành hóa đơn'
    ]
  }
}

export default function InboundDetailPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'ko'
  const t = translations[locale as keyof typeof translations] || translations.ko

  // 샘플 데이터
  const requestData = {
    id: 'PO-2024-001',
    requestDate: '2024-10-22',
    shipper: 'ABC Supplier Co.',
    warehouse: 'Warehouse A',
    status: 'pending' as const,
    items: [
      { id: 'item-1', productName: '상품 A', sku: 'SKU-001', quantity: 100, unit: 'EA', status: 'pending' },
      { id: 'item-2', productName: '상품 B', sku: 'SKU-002', quantity: 50, unit: 'BOX', status: 'completed' },
    ],
    lastUpdated: '2024-10-22 14:30',
    invoiceNumber: 'INV-2024-001',
  }

  const currentStep = 1 // 0-5

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.title}</h1>
          <p className="text-gray-600">ID: {requestData.id}</p>
        </div>

        {/* 요약 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.summary}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-xs text-gray-500">{t.requestId}</p>
              <p className="text-lg font-semibold text-gray-800">{requestData.id}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-xs text-gray-500">{t.requestDate}</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(requestData.requestDate).toLocaleDateString(
                  locale === 'ko' ? 'ko-KR' : locale === 'en' ? 'en-US' : 'vi-VN'
                )}
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-xs text-gray-500">{t.shipper}</p>
              <p className="text-lg font-semibold text-gray-800">{requestData.shipper}</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="text-xs text-gray-500">{t.warehouse}</p>
              <p className="text-lg font-semibold text-gray-800">{requestData.warehouse}</p>
            </div>
          </div>
        </div>

        {/* 타임라인 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.timeline}</h2>
          <div className="flex justify-between items-start">
            {t.timelineSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* 원 */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-all ${
                    index <= currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                >
                  {index + 1}
                </div>

                {/* 연결선 */}
                {index < t.timelineSteps.length - 1 && (
                  <div
                    className={`w-full h-1 mb-2 transition-all ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    style={{ height: '2px' }}
                  />
                )}

                {/* 텍스트 */}
                <p className="text-center text-xs text-gray-600 mt-2 max-w-16 leading-tight">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.items}</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    {t.productName}
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                    {t.sku}
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    {t.quantity}
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    {t.unit}
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                    {t.status}
                  </th>
                </tr>
              </thead>
              <tbody>
                {requestData.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{item.productName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.sku}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-800 font-semibold">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{item.unit}</td>
                    <td className="px-4 py-3 text-center">
                      <ApprovalStatusTag
                        status={item.status === 'completed' ? '입고완료' : '승인대기'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 작업 버튼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex gap-3 justify-end">
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            {t.checkStatus}
            <span className="text-xs block text-blue-100 mt-1">[GET /api/inbound-status/{'{id}'}]</span>
          </button>
          <button
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
          >
            {t.cancelRequest}
            <span className="text-xs block text-red-100 mt-1">[PATCH /api/inbound-status]</span>
          </button>
        </div>

        {/* 응답 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.response}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{t.lastUpdated}</p>
              <p className="text-lg font-semibold text-gray-800">{requestData.lastUpdated}</p>
            </div>
            {requestData.invoiceNumber && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">{t.invoiceNumber}</p>
                <p className="text-lg font-semibold text-gray-800">{requestData.invoiceNumber}</p>
              </div>
            )}
          </div>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700">
            <p className="text-xs font-semibold text-yellow-800 mb-1">API Integration Points:</p>
            <ul className="text-xs text-gray-600 space-y-1 font-mono">
              <li>• <code>GET /api/inbound-requests</code> - Fetch all requests</li>
              <li>• <code>POST /api/inbound-requests</code> - Create new request</li>
              <li>• <code>GET /api/inbound-status/{'{id}'}</code> - Check status</li>
              <li>• <code>PATCH /api/inbound-status/{'{id}'}</code> - Update status</li>
              <li>• <code>DELETE /api/inbound-status/{'{id}'}</code> - Cancel request</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
