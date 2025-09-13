import React from 'react';
import { Order } from '../../types/database';
import { formatDate, formatPrice, getOrderStatusText, getOrderStatusClass, getPaymentStatusText, getPaymentStatusClass } from '../../utils/orderUtils';

interface OrderTableProps {
  orders: Order[];
  sortBy: 'createdAt' | 'totalAmount' | 'customerName' | 'status';
  sortOrder: 'asc' | 'desc';
  onSort: (sortBy: 'createdAt' | 'totalAmount' | 'customerName' | 'status') => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  sortBy,
  sortOrder,
  onSort
}) => {
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('createdAt')}
              >
                주문일시 {getSortIcon('createdAt')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문번호
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('customerName')}
              >
                고객명 {getSortIcon('customerName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                고객정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문상품
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('totalAmount')}
              >
                주문금액 {getSortIcon('totalAmount')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제상태
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort('status')}
              >
                주문상태 {getSortIcon('status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                송장번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order: any, index: number) => (
              <tr key={order.id ?? order.orderNumber ?? index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                    {order.orderNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{order.customerPhone}</div>
                  <div>{order.customerEmail}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {(order.items || []).map((item: any, index: number) => {
                    const key = item.id || `${item.productId ?? 'p'}-${item.variantId ?? 'v'}-${index}`;
                    const price = item.unitPrice ?? item.price ?? 0;
                    return (
                      <div key={key} className={index > 0 ? 'mt-1' : ''}>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-gray-500">
                          수량: {item.quantity ?? 0}개 | 단가: {formatPrice(price)}
                        </div>
                      </div>
                    );
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-semibold">{formatPrice(order.totalAmount)}</div>
                  <div className="text-gray-500 text-xs">
                    {order.paymentMethod}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusClass(order.paymentStatus || '')}`}>
                    {getPaymentStatusText(order.paymentStatus || '')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusClass(order.status)}`}>
                    {getOrderStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.trackingNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-blue-600 hover:text-blue-900 mr-2"
                    onClick={() => {/* TODO: 상세보기 */ }}
                  >
                    상세
                  </button>
                  <button
                    className="text-green-600 hover:text-green-900 mr-2"
                    onClick={() => {/* TODO: 수정 */ }}
                  >
                    수정
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => {/* TODO: 삭제 */ }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          조건에 맞는 주문이 없습니다.
        </div>
      )}
    </div>
  );
};

export default OrderTable;
