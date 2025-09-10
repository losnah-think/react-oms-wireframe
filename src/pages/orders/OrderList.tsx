import React from 'react';
import { Order, OrderStatus } from '../../models/Order';

const OrderList: React.FC = () => {
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | ''>('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading] = React.useState(false);
  const [error] = React.useState<string | null>(null);
  
  // Mock data
  const mockOrders: Order[] = [
    new Order({
      id: 'ORD-001',
      customerId: 'CUST-001',
      customerName: '김철수',
      status: OrderStatus.PENDING,
      totalAmount: 50000,
      items: [
        { id: 'ITEM-001-001', orderId: 'ORD-001', productId: '1', productName: '베이직 티셔츠', quantity: 2, unitPrice: 25000, totalPrice: 50000 }
      ]
    }),
    new Order({
      id: 'ORD-002',
      customerId: 'CUST-002',
      customerName: '이영희',
      status: OrderStatus.CONFIRMED,
      totalAmount: 45000,
      items: [
        { id: 'ITEM-002-001', orderId: 'ORD-002', productId: '2', productName: '청바지', quantity: 1, unitPrice: 45000, totalPrice: 45000 }
      ]
    })
  ];

  const filteredOrders = React.useMemo(() => {
    return mockOrders.filter(order => {
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [statusFilter, searchTerm, mockOrders]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
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

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return '대기중';
      case OrderStatus.CONFIRMED:
        return '주문확인';
      case OrderStatus.PROCESSING:
        return '처리중';
      case OrderStatus.SHIPPED:
        return '배송중';
      case OrderStatus.DELIVERED:
        return '배송완료';
      case OrderStatus.CANCELLED:
        return '취소됨';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
          <p className="text-gray-600">전체 {mockOrders.length}개 주문</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="주문번호 또는 고객명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">모든 상태</option>
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>{getStatusText(status)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  주문상품
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {order.createdAt.toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.map((item, index) => (
                        <div key={index} className="mb-1 last:mb-0">
                          {item.productName} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.getFormattedTotal()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.getStatusBadgeColor()}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        상세보기
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        편집
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl text-gray-300 mb-4 block">□</span>
          <p className="text-gray-500">검색 조건에 맞는 주문이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default OrderList;
