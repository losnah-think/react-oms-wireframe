import React, { useState } from "react";
import { Container, Card, Button, Badge, Stack } from "../../design-system";

interface ShoppingMallIntegration {
  id: string;
  name: string;
  icon: string;
  description: string;
  isConnected: boolean;
  lastSync?: string;
  productCount: number;
  status: "active" | "inactive" | "error";
  features: string[];
}

interface ProductImportStats {
  totalProducts: number;
  successCount: number;
  failureCount: number;
  lastImportDate: string;
}

// Minimal product shape mapped from 외부 쇼핑몰 (참고: Cafe24 Admin API 제품 속성)
interface ExternalProduct {
  product_no?: string;
  name: string;
  price: number;
  inventory: number;
  selling: boolean;
  last_update?: string;
  options?: Record<string, string>;
  image?: string;
}

const ExternalProductImportPage: React.FC = () => {
  const [expandedMall, setExpandedMall] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<Record<string, number>>(
    {},
  );

  const shoppingMalls: ShoppingMallIntegration[] = [
    {
      id: "makeshop",
      name: "메이크샵",
      icon: "",
      description: "메이크샵 쇼핑몰 플랫폼에서 상품을 가져옵니다",
      isConnected: true,
      lastSync: "2025-01-15 14:30",
      productCount: 1247,
      status: "active",
      features: ["실시간 동기화", "재고 관리", "가격 동기화", "카테고리 매핑"],
    },
    {
      id: "cafe24",
      name: "카페24",
      icon: "",
      description: "카페24 쇼핑몰 플랫폼에서 상품을 가져옵니다",
      isConnected: true,
      lastSync: "2025-01-15 12:15",
      productCount: 892,
      status: "active",
      features: ["상품 정보 동기화", "주문 연동", "재고 실시간 반영"],
    },
    {
      id: "wemakeprice",
      name: "위메프",
      icon: "",
      description: "위메프 오픈마켓에서 상품을 가져옵니다",
      isConnected: false,
      lastSync: undefined,
      productCount: 0,
      status: "inactive",
      features: ["대량 상품 등록", "프로모션 연동", "정산 관리"],
    },
    {
      id: "godo",
      name: "고도몰5",
      icon: "",
      description: "고도몰5 쇼핑몰 플랫폼에서 상품을 가져옵니다",
      isConnected: true,
      lastSync: "2025-01-15 10:45",
      productCount: 456,
      status: "error",
      features: ["상품 관리", "주문 처리", "고객 관리", "SEO 최적화"],
    },
    {
      id: "naver",
      name: "네이버 스마트스토어",
      icon: "",
      description: "네이버 스마트스토어에서 상품을 가져옵니다",
      isConnected: true,
      lastSync: "2025-01-15 13:20",
      productCount: 678,
      status: "active",
      features: ["네이버 쇼핑 연동", "스마트스토어 관리", "광고 연동"],
    },
  ];

  const [importStats, setImportStats] = useState<Record<string, ProductImportStats>>({
    makeshop: {
      totalProducts: 1247,
      successCount: 1198,
      failureCount: 49,
      lastImportDate: "2025-01-15 14:30",
    },
    cafe24: {
      totalProducts: 892,
      successCount: 876,
      failureCount: 16,
      lastImportDate: "2025-01-15 12:15",
    },
    naver: {
      totalProducts: 678,
      successCount: 667,
      failureCount: 11,
      lastImportDate: "2025-01-15 13:20",
    },
  });

  const [importedSamples, setImportedSamples] = useState<Record<string, ExternalProduct[]>>({});

  // Filters state for the filter panel
  interface Filters {
    seller: string;
    dateFrom: string;
    dateTo: string;
    costModified?: 'modified' | 'not-modified' | '';
    display?: 'displayed' | 'hidden' | '';
    selling?: 'selling' | 'not-selling' | '';
    productName?: string;
    autoRegisterCategory?: boolean;
    optionNameApply?: boolean;
  }

  const [filters, setFilters] = useState<Filters>({
    seller: 'all',
    dateFrom: '',
    dateTo: '',
    costModified: '',
    display: '',
    selling: '',
    productName: '',
    autoRegisterCategory: false,
    optionNameApply: false,
  });

  function formatDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function applyPreset(preset: string) {
    const today = new Date();
    let from = new Date();
    switch (preset) {
      case '오늘':
        from = today;
        break;
      case '7일':
        from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '10일':
        from = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
        break;
      case '15일':
        from = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
        break;
      case '1개월':
        from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3개월':
        from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6개월':
        from = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        from = new Date(0);
    }
    setFilters((f: Filters) => ({ ...f, dateFrom: formatDate(from), dateTo: formatDate(today) }));
  }

  function applyFilters() {
    // For now, just log or alert the active filters; real implementation should call API
    console.log('Apply filters', filters);
    alert('필터가 적용되었습니다. (시연용)');
  }

  function resetFilters() {
    setFilters({ seller: 'all', dateFrom: '', dateTo: '', costModified: '', display: '', selling: '', productName: '', autoRegisterCategory: false, optionNameApply: false });
  }

  const toggleAccordion = (mallId: string) => {
    setExpandedMall(expandedMall === mallId ? null : mallId);
  };

  const handleConnect = (mallId: string) => {
    alert(
      `${shoppingMalls.find((m) => m.id === mallId)?.name} 연결을 시작합니다.`,
    );
  };

  const handleImport = (mallId: string) => {
    const mall = shoppingMalls.find((m) => m.id === mallId);
    if (!mall?.isConnected) {
      alert("먼저 쇼핑몰을 연결해주세요.");
      return;
    }

    // 진행률 시뮬레이션
    setImportProgress((prev) => ({ ...prev, [mallId]: 0 }));

    const interval = setInterval(async () => {
      setImportProgress((prev) => ({ ...prev, [mallId]: ((prev[mallId] || 0) + 10) }));
      const current = importProgress[mallId] || 0;
      if (current >= 90) {
        clearInterval(interval);
        try {
          if (mallId === 'cafe24') {
            // call server-side API to fetch cafe24 products
            const resp = await fetch('/api/integrations/cafe24/products');
            if (resp.ok) {
              const body = await resp.json();
              const products = body.products || [];
              setImportedSamples((p) => ({ ...p, [mallId]: products }));
              setImportStats((s) => ({
                ...s,
                [mallId]: {
                  totalProducts: products.length,
                  successCount: products.length,
                  failureCount: 0,
                  lastImportDate: new Date().toLocaleString(),
                },
              }));
            } else {
              // fallback to mock
              const samples = generateMockProducts(mallId);
              setImportedSamples((p) => ({ ...p, [mallId]: samples }));
              setImportStats((s) => ({
                ...s,
                [mallId]: {
                  totalProducts: samples.length,
                  successCount: samples.length,
                  failureCount: 0,
                  lastImportDate: new Date().toLocaleString(),
                },
              }));
            }
          } else {
            // non-cafe24: use local mock samples
            const samples = generateMockProducts(mallId);
            setImportedSamples((p) => ({ ...p, [mallId]: samples }));
            setImportStats((s) => ({
              ...s,
              [mallId]: {
                totalProducts: samples.length,
                successCount: samples.length,
                failureCount: 0,
                lastImportDate: new Date().toLocaleString(),
              },
            }));
          }
          alert(`${mall.name} 상품 가져오기가 완료되었습니다.`);
          setImportProgress((prev) => ({ ...prev, [mallId]: 0 }));
        } catch (err: any) {
          alert(`가져오기 중 오류가 발생했습니다: ${err.message || err}`);
          setImportProgress((prev) => ({ ...prev, [mallId]: 0 }));
        }
      }
    }, 200);
  };

  // Generate lightweight mock products that roughly map to Cafe24 product properties
  function generateMockProducts(mallId: string): ExternalProduct[] {
    const count = 8;
    const now = new Date().toISOString();
    const items: ExternalProduct[] = [];
    for (let i = 1; i <= count; i++) {
      items.push({
        product_no: `${mallId.toUpperCase()}-${1000 + i}`,
        name: `${shoppingMalls.find((m) => m.id === mallId)?.name} 샘플 상품 ${i}`,
        price: Math.round(10000 + Math.random() * 90000),
        inventory: Math.floor(Math.random() * 200),
        selling: Math.random() > 0.1,
        last_update: now,
        options: { color: i % 2 === 0 ? 'Black' : 'White' },
      });
    }
    return items;
  }

  const handleSync = (mallId: string) => {
    const mall = shoppingMalls.find((m) => m.id === mallId);
    alert(`${mall?.name} 동기화를 시작합니다.`);
  };

  const handleSettings = (mallId: string) => {
    const mall = shoppingMalls.find((m) => m.id === mallId);
    alert(`${mall?.name} 설정 페이지로 이동합니다.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            연결됨
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            미연결
          </span>
        );
      case "error":
        return (
          <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            오류
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="6xl" padding="md" className="min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          외부 쇼핑몰 상품 가져오기
        </h1>
        <p className="text-gray-600">
          다양한 쇼핑몰 플랫폼에서 상품을 가져오고 통합 관리합니다.
        </p>
      </div>

      {/* 필터 패널 */}
      <Card padding="md" className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-700">판매처 선택</label>
            <select
              value={(filters && filters.seller) || 'all'}
              onChange={(e) => setFilters((f) => ({ ...f, seller: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">전체</option>
              {shoppingMalls.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700">기간 선택</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                className="border rounded px-2 py-2 w-full"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                className="border rounded px-2 py-2 w-full"
              />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {['오늘','7일','10일','15일','1개월','3개월','6개월'].map((p) => (
                <Button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className="text-sm px-3 py-1 border rounded bg-gray-50 hover:bg-gray-100"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-700">등록일자</label>
            <div className="text-sm text-gray-600">범위 선택 및 전체 포함</div>
            <div className="flex items-center gap-2 mt-2">
              <Button onClick={() => setFilters((f) => ({ ...f, dateFrom: '', dateTo: '' }))} className="px-3 py-2">전체</Button>
              <div className="ml-auto flex gap-2">
                <Button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white">필터 적용</Button>
                <Button onClick={resetFilters} className="px-4 py-2 border">초기화</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-700">원가/판매가 수정여부</label>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setFilters((f) => ({ ...f, costModified: 'modified' }))} className="px-3 py-1 border rounded">수정함</Button>
              <Button onClick={() => setFilters((f) => ({ ...f, costModified: 'not-modified' }))} className="px-3 py-1 border rounded">수정안함</Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">진열여부</label>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setFilters((f) => ({ ...f, display: 'displayed' }))} className="px-3 py-1 border rounded">진열함</Button>
              <Button onClick={() => setFilters((f) => ({ ...f, display: 'hidden' }))} className="px-3 py-1 border rounded">진열안함</Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">판매여부</label>
            <div className="flex gap-2 mt-2">
              <Button onClick={() => setFilters((f) => ({ ...f, selling: 'selling' }))} className="px-3 py-1 border rounded">판매함</Button>
              <Button onClick={() => setFilters((f) => ({ ...f, selling: 'not-selling' }))} className="px-3 py-1 border rounded">판매안함</Button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-700">상품명</label>
            <input value={filters.productName} onChange={(e) => setFilters((f) => ({ ...f, productName: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="상품명으로 검색" />
          </div>

          <div className="flex items-center gap-2">
            <input id="auto-cat" type="checkbox" checked={filters.autoRegisterCategory} onChange={(e) => setFilters((f) => ({ ...f, autoRegisterCategory: e.target.checked }))} />
            <label htmlFor="auto-cat" className="text-sm text-gray-700">상품분류 등록여부 (체크 시 자동 등록)</label>
          </div>

          <div className="flex items-center gap-2">
            <input id="option-apply" type="checkbox" checked={filters.optionNameApply} onChange={(e) => setFilters((f) => ({ ...f, optionNameApply: e.target.checked }))} />
            <label htmlFor="option-apply" className="text-sm text-gray-700">옵션명 적용여부 (체크 시 "색상,사이즈=빨강,M" 형태 저장)</label>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 border-t pt-3">
          <strong>카페24상품 자동상품등록 사용방법</strong>
          <div className="mt-2">※ 상품명과 옵션명이 중복될 경우 등록되지 않습니다. 상품코드가 중복될 경우 등록되지 않습니다. 상품명은 존재하나 옵션이 없을 경우, 해당 상품에 옵션만 추가 등록됩니다.</div>
        </div>
      </Card>

      {/* 전체 현황 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card
          padding="md"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">연결된 쇼핑몰</p>
              <p className="text-3xl font-bold">
                {shoppingMalls.filter((m) => m.isConnected).length}
              </p>
            </div>
            <div className="text-4xl"></div>
          </div>
        </Card>

        <Card
          padding="md"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">총 상품 수</p>
              <p className="text-3xl font-bold">
                {shoppingMalls
                  .reduce((sum, mall) => sum + mall.productCount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="text-4xl"></div>
          </div>
        </Card>

        <Card
          padding="md"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">오늘 가져온 상품</p>
              <p className="text-3xl font-bold">127</p>
            </div>
            <div className="text-4xl"></div>
          </div>
        </Card>

        <Card
          padding="md"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">동기화 대기</p>
              <p className="text-3xl font-bold">23</p>
            </div>
            <div className="text-4xl"></div>
          </div>
        </Card>
      </div>

      {/* 쇼핑몰별 아코디언 */}
      <div className="space-y-4">
        {shoppingMalls.map((mall) => (
          <div
            key={mall.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* 아코디언 헤더 */}
            <div
              onClick={() => toggleAccordion(mall.id)}
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{mall.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {mall.name}
                    </h3>
                    {getStatusBadge(mall.status)}
                  </div>
                  <p className="text-gray-600 text-sm">{mall.description}</p>
                  {mall.isConnected && (
                    <p className="text-gray-500 text-xs mt-1">
                      상품 {mall.productCount.toLocaleString()}개 | 마지막
                      동기화: {mall.lastSync}
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
                      {importProgress[mall.id] > 0
                        ? `${importProgress[mall.id]}%`
                        : "상품 가져오기"}
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
                  {expandedMall === mall.id ? "−" : "+"}
                </div>
              </div>
            </div>

            {/* 아코디언 콘텐츠 */}
            {expandedMall === mall.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 기능 및 설정 */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      기능 및 설정
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            실시간 동기화
                          </h5>
                          <p className="text-sm text-gray-600">
                            자동으로 상품 정보를 동기화합니다
                          </p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={mall.isConnected}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </div>

                      {importedSamples[mall.id] && importedSamples[mall.id].length > 0 && (
                        <div className="mt-4 bg-white rounded-lg border p-4">
                          <h5 className="font-medium text-gray-900 mb-2">가져온 상품 미리보기</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead>
                                <tr>
                                  <th className="px-2 py-1">상품번호</th>
                                  <th className="px-2 py-1">상품명</th>
                                  <th className="px-2 py-1">가격</th>
                                  <th className="px-2 py-1">재고</th>
                                  <th className="px-2 py-1">상태</th>
                                  <th className="px-2 py-1">마지막 업데이트</th>
                                </tr>
                              </thead>
                              <tbody>
                                {importedSamples[mall.id].slice(0, 5).map((p, idx) => (
                                  <tr key={idx} className="border-t">
                                    <td className="px-2 py-2 text-gray-700">{p.product_no}</td>
                                    <td className="px-2 py-2 text-gray-800">{p.name}</td>
                                    <td className="px-2 py-2 text-gray-700">{p.price.toLocaleString()}원</td>
                                    <td className="px-2 py-2 text-gray-700">{p.inventory}</td>
                                    <td className="px-2 py-2 text-gray-700">{p.selling ? '판매중' : '판매중단'}</td>
                                    <td className="px-2 py-2 text-gray-600">{p.last_update}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            재고 관리
                          </h5>
                          <p className="text-sm text-gray-600">
                            재고 수량을 자동으로 관리합니다
                          </p>
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
                          <h5 className="font-medium text-gray-900">
                            가격 동기화
                          </h5>
                          <p className="text-sm text-gray-600">
                            가격 변동사항을 자동 반영합니다
                          </p>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={mall.features.includes(
                              "가격 동기화",
                            )}
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
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      가져오기 통계
                    </h4>
                    {mall.isConnected && importStats[mall.id] ? (
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg border p-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {importStats[
                                  mall.id
                                ].successCount.toLocaleString()}
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
                              마지막 가져오기:{" "}
                              {importStats[mall.id].lastImportDate}
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
                              : "전체 상품 가져오기"}
                          </button>

                          <button
                            onClick={() =>
                              handleImport(`${mall.id}-incremental`)
                            }
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
                        <p className="text-gray-600 mb-4">
                          {mall.isConnected
                            ? "통계를 불러오는 중..."
                            : "먼저 쇼핑몰을 연결해주세요"}
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
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    지원 기능
                  </h4>
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
    </Container>
  );
};

export default ExternalProductImportPage;
