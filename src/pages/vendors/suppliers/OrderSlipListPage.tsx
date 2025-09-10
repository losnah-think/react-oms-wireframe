import React, { useState } from 'react';

interface OrderSlip {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  totalQuantity: number;
  productCount: number;
  createdBy: string;
  memo?: string;
}

interface OrderSlipItem {
  id: string;
  orderSlipId: string;
  productId: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
}

const OrderSlipListPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<OrderSlip | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const mockSuppliers = [
    { id: 'S001', name: '(주)글로벌공급사' },
    { id: 'S002', name: '한국제조' },
    { id: 'S003', name: '베스트파트너' },
    { id: 'S004', name: '프리미엄상사' }
  ];

  const mockOrderSlips: OrderSlip[] = [
    {
      id: 'OS001',
      orderNumber: 'PO-2024-001',
      supplierId: 'S001',
      supplierName: '(주)글로벌공급사',
      orderDate: '2024-09-15',
      expectedDeliveryDate: '2024-09-22',
      actualDeliveryDate: '2024-09-21',
      status: 'delivered',
      totalAmount: 1350000,
      totalQuantity: 85,
      productCount: 5,
      createdBy: '김관리',
      memo: '긴급 발주 - 빠른 배송 요청'
    },
    {
      id: 'OS002',
      orderNumber: 'PO-2024-002',
      supplierId: 'S002',
      supplierName: '한국제조',
      orderDate: '2024-09-18',
      expectedDeliveryDate: '2024-09-25',
      status: 'shipped',
      totalAmount: 850000,
      totalQuantity: 35,
      productCount: 3,
      createdBy: '이담당',
    },
    {
      id: 'OS003',
      orderNumber: 'PO-2024-003',
      supplierId: 'S001',
      supplierName: '(주)글로벌공급사',
      orderDate: '2024-09-20',
      expectedDeliveryDate: '2024-09-27',
      status: 'confirmed',
      totalAmount: 2150000,
      totalQuantity: 120,
      productCount: 7,
      createdBy: '박매니저'
    },
    {
      id: 'OS004',
      orderNumber: 'PO-2024-004',
      supplierId: 'S003',
      supplierName: '베스트파트너',
      orderDate: '2024-09-22',
      status: 'pending',
      totalAmount: 420000,
      totalQuantity: 25,
      productCount: 2,
      createdBy: '최직원'
    },
    {
      id: 'OS005',
      orderNumber: 'PO-2024-005',
      supplierId: 'S004',
      supplierName: '프리미엄상사',
      orderDate: '2024-09-10',
      expectedDeliveryDate: '2024-09-15',
      status: 'cancelled',
      totalAmount: 750000,
      totalQuantity: 15,
      productCount: 2,
      createdBy: '김관리',
      memo: '공급사 사정으로 취소'
    }
  ];

  const mockOrderSlipItems: OrderSlipItem[] = [
    {
      id: 'OSI001',
      orderSlipId: 'OS001',
      productId: 'P001',
      productName: '스마트폰 케이스',
      sku: 'SKU-001',
      orderedQuantity: 50,
      receivedQuantity: 50,
      unitPrice: 15000,
      totalPrice: 750000
    },
    {
      id: 'OSI002',
      orderSlipId: 'OS001',
      productId: 'P002',
      productName: '무선 이어폰',
      sku: 'SKU-002',
      orderedQuantity: 35,
      receivedQuantity: 35,
      unitPrice: 45000,
      totalPrice: 600000
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '발주대기', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: '발주확정', color: 'bg-blue-100 text-blue-800' },
      shipped: { label: '배송중', color: 'bg-purple-100 text-purple-800' },
      delivered: { label: '입고완료', color: 'bg-green-100 text-green-800' },
      cancelled: { label: '발주취소', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredOrderSlips = mockOrderSlips.filter(slip => {
    const matchesStatus = selectedStatus === 'all' || slip.status === selectedStatus;
    const matchesSupplier = selectedSupplier === 'all' || slip.supplierId === selectedSupplier;
    const matchesSearch = searchTerm === '' || 
      slip.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const slipDate = new Date(slip.orderDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDateRange = slipDate >= startDate && slipDate <= endDate;
    }

    return matchesStatus && matchesSupplier && matchesSearch && matchesDateRange;
  });

  const handleViewDetail = (slip: OrderSlip) => {
    setSelectedSlip(slip);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = (slipId: string, newStatus: string) => {
    // 실제 구현에서는 API 호출
    alert(`발주전표 ${slipId}의 상태가 ${newStatus}로 변경되었습니다.`);
  };

  const handleCancelOrder = (slipId: string) => {
    if (confirm('정말 이 발주를 취소하시겠습니까?')) {
      alert(`발주전표 ${slipId}가 취소되었습니다.`);
    }
  };

  const getTotalStats = () => {
    return {
      total: filteredOrderSlips.length,
      pending: filteredOrderSlips.filter(s => s.status === 'pending').length,
      confirmed: filteredOrderSlips.filter(s => s.status === 'confirmed').length,
      shipped: filteredOrderSlips.filter(s => s.status === 'shipped').length,
      delivered: filteredOrderSlips.filter(s => s.status === 'delivered').length,
      totalAmount: filteredOrderSlips.reduce((sum, s) => sum + s.totalAmount, 0)
    };
  };

  const stats = getTotalStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">발주전표 목록</h1>
        <p className="text-gray-600">공급처별 발주 현황을 확인하고 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">전체 발주</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">발주대기</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-500">발주확정</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
          <div className="text-sm text-gray-500">배송중</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          <div className="text-sm text-gray-500">입고완료</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-600">₩{(stats.totalAmount / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-gray-500">총 발주금액</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 상태</option>
              <option value="pending">발주대기</option>
              <option value="confirmed">발주확정</option>
              <option value="shipped">배송중</option>
              <option value="delivered">입고완료</option>
              <option value="cancelled">발주취소</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">공급처</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 공급처</option>
              {mockSuppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
            <input
              type="text"
              placeholder="발주번호, 공급처명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 발주전표 목록 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발주번호</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공급처</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발주일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품수/수량</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발주금액</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예정일/실제일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrderSlips.map((slip) => (
                <tr key={slip.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                         onClick={() => handleViewDetail(slip)}>
                      {slip.orderNumber}
                    </div>
                    {slip.memo && (
                      <div className="text-xs text-gray-500 mt-1">📝 {slip.memo}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{slip.supplierName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{slip.orderDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(slip.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{slip.productCount}종 / {slip.totalQuantity}개</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      ₩{slip.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {slip.expectedDeliveryDate && (
                        <div>예정: {slip.expectedDeliveryDate}</div>
                      )}
                      {slip.actualDeliveryDate && (
                        <div className="text-green-600">실제: {slip.actualDeliveryDate}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{slip.createdBy}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(slip)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        상세
                      </button>
                      {slip.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(slip.id, 'confirmed')}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            확정
                          </button>
                          <button
                            onClick={() => handleCancelOrder(slip.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            취소
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 모달 */}
      {isDetailModalOpen && selectedSlip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">발주전표 상세 - {selectedSlip.orderNumber}</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">공급처</label>
                  <div className="text-sm text-gray-900">{selectedSlip.supplierName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">발주일</label>
                  <div className="text-sm text-gray-900">{selectedSlip.orderDate}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <div>{getStatusBadge(selectedSlip.status)}</div>
                </div>
                {selectedSlip.memo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">메모</label>
                    <div className="text-sm text-gray-900">{selectedSlip.memo}</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">총 상품수</label>
                  <div className="text-sm text-gray-900">{selectedSlip.productCount}종</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">총 수량</label>
                  <div className="text-sm text-gray-900">{selectedSlip.totalQuantity}개</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">총 금액</label>
                  <div className="text-lg font-bold text-blue-600">₩{selectedSlip.totalAmount.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">담당자</label>
                  <div className="text-sm text-gray-900">{selectedSlip.createdBy}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">발주 상품 목록</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">상품명</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">SKU</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">발주수량</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">입고수량</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">단가</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockOrderSlipItems
                      .filter(item => item.orderSlipId === selectedSlip.id)
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.sku}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.orderedQuantity}개</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <span className={item.receivedQuantity === item.orderedQuantity ? 'text-green-600' : 'text-yellow-600'}>
                              {item.receivedQuantity}개
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">₩{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ₩{item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                닫기
              </button>
              {selectedSlip.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedSlip.id, 'confirmed');
                      setIsDetailModalOpen(false);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    발주 확정
                  </button>
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedSlip.id);
                      setIsDetailModalOpen(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    발주 취소
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSlipListPage;
