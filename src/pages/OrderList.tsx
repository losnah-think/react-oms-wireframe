import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, IOrderItem } from '../models/Order';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

interface DateRange {
  start: string;
  end: string;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onUpdateStatus }) => {
  if (!isOpen || !order) return null;

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING: return '대기중';
      case OrderStatus.CONFIRMED: return '주문확인';
      case OrderStatus.PROCESSING: return '처리중';
      case OrderStatus.SHIPPED: return '배송중';
      case OrderStatus.DELIVERED: return '배송완료';
      case OrderStatus.CANCELLED: return '취소됨';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">주문 상세 정보</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-3">주문 정보</h3>
            <div className="space-y-2">
              <p><span className="font-medium">주문번호:</span> {order.id}</p>
              <p><span className="font-medium">주문일시:</span> {order.createdAt.toLocaleString('ko-KR')}</p>
              <p><span className="font-medium">수정일시:</span> {order.updatedAt.toLocaleString('ko-KR')}</p>
              <div className="flex items-center">
                <span className="font-medium mr-2">상태:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.getStatusBadgeColor()}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">고객 정보</h3>
            <div className="space-y-2">
              <p><span className="font-medium">고객명:</span> {order.customerName}</p>
              <p><span className="font-medium">고객ID:</span> {order.customerId}</p>
              {order.shippingAddress && (
                <p><span className="font-medium">배송주소:</span> {order.shippingAddress}</p>
              )}
              {order.notes && (
                <p><span className="font-medium">주문메모:</span> {order.notes}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">주문 상품</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">상품명</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">단가</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">수량</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">소계</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.unitPrice.toLocaleString()}원</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}개</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.totalPrice.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">총 주문금액:</td>
                  <td className="px-4 py-2 text-sm font-bold text-blue-600">{order.getFormattedTotal()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex space-x-2">
            <select
              onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={order.status}
            >
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{getStatusText(status)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderManagementPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Mock data
  const mockOrders: Order[] = [
    new Order({
      id: 'ORD-001',
      customerId: 'CUST-001',
      customerName: '김철수',
      status: OrderStatus.PENDING,
      totalAmount: 150000,
      createdAt: new Date('2024-09-08'),
      shippingAddress: '서울시 강남구 테헤란로 123',
      items: [
        { id: 'ITEM-001-001', orderId: 'ORD-001', productId: '1', productName: '스마트폰 케이스', quantity: 2, unitPrice: 25000, totalPrice: 50000 },
        { id: 'ITEM-001-002', orderId: 'ORD-001', productId: '2', productName: '무선 이어폰', quantity: 1, unitPrice: 100000, totalPrice: 100000 }
      ]
    }),
    new Order({
      id: 'ORD-002',
      customerId: 'CUST-002',
      customerName: '이영희',
      status: OrderStatus.CONFIRMED,
      totalAmount: 85000,
      createdAt: new Date('2024-09-09'),
      shippingAddress: '부산시 해운대구 센텀로 456',
      items: [
        { id: 'ITEM-002-001', orderId: 'ORD-002', productId: '3', productName: '티셔츠', quantity: 2, unitPrice: 30000, totalPrice: 60000 },
        { id: 'ITEM-002-002', orderId: 'ORD-002', productId: '4', productName: '청바지', quantity: 1, unitPrice: 25000, totalPrice: 25000 }
      ]
    }),
    new Order({
      id: 'ORD-003',
      customerId: 'CUST-003',
      customerName: '박민수',
      status: OrderStatus.SHIPPED,
      totalAmount: 45000,
      createdAt: new Date('2024-09-07'),
      shippingAddress: '대구시 중구 동성로 789',
      notes: '문 앞에 배치해 주세요',
      items: [
        { id: 'ITEM-003-001', orderId: 'ORD-003', productId: '5', productName: '운동화', quantity: 1, unitPrice: 45000, totalPrice: 45000 }
      ]
    }),
    new Order({
      id: 'ORD-004',
      customerId: 'CUST-004',
      customerName: '최지혜',
      status: OrderStatus.DELIVERED,
      totalAmount: 120000,
      createdAt: new Date('2024-09-05'),
      shippingAddress: '광주시 서구 상무대로 321',
      items: [
        { id: 'ITEM-004-001', orderId: 'ORD-004', productId: '6', productName: '노트북 가방', quantity: 1, unitPrice: 80000, totalPrice: 80000 },
        { id: 'ITEM-004-002', orderId: 'ORD-004', productId: '7', productName: '마우스 패드', quantity: 2, unitPrice: 20000, totalPrice: 40000 }
      ]
    }),
    new Order({
      id: 'ORD-005',
      customerId: 'CUST-005',
      customerName: '정태웅',
      status: OrderStatus.PROCESSING,
      totalAmount: 200000,
      createdAt: new Date('2024-09-06'),
      shippingAddress: '인천시 연수구 컨벤시아대로 654',
      items: [
        { id: 'ITEM-005-001', orderId: 'ORD-005', productId: '8', productName: '블루투스 스피커', quantity: 1, unitPrice: 150000, totalPrice: 150000 },
        { id: 'ITEM-005-002', orderId: 'ORD-005', productId: '9', productName: '충전 케이블', quantity: 2, unitPrice: 25000, totalPrice: 50000 }
      ]
    }),
    new Order({
      id: 'ORD-006',
      customerId: 'CUST-006',
      customerName: '한소영',
      status: OrderStatus.CANCELLED,
      totalAmount: 65000,
      createdAt: new Date('2024-09-04'),
      notes: '고객 변심으로 취소',
      items: [
        { id: 'ITEM-006-001', orderId: 'ORD-006', productId: '10', productName: '화장품 세트', quantity: 1, unitPrice: 65000, totalPrice: 65000 }
      ]
    })
  ];

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    alert(`주문 ${orderId}의 상태가 ${getStatusText(newStatus)}로 변경되었습니다.`);
    setIsModalOpen(false);
  };

  const handleOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end) {
        const orderDate = order.createdAt;
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        matchesDateRange = orderDate >= startDate && orderDate <= endDate;
      }
      
      return matchesStatus && matchesSearch && matchesDateRange;
    });
  }, [statusFilter, searchTerm, dateRange]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const getOrderStats = () => {
    return {
      total: mockOrders.length,
      pending: mockOrders.filter(o => o.status === OrderStatus.PENDING).length,
      confirmed: mockOrders.filter(o => o.status === OrderStatus.CONFIRMED).length,
      processing: mockOrders.filter(o => o.status === OrderStatus.PROCESSING).length,
      shipped: mockOrders.filter(o => o.status === OrderStatus.SHIPPED).length,
      delivered: mockOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
      cancelled: mockOrders.filter(o => o.status === OrderStatus.CANCELLED).length,
      totalAmount: mockOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    };
  };

  const stats = getOrderStats();

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING: return '대기중';
      case OrderStatus.CONFIRMED: return '주문확인';
      case OrderStatus.PROCESSING: return '처리중';
      case OrderStatus.SHIPPED: return '배송중';
      case OrderStatus.DELIVERED: return '배송완료';
      case OrderStatus.CANCELLED: return '취소됨';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">주문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">오류가 발생했습니다: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">주문 관리</h1>
        <p className="text-gray-600">전체 주문 현황을 관리하고 모니터링합니다.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">전체 주문</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">대기중</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-500">주문확인</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.processing}</div>
          <div className="text-sm text-gray-500">처리중</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-600">{stats.shipped}</div>
          <div className="text-sm text-gray-500">배송중</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          <div className="text-sm text-gray-500">배송완료</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-500">취소됨</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-lg font-bold text-emerald-600">₩{(stats.totalAmount / 1000000).toFixed(1)}M</div>
          <div className="text-sm text-gray-500">총 매출</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
            <input
              type="text"
              placeholder="주문번호 또는 고객명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 상태</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{getStatusText(status)}</option>
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
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            주문 목록 ({filteredOrders.length}개)
          </h2>
          <div className="text-sm text-gray-500">
            페이지 {currentPage} / {totalPages}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문정보</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객정보</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문상품</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문금액</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배송주소</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                           onClick={() => handleOrderDetail(order)}>
                        {order.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.createdAt.toLocaleDateString('ko-KR')} {order.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerId}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {order.items.length === 1 ? (
                        <div>{order.items[0].productName} × {order.items[0].quantity}</div>
                      ) : (
                        <div>
                          <div>{order.items[0].productName} × {order.items[0].quantity}</div>
                          <div className="text-xs text-gray-500">외 {order.items.length - 1}개 상품</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {order.getFormattedTotal()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.getStatusBadgeColor()}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 max-w-48 truncate">
                      {order.shippingAddress || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleOrderDetail(order)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        상세
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        수정
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              총 {filteredOrders.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredOrders.length)}개 표시
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <p className="text-gray-500">검색 조건에 맞는 주문이 없습니다.</p>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default OrderManagementPage;
