import React from 'react';
import { Container, Card, Button, Badge } from '../../design-system';

const Dashboard: React.FC = () => {
  // 와이어프레임용 mock 데이터
  const mockStats = {
    totalOrders: 1234,
    totalProducts: 856,
    totalRevenue: 12500000,
    averageOrderValue: 75000
  };

  const mockRecentOrders = [
    { id: '001', customerName: '김철수', amount: 45000, status: '완료' },
    { id: '002', customerName: '박영희', amount: 32000, status: '배송중' },
    { id: '003', customerName: '이민수', amount: 28000, status: '확인됨' },
    { id: '004', customerName: '정수정', amount: 67000, status: '완료' },
    { id: '005', customerName: '홍길동', amount: 51000, status: '처리중' }
  ];

  return (
    <Container maxWidth="full" padding="md" className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">Order Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card padding="md" className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 주문</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalOrders.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">주문</span>
            </div>
          </div>
        </Card>

        <Card padding="md" className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 상품</p>
              <p className="text-2xl font-bold text-gray-900">{mockStats.totalProducts.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs font-bold">상품</span>
            </div>
          </div>
        </Card>

        <Card padding="md" className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 매출액</p>
              <p className="text-2xl font-bold text-gray-900">₩{(mockStats.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-xs font-bold">매출</span>
            </div>
          </div>
        </Card>

        <Card padding="md" className="shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 주문액</p>
              <p className="text-2xl font-bold text-gray-900">₩{Math.round(mockStats.averageOrderValue / 1000)}K</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xs font-bold">평균</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card padding="md" className="shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">최근 주문</h3>
          <div className="space-y-4">
            {mockRecentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">#{order.id}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">주문 #{order.id}</p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₩{order.amount.toLocaleString()}</p>
                  <Badge variant="success" size="small">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Popular Products */}
        <Card padding="md" className="shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">인기 상품</h3>
          <div className="space-y-4">
            {[
              { name: '스마트폰 케이스', sales: 245 },
              { name: '무선 이어폰', sales: 198 },
              { name: '노트북 스탠드', sales: 156 },
              { name: '마우스 패드', sales: 134 },
              { name: 'USB 케이블', sales: 89 }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-xs font-medium">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                </div>
                <span className="text-sm text-gray-500">{product.sales}개 판매</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default Dashboard;
