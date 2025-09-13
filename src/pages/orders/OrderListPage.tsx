import React, { useState, useMemo, useEffect } from 'react';
import { Container, Card, Button, Stack } from '../../design-system';
import { mockOrders } from '../../data/mockOrders';
import { filterOrders, sortOrders, downloadOrdersCSV, getOrderStats } from '../../utils/orderUtils';
import OrderFilters from '../../components/orders/OrderFilters';
import OrderTable from '../../components/orders/OrderTable';
import Pagination from '../../components/common/Pagination';
import { GridRow, GridCol } from '../../design-system/Grid';

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
    <Container maxWidth="full" padding="md" className="min-h-screen bg-gray-50">
      {/* 헤더 및 액션바 */}
      <Card padding="lg" className="mb-6 shadow-sm">
        <Stack direction="row" justify="between" align="center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
            <p className="text-gray-600 mt-2">
              전체 {stats.total}건의 주문 <span className="text-blue-600 font-bold">(총 매출: {stats.totalRevenue.toLocaleString()}원)</span>
            </p>
          </div>
          <Stack direction="row" gap={3}>
            <Button variant="outline" className="border-gray-300" onClick={handleExportCSV}>CSV 내보내기</Button>
            <Button variant="primary" className="px-6">주문 등록</Button>
          </Stack>
        </Stack>
      </Card>

      {/* 통계 카드 */}
      <GridRow gutter={16} className="mb-6">
        <GridCol span={6} md={3}>
          <Card padding="md" className="shadow">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">{stats.PENDING}</div>
              <div className="ml-2 text-sm text-gray-600">대기중</div>
            </div>
          </Card>
        </GridCol>
        <GridCol span={6} md={3}>
          <Card padding="md" className="shadow">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">{stats.PROCESSING}</div>
              <div className="ml-2 text-sm text-gray-600">처리중</div>
            </div>
          </Card>
        </GridCol>
        <GridCol span={6} md={3}>
          <Card padding="md" className="shadow">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-600">{stats.SHIPPED}</div>
              <div className="ml-2 text-sm text-gray-600">배송중</div>
            </div>
          </Card>
        </GridCol>
        <GridCol span={6} md={3}>
          <Card padding="md" className="shadow">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">{stats.DELIVERED}</div>
              <div className="ml-2 text-sm text-gray-600">배송완료</div>
            </div>
          </Card>
        </GridCol>
      </GridRow>

      {/* 필터 영역 */}
      <Card padding="lg" className="mb-6 shadow-sm">
        <GridRow gutter={16}>
          <GridCol span={6} md={3}>
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
          </GridCol>
        </GridRow>
      </Card>

      {/* 주문 테이블 */}
      <Card padding="none" className="overflow-hidden shadow-sm">
        <OrderTable
          orders={currentOrders}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Stack direction="row" gap={2} align="center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </Stack>
        </div>
      )}
    </Container>
  );
};

export default OrderListPage;
