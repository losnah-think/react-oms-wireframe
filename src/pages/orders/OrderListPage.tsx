import React, { useState, useMemo, useEffect } from 'react';
import { mockOrders } from '../../data/mockOrders';
import { filterOrders, sortOrders, downloadOrdersCSV, getOrderStats } from '../../utils/orderUtils';
import OrderFilters from '../../components/orders/OrderFilters';
import OrderTable from '../../components/orders/OrderTable';
import Pagination from '../../components/common/Pagination';

const OrderListPage: React.FC = () => {
  // 필터 상태
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 정렬 상태
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalAmount' | 'customerName' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 필터링 및 정렬된 주문 목록
  const filteredAndSortedOrders = useMemo(() => {
    const filtered = filterOrders(mockOrders, {
      search,
      status,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate
    });
    
    return sortOrders(filtered, sortBy, sortOrder);
  }, [search, status, paymentMethod, paymentStatus, startDate, endDate, sortBy, sortOrder]);

  // 페이지네이션을 위한 현재 페이지 주문들
  const currentOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedOrders.slice(startIndex, endIndex);
  }, [filteredAndSortedOrders, currentPage]);

  // 총 페이지 수
  const totalPages = useMemo(() => Math.ceil(filteredAndSortedOrders.length / itemsPerPage), [filteredAndSortedOrders.length, itemsPerPage]);

  // 통계 정보
  const stats = useMemo(() => getOrderStats(filteredAndSortedOrders), [filteredAndSortedOrders]);

  // 페이지 수가 변경될 때 현재 페이지를 조정
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // 정렬 변경 핸들러
  const handleSort = (newSortBy: 'createdAt' | 'totalAmount' | 'customerName' | 'status') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // CSV 다운로드 핸들러
  const handleExportCSV = () => {
    const filename = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    downloadOrdersCSV(filteredAndSortedOrders, filename);
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
          <p className="text-gray-600 mt-2">
            전체 {stats.total}건의 주문 (총 매출: {stats.totalRevenue.toLocaleString()}원)
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            CSV 내보내기
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
            주문 등록
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-gray-900">{stats.PENDING}</div>
            <div className="ml-2 text-sm text-gray-600">대기중</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">{stats.PROCESSING}</div>
            <div className="ml-2 text-sm text-gray-600">처리중</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-purple-600">{stats.SHIPPED}</div>
            <div className="ml-2 text-sm text-gray-600">배송중</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-green-600">{stats.DELIVERED}</div>
            <div className="ml-2 text-sm text-gray-600">배송완료</div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <OrderFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* 테이블 */}
      <OrderTable
        orders={currentOrders}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </div>
  );
};

export default OrderListPage;
