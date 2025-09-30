import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductTable from '../../components/products/ProductTable';

// Mock 데이터
const mockProducts = [
  {
    id: "1",
    productName: "기본 반팔티셔츠",
    productCode: "TS001",
    representativeSellingPrice: 25000,
    stock: 100,
    isSelling: true,
    productCategory: "의류 > 상의",
    brandId: "BRAND-001",
    representativeImage: null,
    variants: [],
    originalCost: 15000,
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    productName: "기본 청바지",
    productCode: "JN001",
    representativeSellingPrice: 45000,
    stock: 50,
    isSelling: true,
    productCategory: "의류 > 하의",
    brandId: "BRAND-002",
    representativeImage: null,
    variants: [],
    originalCost: 30000,
    createdAt: "2024-01-20"
  }
];

const ProductsListPage: React.FC = () => {
  const router = useRouter();
  
  // 상태 관리
  const [products, setProducts] = useState(mockProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = useState(false);

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price);
  };

  // 필터링된 상품 목록
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 선택된 상품 수
  const selectedCount = selectedProducts.length;

  // 소프트 삭제
  const softDeleteOne = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setSelectedProducts(prev => prev.filter(id => id !== productId));
    setToastMessage("상품이 휴지통으로 이동되었습니다.");
  };

  // 토스트 메시지 자동 숨김
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col h-screen">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">상품 목록</h1>
              <p className="text-sm text-gray-600 mt-1">
                총 {filteredProducts.length}개 상품 {selectedProducts.length > 0 && `(${selectedProducts.length}개 선택)`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (selectedProducts.length === 0) {
                    setToastMessage("전송할 상품을 선택하세요.");
                    return;
                  }
                  window.location.href = `/products/external-send?ids=${selectedProducts.join(',')}`;
                }}
                disabled={selectedProducts.length === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                선택 외부 송신
              </button>
              <button
                onClick={() => setIsHelpDrawerOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                도움말
              </button>
              <button
                onClick={() => router.push('/products/add')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + 상품 추가
              </button>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="상품명 또는 코드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 상품 테이블 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-sm">
            <ProductTable
              products={filteredProducts}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
              onProductClick={(product) => router.push(`/products/${product.id}`)}
              onProductEdit={(productId) => router.push(`/products/${productId}/edit`)}
              onProductDelete={softDeleteOne}
              onProductCopy={(product) => setToastMessage("상품 복사 기능은 준비 중입니다.")}
              pagination={{
                current: 1,
                pageSize: 20,
                total: filteredProducts.length,
                onChange: () => {}
              }}
            />
          </div>
        </div>
      </div>

      {/* 도움말 Drawer */}
      {isHelpDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsHelpDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">상품 관리 도움말</h3>
                              <button
                  onClick={() => setIsHelpDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                              >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">기본 기능</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">상품 검색</h5>
                        <p>상품명이나 코드로 검색할 수 있습니다.</p>
                            </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">상품 선택</h5>
                        <p>체크박스를 통해 여러 상품을 선택할 수 있습니다.</p>
                            </div>
                            <div>
                        <h5 className="font-medium text-gray-900 mb-1">상품 추가</h5>
                        <p>새로운 상품을 등록할 수 있습니다.</p>
                            </div>
                          </div>
                        </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">외부 송신</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">선택 외부 송신</h5>
                        <p>선택한 상품들을 외부 판매처로 전송할 수 있습니다.</p>
                          </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">개별 외부 송신</h5>
                        <p>각 상품의 액션 버튼을 통해 개별적으로 전송할 수 있습니다.</p>
                          </div>
                        </div>
                        </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">상품 관리</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">상품 편집</h5>
                        <p>상품명을 클릭하면 상품 상세 페이지로 이동합니다.</p>
                        </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">상품 삭제</h5>
                        <p>삭제 버튼을 통해 상품을 휴지통으로 이동할 수 있습니다.</p>
                                      </div>
                                      </div>
                          </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">키보드 단축키</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>전체 선택</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + A</kbd>
        </div>
                      <div className="flex justify-between">
                        <span>검색</span>
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + F</kbd>
      </div>
        </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {toastMessage}
        </div>
      )}
            </div>
  );
};

export default ProductsListPage;
