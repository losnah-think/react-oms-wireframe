import React, { useState, useEffect } from 'react';

const MallProductsPage = () => {
  const [selectedMall, setSelectedMall] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [malls] = useState([
    { id: 'coupang', name: '쿠팡', status: 'active', totalProducts: 1245 },
    { id: 'gmarket', name: 'G마켓', status: 'active', totalProducts: 856 },
    { id: 'auction', name: '옥션', status: 'active', totalProducts: 634 },
    { id: '11st', name: '11번가', status: 'active', totalProducts: 423 },
    { id: 'interpark', name: '인터파크', status: 'active', totalProducts: 289 },
    { id: 'wemakeprice', name: '위메프', status: 'inactive', totalProducts: 156 }
  ]);

  const [sampleProducts] = useState([
    {
      id: 1,
      productId: 'PROD001',
      name: 'iPhone 15 Pro 256GB',
      mallProductId: 'COUP001',
      mallProductName: '[Apple] 아이폰 15 프로 256GB 자연 티타늄',
      price: 1550000,
      mallPrice: 1480000,
      stock: 45,
      mallStock: 40,
      status: 'active',
      syncStatus: 'synced',
      lastSync: '2024-09-10 14:30:00',
      mallUrl: 'https://coupang.com/products/123456',
      category: '전자제품 > 스마트폰'
    },
    {
      id: 2,
      productId: 'PROD002',
      name: '삼성 갤럭시 S24 Ultra',
      mallProductId: 'COUP002',
      mallProductName: '[삼성] 갤럭시 S24 울트라 512GB 타이타늄 그레이',
      price: 1790000,
      mallPrice: 1690000,
      stock: 23,
      mallStock: 20,
      status: 'active',
      syncStatus: 'price_diff',
      lastSync: '2024-09-10 14:25:00',
      mallUrl: 'https://coupang.com/products/123457',
      category: '전자제품 > 스마트폰'
    },
    {
      id: 3,
      productId: 'PROD003',
      name: 'MacBook Pro 14인치',
      mallProductId: 'COUP003',
      mallProductName: '[Apple] 맥북 프로 14인치 M3 Pro 칩 512GB',
      price: 2890000,
      mallPrice: 2790000,
      stock: 12,
      mallStock: 12,
      status: 'active',
      syncStatus: 'stock_diff',
      lastSync: '2024-09-10 14:20:00',
      mallUrl: 'https://coupang.com/products/123458',
      category: '전자제품 > 노트북'
    },
    {
      id: 4,
      productId: 'PROD004',
      name: '나이키 에어맥스 270',
      mallProductId: 'COUP004',
      mallProductName: '[Nike] 나이키 에어맥스 270 블랙/화이트',
      price: 189000,
      mallPrice: 169000,
      stock: 0,
      mallStock: 0,
      status: 'inactive',
      syncStatus: 'out_of_stock',
      lastSync: '2024-09-10 14:15:00',
      mallUrl: 'https://coupang.com/products/123459',
      category: '패션/의류 > 신발'
    }
  ]);

  useEffect(() => {
    if (selectedMall) {
      setProducts(sampleProducts);
    } else {
      setProducts([]);
    }
  }, [selectedMall, sampleProducts]);

  const getSyncStatusInfo = (status) => {
    const statusMap = {
      'synced': { text: '동기화됨', color: 'bg-green-100 text-green-800' },
      'price_diff': { text: '가격 차이', color: 'bg-yellow-100 text-yellow-800' },
      'stock_diff': { text: '재고 차이', color: 'bg-orange-100 text-orange-800' },
      'out_of_stock': { text: '품절', color: 'bg-red-100 text-red-800' },
      'error': { text: '오류', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const handleSyncProduct = (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            syncStatus: 'synced',
            lastSync: new Date().toLocaleString('ko-KR'),
            mallPrice: product.price,
            mallStock: product.stock
          }
        : product
    ));
    alert('상품이 동기화되었습니다.');
  };

  const handleSyncAll = () => {
    if (window.confirm('모든 상품을 동기화하시겠습니까?')) {
      setProducts(prev => prev.map(product => ({
        ...product,
        syncStatus: 'synced',
        lastSync: new Date().toLocaleString('ko-KR'),
        mallPrice: product.price,
        mallStock: product.stock
      })));
      alert('모든 상품이 동기화되었습니다.');
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('이 상품을 쇼핑몰에서 제거하시겠습니까?')) {
      setProducts(prev => prev.filter(product => product.id !== productId));
      alert('상품이 제거되었습니다.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.mallProductName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.syncStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">쇼핑몰별 상품 관리</h1>
        <p className="text-gray-600">각 쇼핑몰에 등록된 상품의 동기화 상태를 관리합니다.</p>
      </div>

      {/* 쇼핑몰 선택 */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">쇼핑몰 선택</h2>
          {selectedMall && (
            <button
              onClick={handleSyncAll}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              전체 동기화
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {malls.map((mall) => (
            <div
              key={mall.id}
              onClick={() => setSelectedMall(mall.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMall === mall.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${mall.status === 'inactive' ? 'opacity-50' : ''}`}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">{mall.name}</div>
                <div className="text-xs text-gray-500 mt-1">{mall.totalProducts}개 상품</div>
                <div className={`text-xs mt-1 ${
                  mall.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {mall.status === 'active' ? '연결됨' : '연결 안됨'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMall && (
        <>
          {/* 검색 및 필터 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="상품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 상태</option>
                <option value="synced">동기화됨</option>
                <option value="price_diff">가격 차이</option>
                <option value="stock_diff">재고 차이</option>
                <option value="out_of_stock">품절</option>
                <option value="error">오류</option>
              </select>
            </div>
          </div>

          {/* 상품 목록 */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가격 비교
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      재고 비교
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      동기화 상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      마지막 동기화
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedProducts.map((product) => {
                    const syncInfo = getSyncStatusInfo(product.syncStatus);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-1">ID: {product.productId}</div>
                            <div className="text-xs text-blue-600 mt-1">
                              쇼핑몰: {product.mallProductName}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{product.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className={`${product.price !== product.mallPrice ? 'text-red-600' : 'text-gray-900'}`}>
                              기준: {product.price.toLocaleString()}원
                            </div>
                            <div className={`${product.price !== product.mallPrice ? 'text-red-600' : 'text-gray-600'}`}>
                              쇼핑몰: {product.mallPrice.toLocaleString()}원
                            </div>
                            {product.price !== product.mallPrice && (
                              <div className="text-xs text-red-500 mt-1">
                                차이: {Math.abs(product.price - product.mallPrice).toLocaleString()}원
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className={`${product.stock !== product.mallStock ? 'text-red-600' : 'text-gray-900'}`}>
                              기준: {product.stock}개
                            </div>
                            <div className={`${product.stock !== product.mallStock ? 'text-red-600' : 'text-gray-600'}`}>
                              쇼핑몰: {product.mallStock}개
                            </div>
                            {product.stock !== product.mallStock && (
                              <div className="text-xs text-red-500 mt-1">
                                차이: {Math.abs(product.stock - product.mallStock)}개
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${syncInfo.color}`}>
                            {syncInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.lastSync}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleSyncProduct(product.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            동기화
                          </button>
                          <a
                            href={product.mallUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900"
                          >
                            쇼핑몰에서 보기
                          </a>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            제거
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      총 <span className="font-medium">{filteredProducts.length}</span>개 중{' '}
                      <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span>개 표시
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 동기화 통계 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: '전체', count: products.length, color: 'bg-blue-100 text-blue-800' },
              { label: '동기화됨', count: products.filter(p => p.syncStatus === 'synced').length, color: 'bg-green-100 text-green-800' },
              { label: '가격 차이', count: products.filter(p => p.syncStatus === 'price_diff').length, color: 'bg-yellow-100 text-yellow-800' },
              { label: '재고 차이', count: products.filter(p => p.syncStatus === 'stock_diff').length, color: 'bg-orange-100 text-orange-800' },
              { label: '품절/오류', count: products.filter(p => ['out_of_stock', 'error'].includes(p.syncStatus)).length, color: 'bg-red-100 text-red-800' }
            ].map((stat, index) => (
              <div key={index} className="bg-white border rounded-lg p-4 text-center">
                <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${stat.color}`}>
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{stat.count}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {!selectedMall && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">□</div>
          <p className="text-gray-600">상품을 관리할 쇼핑몰을 선택해주세요.</p>
        </div>
      )}
    </div>
  );
};

export default MallProductsPage;
