import React, { useState } from 'react';

interface ShoppingMallIntegration {
  id: string;
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  lastSync?: string;
  productCount: number;
  status: 'active' | 'inactive' | 'error';
  features: string[];
}

interface ProductImportStats {
  totalProducts: number;
  successCount: number;
  failureCount: number;
  lastImportDate: string;
}

const ExternalProductImportPage: React.FC = () => {
  const [expandedMall, setExpandedMall] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<Record<string, number>>({});

  const shoppingMalls: ShoppingMallIntegration[] = [
    {
      id: 'makeshop',
      name: '메이크샵',
      icon: '🏪',
      description: '메이크샵 쇼핑몰 플랫폼에서 상품을 가져옵니다',
      isConnected: true,
      lastSync: '2025-01-15 14:30',
      productCount: 1247,
      status: 'active',
      features: ['실시간 동기화', '재고 관리', '가격 동기화', '카테고리 매핑']
    },
    {
      id: 'cafe24',
      name: '카페24',
      icon: '☕',
      description: '카페24 쇼핑몰 플랫폼에서 상품을 가져옵니다',
      isConnected: true,
      lastSync: '2025-01-15 12:15',
      productCount: 892,
      status: 'active',
      features: ['상품 정보 동기화', '주문 연동', '재고 실시간 반영']
    },
    {
      id: 'wemakeprice',
      name: '위메프',
      icon: '💰',
      description: '위메프 오픈마켓에서 상품을 가져옵니다',
      isConnected: false,
      lastSync: undefined,
      productCount: 0,
      status: 'inactive',
      features: ['대량 상품 등록', '프로모션 연동', '정산 관리']
    },
    {
      id: 'godo',
      name: '고도몰5',
      icon: '🏢',
      description: '고도몰5 쇼핑몰 플랫폼에서 상품을 가져옵니다',
      isConnected: true,
      lastSync: '2025-01-15 10:45',
      productCount: 456,
      status: 'error',
      features: ['상품 관리', '주문 처리', '고객 관리', 'SEO 최적화']
    },
    {
      id: 'naver',
      name: '네이버 스마트스토어',
      icon: '🛍️',
      description: '네이버 스마트스토어에서 상품을 가져옵니다',
      isConnected: true,
      lastSync: '2025-01-15 13:20',
      productCount: 678,
      status: 'active',
      features: ['네이버 쇼핑 연동', '스마트스토어 관리', '광고 연동']
    }
  ];

  const [importStats] = useState<Record<string, ProductImportStats>>({
    makeshop: {
      totalProducts: 1247,
      successCount: 1198,
      failureCount: 49,
      lastImportDate: '2025-01-15 14:30'
    },
    cafe24: {
      totalProducts: 892,
      successCount: 876,
      failureCount: 16,
      lastImportDate: '2025-01-15 12:15'
    },
    naver: {
      totalProducts: 678,
      successCount: 667,
      failureCount: 11,
      lastImportDate: '2025-01-15 13:20'
    }
  });

  const toggleAccordion = (mallId: string) => {
    setExpandedMall(expandedMall === mallId ? null : mallId);
  };

  const handleConnect = (mallId: string) => {
    alert(`${shoppingMalls.find(m => m.id === mallId)?.name} 연결을 시작합니다.`);
  };

  const handleImport = (mallId: string) => {
    const mall = shoppingMalls.find(m => m.id === mallId);
    if (!mall?.isConnected) {
      alert('먼저 쇼핑몰을 연결해주세요.');
      return;
    }

    // 진행률 시뮬레이션
    setImportProgress(prev => ({ ...prev, [mallId]: 0 }));
    
    const interval = setInterval(() => {
      setImportProgress(prev => {
        const current = prev[mallId] || 0;
        if (current >= 100) {
          clearInterval(interval);
          alert(`${mall.name} 상품 가져오기가 완료되었습니다!`);
          return { ...prev, [mallId]: 0 };
        }
        return { ...prev, [mallId]: current + 10 };
      });
    }, 200);
  };

  const handleSync = (mallId: string) => {
    const mall = shoppingMalls.find(m => m.id === mallId);
    alert(`${mall?.name} 동기화를 시작합니다.`);
  };

  const handleSettings = (mallId: string) => {
    const mall = shoppingMalls.find(m => m.id === mallId);
    alert(`${mall?.name} 설정 페이지로 이동합니다.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">연결됨</span>;
      case 'inactive':
        return <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">미연결</span>;
      case 'error':
        return <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">오류</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">외부 쇼핑몰 상품 가져오기</h1>
        <p className="text-gray-600">다양한 쇼핑몰 플랫폼에서 상품을 가져오고 통합 관리합니다.</p>
      </div>

      {/* 전체 현황 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">연결된 쇼핑몰</p>
              <p className="text-3xl font-bold">{shoppingMalls.filter(m => m.isConnected).length}</p>
            </div>
            <div className="text-4xl">🔗</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">총 상품 수</p>
              <p className="text-3xl font-bold">{shoppingMalls.reduce((sum, mall) => sum + mall.productCount, 0).toLocaleString()}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">오늘 가져온 상품</p>
              <p className="text-3xl font-bold">127</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">동기화 대기</p>
              <p className="text-3xl font-bold">23</p>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
        </div>
      </div>

      {/* 쇼핑몰별 아코디언 */}
      <div className="space-y-4">
        {shoppingMalls.map((mall) => (
          <div key={mall.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* 아코디언 헤더 */}
            <div 
              onClick={() => toggleAccordion(mall.id)}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{mall.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-xl font-semibold text-gray-900">{mall.name}</h3>
                    {getStatusBadge(mall.status)}
                  </div>
                  <p className="text-gray-600 text-sm">{mall.description}</p>
                  {mall.isConnected && (
                    <p className="text-gray-500 text-xs mt-1">
                      상품 {mall.productCount.toLocaleString()}개 | 
                      마지막 동기화: {mall.lastSync}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* 접힌 상태에서도 보이는 빠른 작업 버튼들 */}
                {mall.isConnected ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImport(mall.id);
                      }}
                      disabled={importProgress[mall.id] > 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importProgress[mall.id] > 0 ? `${importProgress[mall.id]}%` : '상품 가져오기'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSync(mall.id);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      동기화
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(mall.id);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    연결하기
                  </button>
                )}
                
                <div className="text-2xl text-gray-400">
                  {expandedMall === mall.id ? '−' : '+'}
                </div>
              </div>
            </div>

            {/* 아코디언 콘텐츠 */}
            {expandedMall === mall.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 기능 및 설정 */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">기능 및 설정</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-medium text-gray-900">실시간 동기화</h5>
                          <p className="text-sm text-gray-600">자동으로 상품 정보를 동기화합니다</p>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            defaultChecked={mall.isConnected}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-medium text-gray-900">재고 관리</h5>
                          <p className="text-sm text-gray-600">재고 수량을 자동으로 관리합니다</p>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            defaultChecked={true}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-medium text-gray-900">가격 동기화</h5>
                          <p className="text-sm text-gray-600">가격 변동사항을 자동 반영합니다</p>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            defaultChecked={mall.features.includes('가격 동기화')}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleSettings(mall.id)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        상세 설정
                      </button>
                    </div>
                  </div>

                  {/* 가져오기 통계 및 작업 */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">가져오기 통계</h4>
                    {mall.isConnected && importStats[mall.id] ? (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg border p-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {importStats[mall.id].successCount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">성공</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">
                                {importStats[mall.id].failureCount}
                              </div>
                              <div className="text-sm text-gray-600">실패</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t text-center">
                            <div className="text-sm text-gray-600">
                              마지막 가져오기: {importStats[mall.id].lastImportDate}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => handleImport(mall.id)}
                            disabled={importProgress[mall.id] > 0}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {importProgress[mall.id] > 0 
                              ? `상품 가져오는 중... ${importProgress[mall.id]}%`
                              : '전체 상품 가져오기'
                            }
                          </button>
                          
                          <button
                            onClick={() => handleImport(`${mall.id}-incremental`)}
                            className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                          >
                            신규/변경 상품만 가져오기
                          </button>
                          
                          <button
                            onClick={() => handleSync(mall.id)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            기존 상품 동기화
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border p-6 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📊</div>
                        <p className="text-gray-600 mb-4">
                          {mall.isConnected ? '통계를 불러오는 중...' : '먼저 쇼핑몰을 연결해주세요'}
                        </p>
                        {!mall.isConnected && (
                          <button
                            onClick={() => handleConnect(mall.id)}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            지금 연결하기
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 지원 기능 */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">지원 기능</h4>
                  <div className="flex flex-wrap gap-2">
                    {mall.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 작업 영역 */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">일괄 작업</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            전체 쇼핑몰 동기화
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
            동기화 로그 보기
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
            가져오기 기록
          </button>
          <button className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50">
            오류 상품 관리
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalProductImportPage;
