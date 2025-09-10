import React, { useState } from 'react';
import { Order, OrderStatus } from '../../models/Order';

interface OrderAnalyticsProps {
  orders: Order[];
}

interface SalesMetric {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  growth: number;
}

interface StatusDistribution {
  status: OrderStatus;
  count: number;
  percentage: number;
  revenue: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({ orders = [] }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'orders' | 'revenue' | 'customers'>('revenue');

  // Mock 분석 데이터
  const mockSalesData: SalesMetric[] = [
    { period: '2024-01', totalOrders: 156, totalRevenue: 15600000, avgOrderValue: 100000, growth: 15.2 },
    { period: '2024-02', totalOrders: 189, totalRevenue: 20700000, avgOrderValue: 109500, growth: 21.2 },
    { period: '2024-03', totalOrders: 234, totalRevenue: 28080000, avgOrderValue: 120000, growth: 35.6 },
    { period: '2024-04', totalOrders: 198, totalRevenue: 23760000, avgOrderValue: 120000, growth: -15.4 },
    { period: '2024-05', totalOrders: 267, totalRevenue: 34710000, avgOrderValue: 130000, growth: 34.8 },
    { period: '2024-06', totalOrders: 301, totalRevenue: 42140000, avgOrderValue: 140000, growth: 12.7 }
  ];

  const mockStatusDistribution: StatusDistribution[] = [
    { status: OrderStatus.DELIVERED, count: 1247, percentage: 62.4, revenue: 156780000 },
    { status: OrderStatus.SHIPPED, count: 234, percentage: 11.7, revenue: 29340000 },
    { status: OrderStatus.PROCESSING, count: 189, percentage: 9.5, revenue: 23625000 },
    { status: OrderStatus.CONFIRMED, count: 156, percentage: 7.8, revenue: 19500000 },
    { status: OrderStatus.PENDING, count: 123, percentage: 6.2, revenue: 15375000 },
    { status: OrderStatus.CANCELLED, count: 48, percentage: 2.4, revenue: 0 }
  ];

  const mockPaymentMethods: PaymentMethodStats[] = [
    { method: '신용카드', count: 1456, percentage: 58.4, totalAmount: 182000000 },
    { method: '계좌이체', count: 567, percentage: 22.7, totalAmount: 70875000 },
    { method: '무통장입금', count: 234, percentage: 9.4, totalAmount: 29250000 },
    { method: '카카오페이', count: 189, percentage: 7.6, totalAmount: 23625000 },
    { method: '네이버페이', count: 45, percentage: 1.8, totalAmount: 5625000 }
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
      case OrderStatus.PENDING: return '#FEF3C7';
      case OrderStatus.CONFIRMED: return '#DBEAFE';
      case OrderStatus.PROCESSING: return '#E9D5FF';
      case OrderStatus.SHIPPED: return '#C7D2FE';
      case OrderStatus.DELIVERED: return '#D1FAE5';
      case OrderStatus.CANCELLED: return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 분석</h1>
            <p className="text-gray-600">상세한 주문 데이터 분석과 인사이트를 제공합니다.</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
              <option value="90d">최근 90일</option>
              <option value="1y">최근 1년</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="orders">주문 수</option>
              <option value="revenue">매출액</option>
              <option value="customers">고객 수</option>
            </select>
          </div>
        </div>
      </div>

      {/* 매출 트렌드 차트 */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">매출 트렌드</h2>
        <div className="grid grid-cols-6 gap-4">
          {mockSalesData.map((data, index) => (
            <div key={data.period} className="text-center">
              <div 
                className="bg-blue-500 rounded-t mx-auto mb-2"
                style={{ 
                  height: `${(data.totalRevenue / Math.max(...mockSalesData.map(d => d.totalRevenue))) * 200}px`,
                  width: '40px'
                }}
              ></div>
              <div className="text-xs text-gray-600 mb-1">{data.period}</div>
              <div className="text-sm font-medium">₩{(data.totalRevenue / 10000000).toFixed(1)}천만</div>
              <div className={`text-xs ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.growth >= 0 ? '+' : ''}{data.growth}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 주문 상태별 분포 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">주문 상태별 분포</h2>
          <div className="space-y-4">
            {mockStatusDistribution.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {getStatusText(item.status)}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.count}건</div>
                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 수단별 통계 */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">결제 수단별 통계</h2>
          <div className="space-y-4">
            {mockPaymentMethods.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-yellow-500' : 'bg-pink-500'
                  }`}>
                    {method.method.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{method.method}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">₩{(method.totalAmount / 10000000).toFixed(1)}천만</div>
                  <div className="text-xs text-gray-500">{method.count}건 ({method.percentage}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 상세 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">평균 주문 금액</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">₩125,800</div>
            <div className="text-sm text-gray-500 mb-4">지난 30일 평균</div>
            <div className="flex justify-center space-x-4 text-xs">
              <div className="text-center">
                <div className="text-gray-900 font-medium">₩118,400</div>
                <div className="text-gray-500">이전 기간</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-medium">+6.3%</div>
                <div className="text-gray-500">증가율</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">주문 전환율</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">87.3%</div>
            <div className="text-sm text-gray-500 mb-4">장바구니→주문 완료</div>
            <div className="flex justify-center space-x-4 text-xs">
              <div className="text-center">
                <div className="text-gray-900 font-medium">85.1%</div>
                <div className="text-gray-500">이전 기간</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-medium">+2.2%p</div>
                <div className="text-gray-500">개선</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">배송 소요 시간</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">2.3일</div>
            <div className="text-sm text-gray-500 mb-4">평균 배송 기간</div>
            <div className="flex justify-center space-x-4 text-xs">
              <div className="text-center">
                <div className="text-gray-900 font-medium">2.7일</div>
                <div className="text-gray-500">이전 기간</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-medium">-0.4일</div>
                <div className="text-gray-500">단축</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 시간대별 주문 패턴 */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">시간대별 주문 패턴</h2>
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 24 }, (_, i) => {
            const hour = i;
            const orderCount = Math.floor(Math.random() * 50) + 10;
            const maxOrders = 60;
            return (
              <div key={hour} className="text-center">
                <div 
                  className="bg-blue-500 rounded-t mx-auto mb-2"
                  style={{ 
                    height: `${(orderCount / maxOrders) * 80}px`,
                    width: '20px'
                  }}
                ></div>
                <div className="text-xs text-gray-600">{hour}시</div>
                <div className="text-xs text-gray-900 font-medium">{orderCount}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          가장 활발한 시간대: 오후 2시~4시 (평균 45건/시간)
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;
