import React, { useState } from 'react';

interface ExternalProduct {
  id: string;
  externalName: string;
  externalCode: string;
  price: number;
  category: string;
  brand: string;
  hasBarcode: boolean;
  externalUrl?: string;
  selected: boolean;
}

const ProductImportPage: React.FC = () => {
  const [selectedMall, setSelectedMall] = useState('');
  const [authInfo, setAuthInfo] = useState({
    mallId: '',
    apiKey: '',
    secretKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [externalProducts, setExternalProducts] = useState<ExternalProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const malls = [
    { id: 'cafe24', name: '카페24' },
    { id: 'makeshop', name: '메이크샵' },
    { id: 'smartstore', name: '스마트스토어' },
    { id: 'wisa', name: '위사' },
    { id: 'godomall', name: '고도몰5' }
  ];

  // Mock external products data
  const mockExternalProducts: ExternalProduct[] = [
    {
      id: 'ext_001',
      externalName: '[카페24] 베이직 화이트 티셔츠',
      externalCode: 'CF24_TS001',
      price: 19900,
      category: '상의/티셔츠',
      brand: 'BasicWear',
      hasBarcode: true,
      externalUrl: 'https://sample-mall.cafe24.com/product/001',
      selected: false
    },
    {
      id: 'ext_002',
      externalName: '[카페24] 슬림 데님 팬츠',
      externalCode: 'CF24_PT002',
      price: 45000,
      category: '하의/팬츠',
      brand: 'DenimStyle',
      hasBarcode: false,
      externalUrl: 'https://sample-mall.cafe24.com/product/002',
      selected: false
    },
    {
      id: 'ext_003',
      externalName: '[카페24] 캐주얼 스니커즈',
      externalCode: 'CF24_SH003',
      price: 89000,
      category: '신발/운동화',
      brand: 'SportMax',
      hasBarcode: true,
      externalUrl: 'https://sample-mall.cafe24.com/product/003',
      selected: false
    },
    {
      id: 'ext_004',
      externalName: '[카페24] 가죽 크로스백',
      externalCode: 'CF24_BG004',
      price: 65000,
      category: '가방/크로스백',
      brand: 'LeatherCraft',
      hasBarcode: false,
      externalUrl: 'https://sample-mall.cafe24.com/product/004',
      selected: false
    },
    {
      id: 'ext_005',
      externalName: '[카페24] 울 니트 스웨터',
      externalCode: 'CF24_NT005',
      price: 75000,
      category: '상의/니트',
      brand: 'WoolWarm',
      hasBarcode: true,
      externalUrl: 'https://sample-mall.cafe24.com/product/005',
      selected: false
    }
  ];

  const handleFetchProducts = async () => {
    if (!selectedMall || !authInfo.mallId || !authInfo.apiKey) {
      alert('판매처와 인증 정보를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setExternalProducts(mockExternalProducts);
      setIsLoading(false);
    }, 2000);
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === externalProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(externalProducts.map(p => p.id));
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleImportSelected = () => {
    if (selectedProducts.length === 0) {
      alert('등록할 상품을 선택해주세요.');
      return;
    }

    const selectedCount = selectedProducts.length;
    if (confirm(`선택된 ${selectedCount}개 상품을 등록하시겠습니까?`)) {
      // Simulate import process
      alert(`${selectedCount}개 상품이 성공적으로 등록되었습니다.`);
      setSelectedProducts([]);
    }
  };

  const handleImportAll = () => {
    if (externalProducts.length === 0) {
      alert('조회된 상품이 없습니다.');
      return;
    }

    const totalCount = externalProducts.length;
    if (confirm(`전체 ${totalCount}개 상품을 등록하시겠습니까?`)) {
      // Simulate import process
      alert(`전체 ${totalCount}개 상품이 성공적으로 등록되었습니다.`);
      setExternalProducts([]);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">상품 정보 불러오기</h1>
        <p className="text-gray-600">외부 판매처에서 상품 정보를 불러와 등록할 수 있습니다.</p>
      </div>

      {/* Connection Settings */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">판매처 연동 설정</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Mall Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">판매처 선택</label>
            <select 
              value={selectedMall}
              onChange={(e) => setSelectedMall(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">판매처를 선택하세요</option>
              {malls.map(mall => (
                <option key={mall.id} value={mall.id}>{mall.name}</option>
              ))}
            </select>
          </div>

          {/* Mall ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mall ID</label>
            <input
              type="text"
              placeholder="Mall ID 입력"
              value={authInfo.mallId}
              onChange={(e) => setAuthInfo(prev => ({ ...prev, mallId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type="password"
              placeholder="API Key 입력"
              value={authInfo.apiKey}
              onChange={(e) => setAuthInfo(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {selectedMall && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key (선택사항)</label>
            <input
              type="password"
              placeholder="Secret Key 입력 (필요한 경우)"
              value={authInfo.secretKey}
              onChange={(e) => setAuthInfo(prev => ({ ...prev, secretKey: e.target.value }))}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button 
            onClick={handleFetchProducts}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isLoading ? '조회중...' : '상품 조회'}
          </button>
        </div>

        {/* Connection Status */}
        {selectedMall && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700">
                {malls.find(m => m.id === selectedMall)?.name} 연동 준비됨
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white border rounded-lg p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">상품 정보를 불러오는 중...</h3>
          <p className="text-gray-600">외부 API에서 상품 데이터를 조회하고 있습니다.</p>
        </div>
      )}

      {/* Results */}
      {externalProducts.length > 0 && !isLoading && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">조회 결과</h2>
              <span className="text-sm text-gray-600">총 {externalProducts.length}개 상품</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleImportSelected}
                disabled={selectedProducts.length === 0}
                className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 disabled:text-gray-400 disabled:border-gray-300"
              >
                선택 등록 ({selectedProducts.length})
              </button>
              <button 
                onClick={handleImportAll}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                전체 등록
              </button>
            </div>
          </div>

          {/* Select All */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProducts.length === externalProducts.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">전체 선택</label>
            </div>
          </div>

          {/* Products Grid */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선택</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">외부 상품명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">외부 상품코드</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">브랜드</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">바코드 여부</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">링크</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {externalProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{product.externalName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600 font-mono">{product.externalCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">₩{product.price.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{product.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{product.brand}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {product.hasBarcode ? (
                          <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">있음</span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">없음</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {product.externalUrl && (
                        <a 
                          href={product.externalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-700"
                        >
                          상품 보기
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import Policy Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">등록 정책</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 외부 바코드가 존재하는 경우 그대로 저장됩니다.</li>
              <li>• 바코드가 없는 경우 화주사 바코드 정책에 따라 자동 생성됩니다.</li>
              <li>• 중복된 상품코드가 있는 경우 자동으로 번호가 추가됩니다.</li>
              <li>• 등록 후 상품 상세 페이지에서 추가 정보를 수정할 수 있습니다.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Empty State */}
      {externalProducts.length === 0 && !isLoading && (
        <div className="bg-white border rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">조회된 상품이 없습니다</h3>
          <p className="text-gray-600">판매처를 선택하고 인증 정보를 입력한 후 상품을 조회해주세요.</p>
        </div>
      )}
    </div>
  );
};

export default ProductImportPage;
