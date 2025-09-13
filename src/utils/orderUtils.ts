
import { IOrder } from '@/models/Order';
import { OrderStatus } from '../types/database';

// 날짜 포맷팅
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 가격 포맷팅
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

// 주문 상태별 한글 표시
export const getOrderStatusText = (status: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '대기중',
    [OrderStatus.CONFIRMED]: '확인됨',
    [OrderStatus.PROCESSING]: '처리중',
    [OrderStatus.SHIPPED]: '배송중',
    [OrderStatus.DELIVERED]: '배송완료',
    [OrderStatus.CANCELLED]: '취소됨'
  };
  
  return statusMap[status] || status;
};

// 주문 상태별 CSS 클래스
export const getOrderStatusClass = (status: OrderStatus): string => {
  const statusClassMap: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
    [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
    [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
    [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
  };
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

// 결제 상태별 한글 표시
export const getPaymentStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': '결제대기',
    'paid': '결제완료',
    'cancelled': '결제취소',
    'refunded': '환불완료'
  };
  
  return statusMap[status] || status;
};

// 결제 상태별 CSS 클래스
export const getPaymentStatusClass = (status: string): string => {
  const statusClassMap: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'refunded': 'bg-gray-100 text-gray-800'
  };
  
  return statusClassMap[status] || 'bg-gray-100 text-gray-800';
};

// 주문 필터링 함수
export const filterOrders = (
  orders: IOrder[] = [],
  filters: {
    search?: string;
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }
): IOrder[] => {
  return (orders || []).filter(order => {
    // 검색어 필터링 (주문ID, 고객명, 고객전화번호, 상품명)
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm) ||
        (order.customerPhone && order.customerPhone.includes(searchTerm)) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm)) ||
        (order.items || []).some((item: any) => 
          (item.productName || '').toLowerCase().includes(searchTerm)
        );
      
      if (!matchesSearch) return false;
    }
    
    // 주문 상태 필터링
    if (filters.status && filters.status !== 'all') {
      if (order.status !== filters.status) return false;
    }
    
    // 결제 방법 필터링
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      if (order.paymentMethod !== filters.paymentMethod) return false;
    }
    
    // 결제 상태 필터링
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      if (order.paymentStatus !== filters.paymentStatus) return false;
    }
    
    // 날짜 범위 필터링
    if (filters.startDate || filters.endDate) {
      const orderDate = typeof order.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt;
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (orderDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // 하루 종료 시점까지
        if (orderDate > endDate) return false;
      }
    }
    
    return true;
  });
};

// 주문 정렬 함수
export const sortOrders = (
  orders: IOrder[] = [],
  sortBy: 'createdAt' | 'totalAmount' | 'customerName' | 'status',
  sortOrder: 'asc' | 'desc'
): IOrder[] => {
  return [...(orders || [])].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'createdAt':
        const aDate = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
        const bDate = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
        comparison = aDate.getTime() - bDate.getTime();
        break;
      case 'totalAmount':
        comparison = a.totalAmount - b.totalAmount;
        break;
      case 'customerName':
        comparison = a.customerName.localeCompare(b.customerName, 'ko-KR');
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        return 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

// 주문 통계 계산
export const getOrderStats = (orders: IOrder[] = []) => {
  const stats = {
    total: (orders || []).length,
    [OrderStatus.PENDING]: 0,
    [OrderStatus.CONFIRMED]: 0,
    [OrderStatus.PROCESSING]: 0,
    [OrderStatus.SHIPPED]: 0,
    [OrderStatus.DELIVERED]: 0,
    [OrderStatus.CANCELLED]: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  };
  
  (orders || []).forEach(order => {
    try {
      (stats as any)[order.status] = ((stats as any)[order.status] || 0) + 1;
    } catch (e) {
      // ignore unknown statuses
    }
    stats.totalRevenue += (order.totalAmount || 0);
  });
  
  stats.averageOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;
  
  return stats;
};

// CSV 내보내기를 위한 데이터 변환
export const convertOrdersToCSV = (orders: IOrder[]): string => {
  const headers = [
    '주문번호', '주문일시', '고객명', '고객전화번호', '고객이메일',
    '배송주소', '결제방법', '결제상태', '주문상태',
    '상품수량', '총상품금액', '송장번호', '메모'
  ];
  
  const rows = orders.map(order => [
    order.orderNumber,
    formatDate(order.createdAt),
    order.customerName,
    order.customerPhone || '',
    order.customerEmail || '',
    order.shippingAddress || '',
    order.paymentMethod || '',
    getPaymentStatusText(order.paymentStatus || ''),
    getOrderStatusText(order.status),
    order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    formatPrice(order.totalAmount),
    order.trackingNumber || '',
    order.notes || ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\\n');
  
  return csvContent;
};

// CSV 다운로드
export const downloadOrdersCSV = (orders: IOrder[], filename: string = 'orders.csv') => {
  const csvContent = convertOrdersToCSV(orders);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
