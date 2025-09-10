import React, { useState } from 'react';

const ProductImportPage = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [importData, setImportData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [step, setStep] = useState('platform'); // platform, auth, import, complete

  const platforms = [
        { id: 'cafe24', name: '카페24', icon: '□', description: '카페24 쇼핑몰에서 상품 정보를 가져옵니다.' },
    { id: 'makeshop', name: '메이크샵', icon: '□', description: '메이크샵에서 상품 정보를 가져옵니다.' },
    { id: 'smartstore', name: '스마트스토어', icon: '□', description: '네이버 스마트스토어에서 상품 정보를 가져옵니다.' },
    { id: 'wisa', name: '위사', icon: '□', description: '위사 쇼핑몰에서 상품 정보를 가져옵니다.' },
    { id: 'godo', name: '고도몰', icon: '□', description: '고도몰에서 상품 정보를 가져옵니다.' }
  ];

  // Mock imported products
  const mockImportedProducts = [
    {
      id: 'EXT001',
      name: '[외부] 프리미엄 후드티',
      externalCode: 'HOOD_001_EXT',
      category: '상의 > 후드티',
      brand: 'External Brand',
      price: 45000,
      originalPrice: 25000,
      description: '외부 쇼핑몰의 인기 후드티입니다.',
      stock: 120,
      images: ['image1.jpg', 'image2.jpg'],
      platform: selectedPlatform,
      status: 'ready'
    },
    {
      id: 'EXT002',
      name: '[외부] 스포츠 운동화',
      externalCode: 'SHOE_002_EXT',
      category: '신발 > 운동화',
      brand: 'Sports Brand',
      price: 89000,
      originalPrice: 55000,
      description: '편안한 스포츠 운동화입니다.',
      stock: 75,
      images: ['shoe1.jpg'],
      platform: selectedPlatform,
      status: 'ready'
    },
    {
      id: 'EXT003',
      name: '[외부] 레더 백팩',
      externalCode: 'BAG_003_EXT',
      category: '가방 > 백팩',
      brand: 'Leather Co.',
      price: 120000,
      originalPrice: 80000,
      description: '고급 레더 백팩입니다.',
      stock: 45,
      images: ['bag1.jpg', 'bag2.jpg', 'bag3.jpg'],
      platform: selectedPlatform,
      status: 'duplicate' // 중복 상품
    }
  ];

  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId);
    setStep('auth');
  };

  const handleConnect = () => {
    // Simulate API connection
    setTimeout(() => {
      setIsConnected(true);
      setImportData(mockImportedProducts);
      setStep('import');
    }, 2000);
  };

  const handleSelectAll = () => {
    const availableProducts = importData.filter(p => p.status !== 'duplicate');
    if (selectedProducts.length === availableProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(availableProducts.map(p => p.id));
    }
  };

  const handleProductSelect = (productId) => {
    const product = importData.find(p => p.id === productId);
    if (product && product.status !== 'duplicate') {
      setSelectedProducts(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    }
  };

  const handleImport = () => {
    if (selectedProducts.length === 0) {
      alert('가져올 상품을 선택해주세요.');
      return;
    }

    // Simulate import process
    const selectedCount = selectedProducts.length;
    if (window.confirm(`선택된 ${selectedCount}개 상품을 가져오시겠습니까?`)) {
      setStep('complete');
    }
  };

  const handleReset = () => {
    setSelectedPlatform('');
    setIsConnected(false);
    setImportData([]);
    setSelectedProducts([]);
    setStep('platform');
  };

  const getPlatformInfo = (platformId) => {
    return platforms.find(p => p.id === platformId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">가져오기 가능</span>;
      case 'duplicate':
        return <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">중복 상품</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">외부 쇼핑몰 상품 가져오기</h1>
        <p className="text-gray-600">외부 쇼핑몰에서 상품 정보를 가져와 일괄 등록할 수 있습니다.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center ${step === 'platform' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'platform' ? 'bg-blue-100 text-blue-600' :
              step === 'auth' || step === 'import' || step === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">플랫폼 선택</span>
          </div>

          <div className="flex-1 h-px bg-gray-300 mx-4"></div>

          <div className={`flex items-center ${step === 'auth' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'auth' ? 'bg-blue-100 text-blue-600' :
              step === 'import' || step === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">연동 인증</span>
          </div>

          <div className="flex-1 h-px bg-gray-300 mx-4"></div>

          <div className={`flex items-center ${step === 'import' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'import' ? 'bg-blue-100 text-blue-600' :
              step === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">상품 가져오기</span>
          </div>

          <div className="flex-1 h-px bg-gray-300 mx-4"></div>

          <div className={`flex items-center ${step === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'complete' ? 'bg-green-100 text-green-600' : 'bg-gray-100'
            }`}>
              4
            </div>
            <span className="ml-2 text-sm font-medium">완료</span>
          </div>
        </div>
      </div>

      {/* Step 1: Platform Selection */}
      {step === 'platform' && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">연동할 쇼핑몰 플랫폼을 선택하세요</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                onClick={() => handlePlatformSelect(platform.id)}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{platform.icon}</span>
                  <h3 className="text-lg font-medium text-gray-900">{platform.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{platform.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Authentication */}
      {step === 'auth' && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{getPlatformInfo(selectedPlatform)?.icon}</span>
            <h2 className="text-lg font-semibold">{getPlatformInfo(selectedPlatform)?.name} 연동 설정</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API 키 (또는 아이디)</label>
              <input
                type="text"
                placeholder="API 키를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API 시크릿 (또는 비밀번호)</label>
              <input
                type="password"
                placeholder="API 시크릿을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">쇼핑몰 도메인 (선택사항)</label>
              <input
                type="url"
                placeholder="https://your-shop.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">연동 안내</h4>
            <p className="text-sm text-yellow-700">
              API 키 발급 방법은 각 쇼핑몰의 개발자 센터에서 확인하실 수 있습니다.
              연동 후 상품 정보를 안전하게 가져올 수 있습니다.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setStep('platform')}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              이전
            </button>
            <button
              onClick={handleConnect}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
            >
              {!isConnected ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  연동 중...
                </>
              ) : (
                '연동 완료'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Import Products */}
      {step === 'import' && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{getPlatformInfo(selectedPlatform)?.icon}</span>
              <h2 className="text-lg font-semibold">상품 목록 ({importData.length}개 발견)</h2>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              다시 시작
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <div className="text-2xl font-bold text-blue-600">{importData.length}</div>
              <div className="text-sm text-blue-700">발견된 상품</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-2xl font-bold text-green-600">{importData.filter(p => p.status === 'ready').length}</div>
              <div className="text-sm text-green-700">가져오기 가능</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="text-2xl font-bold text-yellow-600">{importData.filter(p => p.status === 'duplicate').length}</div>
              <div className="text-sm text-yellow-700">중복 상품</div>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === importData.filter(p => p.status === 'ready').length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">가져오기 가능한 상품 전체 선택</label>
              </div>
              <span className="text-sm text-gray-600">선택됨: {selectedProducts.length}개</span>
            </div>

            <button
              onClick={handleImport}
              disabled={selectedProducts.length === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              선택 상품 가져오기
            </button>
          </div>

          {/* Product List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">선택</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품 정보</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">브랜드</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">재고</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이미지</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importData.map((product) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 ${product.status === 'duplicate' ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                        disabled={product.status === 'duplicate'}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(product.status)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{product.externalCode}</div>
                        <div className="text-xs text-gray-500">{product.category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">₩{product.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">원가: ₩{product.originalPrice.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.stock}개</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.images.length}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">상품 가져오기 완료!</h3>
          <p className="text-gray-600 mb-6">
            {getPlatformInfo(selectedPlatform)?.name}에서 {selectedProducts.length}개 상품을 성공적으로 가져왔습니다.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              다시 가져오기
            </button>
            <button
              onClick={() => window.location.href = '/products-list'}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              상품 목록 확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImportPage;
