import React, { useState, useEffect } from 'react';

interface ProductsEditPageProps {
  onNavigate?: (page: string) => void;
  productId?: number;
}

interface Product {
  id: string;
  productName: string;
  productCode: string;
  productCategory: string;
  brand: string;
  originalCost: number;
  representativeSellingPrice: number;
  englishProductName: string;
  representativeImage: string;
  isTaxExempt: string;
  description: string;
  supplier: string;
  hsCode: string;
  origin: string;
  marketPrice: number;
  consumerPrice: number;
  productYear: string;
  productSeason: string;
  width: string;
  height: string;
  depth: string;
  weight: string;
  volume: string;
  isOutOfStock: boolean;
}

interface Option {
  id: string;
  optionName: string;
  optionCode: string;
  barcodeNumber: string;
  sellingPrice: number;
  color: string;
  size: string;
  isForSale: boolean;
  isOutOfStock: boolean;
  inventorySync: boolean;
}

// 모달 컴포넌트들
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  selectedValue: string;
}

const BrandModal: React.FC<ModalProps> = ({ isOpen, onClose, onSelect, selectedValue }) => {
  const [brands] = useState(['삼성전자', 'LG전자', '애플', '다이슨', '나이키', '설화수', 'CJ제일제당', '기타']);
  const [newBrand, setNewBrand] = useState('');

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      onSelect(newBrand.trim());
      setNewBrand('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">브랜드 선택</h3>
        <div className="space-y-2 mb-4">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => { onSelect(brand); onClose(); }}
              className={`w-full text-left p-2 rounded border ${
                selectedValue === brand ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">새 브랜드 추가</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              placeholder="브랜드명 입력"
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddBrand}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 border rounded hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </div>
  );
};

const CategoryModal: React.FC<ModalProps> = ({ isOpen, onClose, onSelect, selectedValue }) => {
  const [categories] = useState(['전자제품', '가전제품', '의류/신발', '화장품/뷰티', '식품/생활용품', '도서/문구', '스포츠/레저', '기타']);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onSelect(newCategory.trim());
      setNewCategory('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">카테고리 선택</h3>
        <div className="space-y-2 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => { onSelect(category); onClose(); }}
              className={`w-full text-left p-2 rounded border ${
                selectedValue === category ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">새 카테고리 추가</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="카테고리명 입력"
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 border rounded hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </div>
  );
};

const ProductsEditPage: React.FC<ProductsEditPageProps> = ({ onNavigate, productId }) => {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [optionType, setOptionType] = useState<'single' | 'multiple'>('single');
  
  // 사이드패널 접기/펼치기 상태
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });
  
  // 모달 상태
  const [modals, setModals] = useState({
    brand: false,
    category: false
  });

  useEffect(() => {
    // Mock 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setProduct({
        id: `PROD-${String(productId).padStart(3, '0')}`,
        productName: "삼성 갤럭시 S24 Ultra 256GB",
        productCode: "SAMSUNG-S24U-256",
        productCategory: "전자제품",
        brand: "삼성전자",
        originalCost: 1100000,
        representativeSellingPrice: 1299000,
        englishProductName: "Samsung Galaxy S24 Ultra 256GB",
        representativeImage: "",
        isTaxExempt: "N",
        description: "최신 AI 기능이 탑재된 프리미엄 스마트폰",
        supplier: "삼성전자",
        hsCode: "8517.12.00",
        origin: "한국",
        marketPrice: 1400000,
        consumerPrice: 1350000,
        productYear: "2024",
        productSeason: "상시",
        width: "79.0",
        height: "162.3",
        depth: "8.6",
        weight: "232",
        volume: "110.8",
        isOutOfStock: false
      });
      
      setOptions([
        {
          id: "OPT-001",
          optionName: "티타늄 블랙/256GB",
          optionCode: "S24U-TB-256",
          barcodeNumber: "8806094850000",
          sellingPrice: 1299000,
          color: "티타늄 블랙",
          size: "256GB",
          isForSale: true,
          isOutOfStock: false,
          inventorySync: true
        },
        {
          id: "OPT-002",
          optionName: "티타늄 그레이/256GB",
          optionCode: "S24U-TG-256",
          barcodeNumber: "8806094850001",
          sellingPrice: 1299000,
          color: "티타늄 그레이",
          size: "256GB",
          isForSale: true,
          isOutOfStock: false,
          inventorySync: true
        }
      ]);
      
      setLoading(false);
    }, 800);
  }, [productId]);

  // 모달 핸들러
  const openModal = (type: 'brand' | 'category') => {
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: 'brand' | 'category') => {
    setModals(prev => ({ ...prev, [type]: false }));
  };

  const handleSelectValue = (type: 'brand' | 'category', value: string) => {
    if (type === 'brand') {
      setProduct(prev => prev ? ({ ...prev, brand: value }) : null);
    } else if (type === 'category') {
      setProduct(prev => prev ? ({ ...prev, productCategory: value }) : null);
    }
  };

  const handleOptionChange = (index: number, field: keyof Option, value: string | number | boolean) => {
    setOptions(prev => prev.map((option, i) => 
      i === index ? { ...option, [field]: value } : option
    ));
  };

  const addOption = () => {
    const newOption: Option = {
      id: `OPT-${String(options.length + 1).padStart(3, '0')}`,
      optionName: '',
      optionCode: '',
      barcodeNumber: '',
      sellingPrice: 0,
      color: '',
      size: '',
      isForSale: true,
      isOutOfStock: false,
      inventorySync: true
    };
    setOptions(prev => [...prev, newOption]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  // 섹션 접기/펼치기 토글
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 해당 섹션으로 스크롤 이동
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest' 
      });
    }
  };

  const handleSave = () => {
    // 필수 필드 검증
    if (!product?.productName || !product?.productCode || !product?.productCategory || 
        !product?.brand || !product?.originalCost || !product?.representativeSellingPrice) {
      alert('필수 필드를 모두 입력해주세요.');
      return;
    }

    // 저장 처리
    console.log('수정된 상품 데이터:', product);
    console.log('수정된 옵션 데이터:', options);
    alert('상품이 성공적으로 수정되었습니다!');
    
    if (onNavigate) {
      onNavigate('products-list');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">상품을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex max-w-7xl mx-auto p-6 gap-6">
        {/* 메인 컨텐츠 */}
        <div className="flex-1">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">상품 수정</h1>
            <p className="text-gray-600">상품 정보를 한 번에 수정합니다. (상품 ID: {product.id})</p>
          </div>

        <form className="space-y-8">
          {/* 1단계: 기본 정보 */}
          <div id="step1" className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 bg-blue-50 border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">기본 정보</h2>
                  <p className="text-sm text-gray-600">상품의 기본적인 정보를 수정하세요</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product?.productName || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, productName: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">영문 상품명</label>
                  <input
                    type="text"
                    value={product?.englishProductName || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, englishProductName: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품코드 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product?.productCode || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, productCode: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    브랜드 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openModal('brand')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50"
                  >
                    {product?.brand || '브랜드를 선택하세요'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품 분류 <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => openModal('category')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50"
                  >
                    {product?.productCategory || '카테고리를 선택하세요'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공급업체</label>
                  <input
                    type="text"
                    value={product?.supplier || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, supplier: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
                <textarea
                  rows={6}
                  value={product?.description || ''}
                  onChange={(e) => setProduct(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="상품에 대한 자세한 설명을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 2단계: 가격 정보 */}
          <div id="step2" className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 bg-green-50 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  2
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">가격 정보</h2>
                  <p className="text-sm text-gray-600">상품의 가격 관련 정보를 수정하세요</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    원가 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={product?.originalCost || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, originalCost: parseInt(e.target.value) }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대표 판매가 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={product?.representativeSellingPrice || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, representativeSellingPrice: parseInt(e.target.value) }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시장가</label>
                  <input
                    type="number"
                    value={product?.marketPrice || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, marketPrice: parseInt(e.target.value) }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">소비자가</label>
                  <input
                    type="number"
                    value={product?.consumerPrice || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, consumerPrice: parseInt(e.target.value) }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">세금 면세 여부</label>
                  <select
                    value={product?.isTaxExempt || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, isTaxExempt: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="Y">면세</option>
                    <option value="N">과세</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3단계: 상세 정보 */}
          <div id="step3" className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 bg-yellow-50 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                  3
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">상세 정보</h2>
                  <p className="text-sm text-gray-600">상품의 추가적인 상세 정보를 수정하세요</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HS 코드</label>
                  <input
                    type="text"
                    value={product?.hsCode || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, hsCode: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">원산지</label>
                  <input
                    type="text"
                    value={product?.origin || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, origin: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제품 연도</label>
                  <input
                    type="text"
                    value={product?.productYear || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, productYear: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시즌</label>
                  <input
                    type="text"
                    value={product?.productSeason || ''}
                    onChange={(e) => setProduct(prev => prev ? ({ ...prev, productSeason: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 치수 정보 */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">치수 정보</h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">폭 (cm)</label>
                    <input
                      type="text"
                      value={product?.width || ''}
                      onChange={(e) => setProduct(prev => prev ? ({ ...prev, width: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">높이 (cm)</label>
                    <input
                      type="text"
                      value={product?.height || ''}
                      onChange={(e) => setProduct(prev => prev ? ({ ...prev, height: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">깊이 (cm)</label>
                    <input
                      type="text"
                      value={product?.depth || ''}
                      onChange={(e) => setProduct(prev => prev ? ({ ...prev, depth: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">무게 (g)</label>
                    <input
                      type="text"
                      value={product?.weight || ''}
                      onChange={(e) => setProduct(prev => prev ? ({ ...prev, weight: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">부피 (㎤)</label>
                    <input
                      type="text"
                      value={product?.volume || ''}
                      onChange={(e) => setProduct(prev => prev ? ({ ...prev, volume: e.target.value }) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center">
                <input
                  type="checkbox"
                  id="outOfStock"
                  checked={product?.isOutOfStock || false}
                  onChange={(e) => setProduct(prev => prev ? ({ ...prev, isOutOfStock: e.target.checked }) : null)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="outOfStock" className="ml-2 block text-sm text-gray-900">
                  품절 상태
                </label>
              </div>
            </div>
          </div>

          {/* 4단계: 옵션 정보 */}
          <div id="step4" className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                    4
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">옵션 정보</h2>
                    <p className="text-sm text-gray-600">상품의 옵션들을 관리하세요 (총 {options.length}개)</p>
                  </div>
                </div>
                {optionType === 'multiple' && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    옵션 추가
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {/* 옵션 타입 선택 */}
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">옵션 타입 선택</h4>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="optionType"
                      value="single"
                      checked={optionType === 'single'}
                      onChange={(e) => {
                        setOptionType('single');
                        // 단일 옵션 선택 시 옵션을 1개로 제한
                        if (options.length > 1) {
                          setOptions([options[0]]);
                        }
                      }}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">단일 옵션 (기본 상품)</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="optionType"
                      value="multiple"
                      checked={optionType === 'multiple'}
                      onChange={(e) => setOptionType('multiple')}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex items-center">
                      <div className="flex space-x-1 mr-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700">복수 옵션 (색상, 사이즈 등)</span>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {optionType === 'single' 
                    ? '단일 옵션: 색상이나 사이즈 구분 없이 하나의 기본 상품만 판매' 
                    : '복수 옵션: 색상, 사이즈 등 여러 옵션으로 구분하여 판매'
                  }
                </p>
              </div>

              <div className="space-y-6">
                {options.map((option, index) => (
                  <div key={option.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">옵션 #{index + 1} (ID: {option.id})</h3>
                      {optionType === 'multiple' && options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">옵션명</label>
                        <input
                          type="text"
                          value={option.optionName}
                          onChange={(e) => handleOptionChange(index, 'optionName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">옵션 코드</label>
                        <input
                          type="text"
                          value={option.optionCode}
                          onChange={(e) => handleOptionChange(index, 'optionCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">바코드 번호</label>
                        <input
                          type="text"
                          value={option.barcodeNumber}
                          onChange={(e) => handleOptionChange(index, 'barcodeNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">판매가</label>
                        <input
                          type="number"
                          value={option.sellingPrice}
                          onChange={(e) => handleOptionChange(index, 'sellingPrice', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                        <input
                          type="text"
                          value={option.color}
                          onChange={(e) => handleOptionChange(index, 'color', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">사이즈</label>
                        <input
                          type="text"
                          value={option.size}
                          onChange={(e) => handleOptionChange(index, 'size', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`forSale-${index}`}
                          checked={option.isForSale}
                          onChange={(e) => handleOptionChange(index, 'isForSale', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`forSale-${index}`} className="ml-2 block text-sm text-gray-900">
                          판매 중
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`outOfStock-${index}`}
                          checked={option.isOutOfStock}
                          onChange={(e) => handleOptionChange(index, 'isOutOfStock', e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`outOfStock-${index}`} className="ml-2 block text-sm text-gray-900">
                          품절
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`inventorySync-${index}`}
                          checked={option.inventorySync}
                          onChange={(e) => handleOptionChange(index, 'inventorySync', e.target.checked)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`inventorySync-${index}`} className="ml-2 block text-sm text-gray-900">
                          재고 연동
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('products-list')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              수정 완료
            </button>
          </div>
        </form>

        {/* 모달들 */}
        <BrandModal
          isOpen={modals.brand}
          onClose={() => closeModal('brand')}
          onSelect={(value) => handleSelectValue('brand', value)}
          selectedValue={product?.brand || ''}
        />

        <CategoryModal
          isOpen={modals.category}
          onClose={() => closeModal('category')}
          onSelect={(value) => handleSelectValue('category', value)}
          selectedValue={product?.productCategory || ''}
        />
        </div>

        {/* 사이드 패널 - 수정 정보 미리보기 */}
        <div className="w-96 shrink-0">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 sticky top-6 transition-all duration-300 ease-in-out" style={{ minHeight: 'calc(100vh - 4.5rem)' }}>
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 rounded-t-lg">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              수정 정보 미리보기
            </h3>
            <p className="text-sm text-gray-600">실시간으로 수정한 정보를 확인하세요</p>
          </div>

          {/* 완성률 표시 - 상단 고정 */}
          <div className="p-4 bg-green-50 border-b border-gray-200">
            {(() => {
              const requiredFields = [
                product?.productName,
                product?.productCode,
                product?.productCategory,
                product?.brand,
                product?.originalCost,
                product?.representativeSellingPrice
              ];
              const completedFields = requiredFields.filter(field => field).length;
              const completionRate = Math.round((completedFields / requiredFields.length) * 100);
              
              return (
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span>필수 필드 완성률</span>
                    <span className="font-bold">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        completionRate === 100 ? 'bg-green-500' : 
                        completionRate >= 100 ? 'bg-green-500' :
                        completionRate >= 75 ? 'bg-blue-500' :
                        completionRate >= 50 ? 'bg-indigo-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {completedFields}/{requiredFields.length} 필수 필드 완료
                  </div>
                </div>
              );
            })()}
          </div>
          
          <div className="p-4 space-y-6">
            {/* 1단계: 기본 정보 */}
            <div className="transition-all duration-200 hover:bg-gray-50 rounded-lg">
              <div 
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => scrollToSection('step1')}
              >
                <h4 className="text-sm font-semibold text-blue-600 flex items-center">
                  <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-2 shadow-sm">1</div>
                  기본 정보
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('step1');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${collapsedSections.step1 ? '' : 'rotate-180'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {!collapsedSections.step1 && (
                <div className="space-y-2 text-sm px-4 py-3">
                <div><span className="text-gray-600">상품명:</span> {product?.productName || '-'}</div>
                <div><span className="text-gray-600">영문명:</span> {product?.englishProductName || '-'}</div>
                <div><span className="text-gray-600">상품코드:</span> {product?.productCode || '-'}</div>
                <div><span className="text-gray-600">브랜드:</span> {product?.brand || '-'}</div>
                <div><span className="text-gray-600">분류:</span> {product?.productCategory || '-'}</div>
                <div><span className="text-gray-600">공급업체:</span> {product?.supplier || '-'}</div>
                <div><span className="text-gray-600">설명:</span> {product?.description ? `${product.description.substring(0, 30)}...` : '-'}</div>
                </div>
              )}
            </div>

            {/* 2단계: 가격 정보 */}
            <div className="transition-all duration-200 hover:bg-gray-50 rounded-lg">
              <div 
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => scrollToSection('step2')}
              >
                <h4 className="text-sm font-semibold text-green-600 flex items-center">
                  <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs mr-2">2</div>
                  가격 정보
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('step2');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${collapsedSections.step2 ? '' : 'rotate-180'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {!collapsedSections.step2 && (
                <div className="space-y-2 text-sm px-4 py-3">
                <div><span className="text-gray-600">원가:</span> {product?.originalCost ? `${product.originalCost.toLocaleString()}원` : '-'}</div>
                <div><span className="text-gray-600">대표판매가:</span> {product?.representativeSellingPrice ? `${product.representativeSellingPrice.toLocaleString()}원` : '-'}</div>
                <div><span className="text-gray-600">시장가:</span> {product?.marketPrice ? `${product.marketPrice.toLocaleString()}원` : '-'}</div>
                <div><span className="text-gray-600">소비자가:</span> {product?.consumerPrice ? `${product.consumerPrice.toLocaleString()}원` : '-'}</div>
                <div><span className="text-gray-600">세금면세:</span> {product?.isTaxExempt || '-'}</div>
                </div>
              )}
            </div>

            {/* 3단계: 상세 정보 */}
            <div className="transition-all duration-200 hover:bg-gray-50 rounded-lg">
              <div 
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => scrollToSection('step3')}
              >
                <h4 className="text-sm font-semibold text-yellow-600 flex items-center">
                  <div className="w-5 h-5 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs mr-2">3</div>
                  상세 정보
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('step3');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${collapsedSections.step3 ? '' : 'rotate-180'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {!collapsedSections.step3 && (
                <div className="space-y-2 text-sm px-4 py-3">
                <div><span className="text-gray-600">HS코드:</span> {product?.hsCode || '-'}</div>
                <div><span className="text-gray-600">원산지:</span> {product?.origin || '-'}</div>
                <div><span className="text-gray-600">제품연도:</span> {product?.productYear || '-'}</div>
                <div><span className="text-gray-600">시즌:</span> {product?.productSeason || '-'}</div>
                <div><span className="text-gray-600">치수:</span> 
                  {(product?.width || product?.height || product?.depth || product?.weight || product?.volume) 
                    ? `${product?.width || '?'} × ${product?.height || '?'} × ${product?.depth || '?'} cm, ${product?.weight || '?'}g, ${product?.volume || '?'}㎤`
                    : '-'
                  }
                </div>
                <div><span className="text-gray-600">품절상태:</span> {product?.isOutOfStock ? '예' : '아니오'}</div>
                </div>
              )}
            </div>

            {/* 4단계: 옵션 정보 */}
            <div className="transition-all duration-200 hover:bg-gray-50 rounded-lg">
              <div 
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => scrollToSection('step4')}
              >
                <h4 className="text-sm font-semibold text-purple-600 flex items-center">
                  <div className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs mr-2">4</div>
                  옵션 정보 ({options.length}개)
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection('step4');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${collapsedSections.step4 ? '' : 'rotate-180'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {!collapsedSections.step4 && (
                <div className="space-y-3 px-4 py-3">
                {options.map((option, index) => (
                  <div key={option.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-800">옵션 #{index + 1} ({option.id})</div>
                    <div className="space-y-1 text-sm text-gray-600 mt-2">
                      <div>옵션명: {option.optionName || '-'}</div>
                      <div>코드: {option.optionCode || '-'}</div>
                      <div>바코드: {option.barcodeNumber || '-'}</div>
                      <div>판매가: {option.sellingPrice ? `${option.sellingPrice.toLocaleString()}원` : '-'}</div>
                      <div>색상/사이즈: {option.color || '-'} / {option.size || '-'}</div>
                      <div className="flex space-x-2 text-xs">
                        <span className={`px-1 rounded ${option.isForSale ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          {option.isForSale ? '판매중' : '판매중지'}
                        </span>
                        <span className={`px-1 rounded ${option.isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {option.isOutOfStock ? '품절' : '재고있음'}
                        </span>
                        <span className={`px-1 rounded ${option.inventorySync ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {option.inventorySync ? '재고연동' : '수동관리'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>

            {/* 필수 필드 체크리스트 */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">필수 필드 체크리스트</h4>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center ${product?.productName ? 'text-green-600' : 'text-red-500'}`}>
                  <div className="w-3 h-3 rounded-full mr-2 flex items-center justify-center text-xs">
                    {product?.productName ? '✓' : '×'}
                  </div>
                  상품명 {product?.productName ? '완료' : '필수'}
                </div>
                <div className={`flex items-center ${product?.productCode ? 'text-green-600' : 'text-red-500'}`}>
                  <div className="w-3 h-3 rounded-full mr-2 flex items-center justify-center text-xs">
                    {product?.productCode ? '✓' : '×'}
                  </div>
                  상품코드 {product?.productCode ? '완료' : '필수'}
                </div>
                <div className={`flex items-center ${product?.productCategory ? 'text-green-600' : 'text-red-500'}`}>
                  <div className="w-3 h-3 rounded-full mr-2 flex items-center justify-center text-xs">
                    {product?.productCategory ? '✓' : '×'}
                  </div>
                  상품분류 {product?.productCategory ? '완료' : '필수'}
                </div>
                <div className={`flex items-center ${product?.brand ? 'text-green-600' : 'text-red-500'}`}>
                  <div className="w-3 h-3 rounded-full mr-2 flex items-center justify-center text-xs">
                    {product?.brand ? '✓' : '×'}
                  </div>
                  브랜드 {product?.brand ? '완료' : '필수'}
                </div>
                <div className={`flex items-center ${product?.originalCost ? 'text-green-600' : 'text-red-500'}`}>
                  <div className="w-3 h-3 rounded-full mr-2 flex items-center justify-center text-xs">
                    {product?.originalCost ? '✓' : '×'}
                  </div>
                  원가 {product?.originalCost ? '완료' : '필수'}
                </div>
                <div className={`flex items-center ${product?.representativeSellingPrice ? 'text-green-600' : 'text-red-500'}`}>
                  <div className="w-3 h-3 rounded-full mr-2 flex items-center justify-center text-xs">
                    {product?.representativeSellingPrice ? '✓' : '×'}
                  </div>
                  대표판매가 {product?.representativeSellingPrice ? '완료' : '필수'}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsEditPage;
