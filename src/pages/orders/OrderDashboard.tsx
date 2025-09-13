import React, { useState } from 'react';
import { OrderStatus } from '../../models/Order';

interface OrderDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  todayOrders: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
  createdAt: Date;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

const OrderDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');

  const mockStats: OrderDashboardStats = {
    totalOrders: 1247,
    totalRevenue: 156780000,
    avgOrderValue: 125800,
    pendingOrders: 23,
    todayOrders: 18,
    weeklyGrowth: 12.5,
    monthlyGrowth: 8.3
  };

  const mockRecentOrders: RecentOrder[] = [
    {
      id: 'ORD-001',
      customerName: '김철수',
      amount: 150000,
      status: OrderStatus.PENDING,
      createdAt: new Date()
    },
    {
      id: 'ORD-002',
      customerName: '이영희',
      amount: 85000,
      status: OrderStatus.CONFIRMED,
      createdAt: new Date()
    },
    {
      id: 'ORD-003',
      customerName: '박민수',
      amount: 45000,
      status: OrderStatus.SHIPPED,
      createdAt: new Date()
    },
    {
      id: 'ORD-004',
      customerName: '최지혜',
      amount: 120000,
      status: OrderStatus.DELIVERED,
      createdAt: new Date()
    },
    {
      id: 'ORD-005',
      customerName: '정태웅',
      amount: 200000,
      status: OrderStatus.PROCESSING,
      createdAt: new Date()
    }
  ];

  const mockTopProducts: TopProduct[] = [
    { name: '스마트폰 케이스', sales: 156, revenue: 3900000, growth: 15.2 },
    { name: '무선 이어폰', sales: 89, revenue: 8900000, growth: 8.7 },
    { name: '블루투스 스피커', sales: 67, revenue: 10050000, growth: -2.1 },
    { name: '노트북 가방', sales: 45, revenue: 3600000, growth: 23.5 },
    { name: '충전 케이블', sales: 234, revenue: 5850000, growth: 12.8 }
  ];

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

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
      case OrderStatus.PROCESSING: return 'bg-purple-100 text-purple-800';
      case OrderStatus.SHIPPED: return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">주문 현황 대시보드</h1>
            <p className="text-gray-600">실시간 주문 현황과 매출 통계를 확인합니다.</p>
          </div>
          <div className="flex space-x-2">
            {(['today', 'week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 text-sm rounded-md ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'today' ? '오늘' : 
                 period === 'week' ? '이번 주' :
                 period === 'month' ? '이번 달' : '올해'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">총 주문 수</p>
              <p className="text-3xl font-bold">{mockStats.totalOrders.toLocaleString()}</p>
              <p className="text-blue-100 text-sm mt-1">오늘 {mockStats.todayOrders}건</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">총 매출액</p>
              <p className="text-3xl font-bold">₩{(mockStats.totalRevenue / 100000000).toFixed(1)}억</p>
              <p className="text-green-100 text-sm mt-1">
                +{mockStats.weeklyGrowth}% 이번 주
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">평균 주문금액</p>
              <p className="text-3xl font-bold">₩{(mockStats.avgOrderValue / 1000).toFixed(0)}K</p>
              <p className="text-purple-100 text-sm mt-1">
                +{mockStats.monthlyGrowth}% 이번 달
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">처리 대기</p>
              <p className="text-3xl font-bold">{mockStats.pendingOrders}</p>
              <p className="text-orange-100 text-sm mt-1">즉시 처리 필요</p>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 최근 주문 */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">최근 주문</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockRecentOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-blue-600">{order.id}</span>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{order.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {order.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <button className="w-full text-center text-blue-600 hover:text-blue-800 text-sm">
              모든 주문 보기 →
            </button>
          </div>
        </div>

        {/* 인기 상품 */}
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">인기 상품</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockTopProducts.map((product, index) => (
              <div key={product.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales}개 판매</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₩{(product.revenue / 10000).toFixed(0)}만</p>
                    <p className={`text-sm ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.growth >= 0 ? '+' : ''}{product.growth}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <button className="w-full text-center text-blue-600 hover:text-blue-800 text-sm">
              상품 분석 보기 →
            </button>
          </div>
        </div>
      </div>

      {/* 주문 상태별 현황 */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">주문 처리 현황</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { status: '대기중', count: 23, color: 'yellow', icon: '' },
            { status: '확인됨', count: 45, color: 'blue', icon: '' },
            { status: '처리중', count: 67, color: 'purple', icon: '' },
            { status: '배송중', count: 89, color: 'indigo', icon: '' },
            { status: '완료', count: 234, color: 'green', icon: '' },
            { status: '취소', count: 12, color: 'red', icon: '' }
          ].map((item) => (
            <div key={item.status} className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{item.count}</div>
              <div className="text-sm text-gray-600">{item.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
          <div className="text-3xl text-blue-500 mb-3"></div>
          <h3 className="font-medium text-gray-900 mb-2">신규 주문 등록</h3>
          <p className="text-sm text-gray-600">고객을 위한 수동 주문을 생성합니다</p>
        </div>

        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors">
          <div className="text-3xl text-green-500 mb-3"></div>
          <h3 className="font-medium text-gray-900 mb-2">매출 리포트</h3>
          <p className="text-sm text-gray-600">상세한 매출 분석 보고서를 확인합니다</p>
        </div>

        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-colors">
          <div className="text-3xl text-purple-500 mb-3"></div>
          <h3 className="font-medium text-gray-900 mb-2">주문 설정</h3>
          <p className="text-sm text-gray-600">주문 처리 규칙과 알림을 설정합니다</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;
