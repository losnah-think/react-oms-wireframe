import React, { useState } from 'react';

interface ProductData {
  // 필수 필드 (PRD 기반)
  productName: string;              // 상품명 (필수)
  productCode: string;              // 상품코드 (필수)
  productCategory: string;          // 상품분류 (필수)
  brand: string;                    // 브랜드 (필수)
  originalCost: string;             // 원가 (필수)
  representativeSellingPrice: string; // 대표판매가 (필수)
  
  // 선택 필드
  englishProductName: string;
  representativeImage: string;
  isTaxExempt: string;
  isOutOfStock: boolean;
  
  // 선택 필드
  supplier: string;
  hsCode: string;
  purchaseProductName: string;
  origin: string;
  representativeSupplyPrice: string;
  productDescription: string;
  descriptionImage1: string;
  descriptionImage2: string;
  descriptionImage3: string;
  descriptionImage4: string;
  showProductNameOnInvoice: boolean;
  productDesigner: string;
  productRegistrant: string;
  marketPrice: string;
  consumerPrice: string;
  productYear: string;
  productSeason: string;
  width: string;
  height: string;
  depth: string;
  weight: string;
  volume: string;
  foreignCurrencyPrice: string;
  
  // 상품 메모 1~15
  productMemo1: string;
  productMemo2: string;
  productMemo3: string;
  productMemo4: string;
  productMemo5: string;
  productMemo6: string;
  productMemo7: string;
  productMemo8: string;
  productMemo9: string;
  productMemo10: string;
  productMemo11: string;
  productMemo12: string;
  productMemo13: string;
  productMemo14: string;
  productMemo15: string;
}

interface OptionData {
  // 필수 필드
  barcodeNumber: string;
  optionName: string;
  optionCode: string;
  sellingPrice: string;
  isForSale: boolean;
  isOutOfStock: boolean;
  inventorySync: boolean;
  
  // 선택 필드
  newBarcode: string;
  barcodeNumber2: string;
  barcodeNumber3: string;
  optionSupplierName: string;
  purchaseOptionName: string;
  safetyStock: string;
  originalCost: string;
  optionSupplyPrice: string;
  productLocation: string;
  managementGrade: string;
  remarks: string;
  automateShippingAndOutbound: boolean;
  color: string;
  size: string;
  width: string;
  height: string;
  depth: string;
  weight: string;
  volume: string;
  foreignCurrencyOptionPrice: string;
  boxQuantity: string;
  manufacturer: string;
  countryOfManufacture: string;
  material: string;
  productType: string;
  precautions: string;
  usageStandards: string;
  
  // 옵션 메모 1~5
  optionMemo1: string;
  optionMemo2: string;
  optionMemo3: string;
  optionMemo4: string;
  optionMemo5: string;
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
        <h3 className="text-lg font-medium mb-4">브랜드 선택</h3>
        <div className="space-y-2 mb-4">
          {brands.map((brand, idx) => (
            <button
              key={idx}
              onClick={() => { onSelect(brand); onClose(); }}
              className={`w-full text-left p-2 rounded hover:bg-gray-100 ${
                selectedValue === brand ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
        <div className="border-t pt-4">
          <input
            type="text"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="새 브랜드 추가"
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
          />
          <div className="flex gap-2">
            <button onClick={handleAddBrand} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">추가</button>
            <button onClick={onClose} className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm">취소</button>
          </div>
        </div>
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
        <h3 className="text-lg font-medium mb-4">상품분류 선택</h3>
        <div className="space-y-2 mb-4">
          {categories.map((category, idx) => (
            <button
              key={idx}
              onClick={() => { onSelect(category); onClose(); }}
              className={`w-full text-left p-2 rounded hover:bg-gray-100 ${
                selectedValue === category ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="border-t pt-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="새 분류 추가"
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
          />
          <div className="flex gap-2">
            <button onClick={handleAddCategory} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">추가</button>
            <button onClick={onClose} className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm">취소</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const YearModal: React.FC<ModalProps> = ({ isOpen, onClose, onSelect, selectedValue }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString());
  const [newYear, setNewYear] = useState('');

  const handleAddYear = () => {
    if (newYear.trim() && /^\d{4}$/.test(newYear.trim())) {
      onSelect(newYear.trim());
      setNewYear('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">상품연도 선택</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {years.map((year, idx) => (
            <button
              key={idx}
              onClick={() => { onSelect(year); onClose(); }}
              className={`p-2 rounded hover:bg-gray-100 ${
                selectedValue === year ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        <div className="border-t pt-4">
          <input
            type="text"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="YYYY 형식으로 입력"
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
            maxLength={4}
          />
          <div className="flex gap-2">
            <button onClick={handleAddYear} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">추가</button>
            <button onClick={onClose} className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm">취소</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SeasonModal: React.FC<ModalProps> = ({ isOpen, onClose, onSelect, selectedValue }) => {
  const [seasons] = useState(['봄', '여름', '가을', '겨울', '상시', 'SS', 'FW', '기타']);
  const [newSeason, setNewSeason] = useState('');

  const handleAddSeason = () => {
    if (newSeason.trim()) {
      onSelect(newSeason.trim());
      setNewSeason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">상품시즌 선택</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {seasons.map((season, idx) => (
            <button
              key={idx}
              onClick={() => { onSelect(season); onClose(); }}
              className={`p-2 rounded hover:bg-gray-100 ${
                selectedValue === season ? 'bg-blue-100 text-blue-700' : ''
              }`}
            >
              {season}
            </button>
          ))}
        </div>
        <div className="border-t pt-4">
          <input
            type="text"
            value={newSeason}
            onChange={(e) => setNewSeason(e.target.value)}
            placeholder="새 시즌 추가"
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
          />
          <div className="flex gap-2">
            <button onClick={handleAddSeason} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">추가</button>
            <button onClick={onClose} className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm">취소</button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductsAddPageProps {
  onNavigate?: (page: string) => void;
}

const ProductsAddPage: React.FC<ProductsAddPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'product' | 'option'>('product');
  
  // 모달 상태
  const [modals, setModals] = useState({
    brand: false,
    category: false,
    year: false,
    season: false
  });

  const [productData, setProductData] = useState<ProductData>({
    // 필수 필드
    productName: '',
    productCode: '',
    productCategory: '',
    brand: '',
    originalCost: '',
    representativeSellingPrice: '',
    
    // 선택 필드
    englishProductName: '',
    representativeImage: '',
    isTaxExempt: '',
    isOutOfStock: false,
    
    // 기존 필드들 유지
    supplier: '', hsCode: '', purchaseProductName: '', origin: '', representativeSupplyPrice: '',
    productDescription: '', descriptionImage1: '', descriptionImage2: '',
    descriptionImage3: '', descriptionImage4: '', showProductNameOnInvoice: false,
    productDesigner: '', productRegistrant: '', marketPrice: '', consumerPrice: '',
    productYear: '', productSeason: '', width: '', height: '', depth: '', weight: '',
    volume: '', foreignCurrencyPrice: '', productMemo1: '', productMemo2: '',
    productMemo3: '', productMemo4: '', productMemo5: '', productMemo6: '',
    productMemo7: '', productMemo8: '', productMemo9: '', productMemo10: '',
    productMemo11: '', productMemo12: '', productMemo13: '', productMemo14: '',
    productMemo15: ''
  });
  
  const [options, setOptions] = useState<OptionData[]>([{
    barcodeNumber: '', optionName: '', optionCode: '', sellingPrice: '',
    isForSale: true, isOutOfStock: false, inventorySync: true, newBarcode: '',
    barcodeNumber2: '', barcodeNumber3: '', optionSupplierName: '',
    purchaseOptionName: '', safetyStock: '', originalCost: '', optionSupplyPrice: '',
    productLocation: '', managementGrade: '', remarks: '', automateShippingAndOutbound: false,
    color: '', size: '', width: '', height: '', depth: '', weight: '', volume: '',
    foreignCurrencyOptionPrice: '', boxQuantity: '', manufacturer: '',
    countryOfManufacture: '', material: '', productType: '', precautions: '',
    usageStandards: '', optionMemo1: '', optionMemo2: '', optionMemo3: '',
    optionMemo4: '', optionMemo5: ''
  }]);

  const handleProductChange = (field: keyof ProductData, value: string | boolean) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const openModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
  };

  const handleModalSelect = (modalType: keyof typeof modals, value: string) => {
    const fieldMap = {
      brand: 'brand',
      category: 'productCategory',
      year: 'productYear',
      season: 'productSeason'
    };
    handleProductChange(fieldMap[modalType] as keyof ProductData, value);
    closeModal(modalType);
  };

  const handleOptionChange = (index: number, field: keyof OptionData, value: string | boolean) => {
    setOptions(prev => prev.map((opt, i) => 
      i === index ? { ...opt, [field]: value } : opt
    ));
  };

  const addOption = () => {
    setOptions(prev => [...prev, {
      barcodeNumber: '', optionName: '', optionCode: '', sellingPrice: '',
      isForSale: true, isOutOfStock: false, inventorySync: true, newBarcode: '',
      barcodeNumber2: '', barcodeNumber3: '', optionSupplierName: '',
      purchaseOptionName: '', safetyStock: '', originalCost: '', optionSupplyPrice: '',
      productLocation: '', managementGrade: '', remarks: '', automateShippingAndOutbound: false,
      color: '', size: '', width: '', height: '', depth: '', weight: '', volume: '',
      foreignCurrencyOptionPrice: '', boxQuantity: '', manufacturer: '',
      countryOfManufacture: '', material: '', productType: '', precautions: '',
      usageStandards: '', optionMemo1: '', optionMemo2: '', optionMemo3: '',
      optionMemo4: '', optionMemo5: ''
    }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    // 필수 필드 검증 (PRD 기반)
    const requiredProductFields = [
      { field: 'productName', name: '상품명' },
      { field: 'productCode', name: '상품코드' },
      { field: 'productCategory', name: '상품분류' },
      { field: 'brand', name: '브랜드' },
      { field: 'originalCost', name: '원가' },
      { field: 'representativeSellingPrice', name: '대표판매가' }
    ];
    
    const missingFields = requiredProductFields.filter(({ field }) => 
      !productData[field as keyof ProductData] || productData[field as keyof ProductData] === ''
    );
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(({ name }) => name).join(', ');
      alert(`다음 필수 정보를 입력해주세요: ${fieldNames}`);
      return;
    }

    const missingOptionFields = options.some(opt => 
      !opt.barcodeNumber || !opt.optionName || !opt.optionCode || !opt.sellingPrice
    );
    
    if (missingOptionFields) {
      alert('모든 옵션의 필수 정보(바코드번호, 옵션명, 옵션코드, 판매단가)를 입력해주세요.');
      return;
    }

    console.log('상품 데이터:', productData);
    console.log('옵션 데이터:', options);
    alert('상품이 성공적으로 등록되었습니다.');
    onNavigate?.('products-list');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">상품 등록</h1>
        <p className="text-gray-600">새로운 상품의 기본 정보와 옵션 정보를 등록합니다.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('product')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'product' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              상품 정보
            </button>
            <button
              onClick={() => setActiveTab('option')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'option' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              옵션 정보 ({options.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'product' && (
            <div className="space-y-8">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">기본 정보</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productData.productName}
                      onChange={(e) => handleProductChange('productName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="상품명을 입력하세요 (최대 100자)"
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">영문상품명</label>
                    <input
                      type="text"
                      value={productData.englishProductName}
                      onChange={(e) => handleProductChange('englishProductName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="English product name (최대 100자, ASCII)"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품코드 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productData.productCode}
                      onChange={(e) => handleProductChange('productCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="상품코드를 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품분류 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productData.productCategory}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer"
                        placeholder="상품분류를 선택하세요"
                        onClick={() => openModal('category')}
                      />
                      <button
                        type="button"
                        onClick={() => openModal('category')}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        선택
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      브랜드 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productData.brand}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer"
                        placeholder="브랜드를 선택하세요"
                        onClick={() => openModal('brand')}
                      />
                      <button
                        type="button"
                        onClick={() => openModal('brand')}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        선택
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">공급처</label>
                    <input
                      type="text"
                      value={productData.supplier}
                      onChange={(e) => handleProductChange('supplier', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="공급처명을 입력하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 가격 정보 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">가격 정보</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      원가 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productData.originalCost}
                      onChange={(e) => handleProductChange('originalCost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      대표판매가 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productData.representativeSellingPrice}
                      onChange={(e) => handleProductChange('representativeSellingPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">대표공급가</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productData.representativeSupplyPrice}
                      onChange={(e) => handleProductChange('representativeSupplyPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시중가</label>
                    <input
                      type="number"
                      value={productData.marketPrice}
                      onChange={(e) => handleProductChange('marketPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">소비자가</label>
                    <input
                      type="number"
                      value={productData.consumerPrice}
                      onChange={(e) => handleProductChange('consumerPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      면세여부
                    </label>
                    <select
                      value={productData.isTaxExempt}
                      onChange={(e) => handleProductChange('isTaxExempt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">선택하세요</option>
                      <option value="Y">면세</option>
                      <option value="N">과세</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 이미지 정보 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">이미지 정보</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      대표이미지주소
                    </label>
                    <input
                      type="url"
                      value={productData.representativeImage}
                      onChange={(e) => handleProductChange('representativeImage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명이미지1</label>
                    <input
                      type="url"
                      value={productData.descriptionImage1}
                      onChange={(e) => handleProductChange('descriptionImage1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명이미지2</label>
                    <input
                      type="url"
                      value={productData.descriptionImage2}
                      onChange={(e) => handleProductChange('descriptionImage2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명이미지3</label>
                    <input
                      type="url"
                      value={productData.descriptionImage3}
                      onChange={(e) => handleProductChange('descriptionImage3', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* 상품 설명 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">상품 설명</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품설명</label>
                  <textarea
                    rows={6}
                    value={productData.productDescription}
                    onChange={(e) => handleProductChange('productDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="상품에 대한 자세한 설명을 입력하세요"
                  />
                </div>
              </div>

              {/* 기타 정보 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">기타 정보</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HS_CODE</label>
                    <input
                      type="text"
                      value={productData.hsCode}
                      onChange={(e) => handleProductChange('hsCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="숫자코드"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">원산지</label>
                    <input
                      type="text"
                      value={productData.origin}
                      onChange={(e) => handleProductChange('origin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="원산지를 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상품연도</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productData.productYear}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer"
                        placeholder="상품연도를 선택하세요"
                        onClick={() => openModal('year')}
                      />
                      <button
                        type="button"
                        onClick={() => openModal('year')}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        선택
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상품시즌</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productData.productSeason}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer"
                        placeholder="상품시즌을 선택하세요"
                        onClick={() => openModal('season')}
                      />
                      <button
                        type="button"
                        onClick={() => openModal('season')}
                        className="px-3 py-2 bg-blue-500 text-white rounded-md hover:blue-600"
                      >
                        선택
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상품디자이너</label>
                    <input
                      type="text"
                      value={productData.productDesigner}
                      onChange={(e) => handleProductChange('productDesigner', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="디자이너명"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상품등록자</label>
                    <input
                      type="text"
                      value={productData.productRegistrant}
                      onChange={(e) => handleProductChange('productRegistrant', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="등록자명"
                    />
                  </div>
                </div>

                {/* 체크박스 옵션 */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="showProductNameOnInvoice"
                      type="checkbox"
                      checked={productData.showProductNameOnInvoice}
                      onChange={(e) => handleProductChange('showProductNameOnInvoice', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="showProductNameOnInvoice" className="ml-2 text-sm text-gray-700">
                      상품명송장표시여부
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isOutOfStock"
                      type="checkbox"
                      checked={productData.isOutOfStock}
                      onChange={(e) => handleProductChange('isOutOfStock', e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isOutOfStock" className="ml-2 text-sm text-gray-700">
                      품절여부
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'option' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">옵션 정보</h3>
                <button
                  onClick={addOption}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  + 옵션 추가
                </button>
              </div>

              {options.map((option, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-800">옵션 {index + 1}</h4>
                    {options.length > 1 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        바코드번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={option.barcodeNumber}
                        onChange={(e) => handleOptionChange(index, 'barcodeNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="EAN-13/CODE128"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        옵션명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={option.optionName}
                        onChange={(e) => handleOptionChange(index, 'optionName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="옵션명 (최대 50자)"
                        maxLength={50}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        옵션코드 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={option.optionCode}
                        onChange={(e) => handleOptionChange(index, 'optionCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="옵션코드"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        판매단가 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={option.sellingPrice}
                        onChange={(e) => handleOptionChange(index, 'sellingPrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                      <input
                        type="text"
                        value={option.color}
                        onChange={(e) => handleOptionChange(index, 'color', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="색상"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">사이즈</label>
                      <input
                        type="text"
                        value={option.size}
                        onChange={(e) => handleOptionChange(index, 'size', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="사이즈"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">안정재고</label>
                      <input
                        type="number"
                        value={option.safetyStock}
                        onChange={(e) => handleOptionChange(index, 'safetyStock', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">원가</label>
                      <input
                        type="number"
                        step="0.01"
                        value={option.originalCost}
                        onChange={(e) => handleOptionChange(index, 'originalCost', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">상품위치</label>
                      <input
                        type="text"
                        value={option.productLocation}
                        onChange={(e) => handleOptionChange(index, 'productLocation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="상품위치"
                      />
                    </div>
                  </div>

                  {/* 옵션 체크박스들 */}
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        id={`isForSale-${index}`}
                        type="checkbox"
                        checked={option.isForSale}
                        onChange={(e) => handleOptionChange(index, 'isForSale', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`isForSale-${index}`} className="ml-2 text-sm text-gray-700">
                        판매여부 <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id={`isOutOfStock-${index}`}
                        type="checkbox"
                        checked={option.isOutOfStock}
                        onChange={(e) => handleOptionChange(index, 'isOutOfStock', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`isOutOfStock-${index}`} className="ml-2 text-sm text-gray-700">
                        품절여부 <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id={`inventorySync-${index}`}
                        type="checkbox"
                        checked={option.inventorySync}
                        onChange={(e) => handleOptionChange(index, 'inventorySync', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`inventorySync-${index}`} className="ml-2 text-sm text-gray-700">
                        재고연동여부 <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => onNavigate?.('products-list')}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              상품 등록
            </button>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <BrandModal
        isOpen={modals.brand}
        onClose={() => closeModal('brand')}
        onSelect={(value) => handleModalSelect('brand', value)}
        selectedValue={productData.brand}
      />
      
      <CategoryModal
        isOpen={modals.category}
        onClose={() => closeModal('category')}
        onSelect={(value) => handleModalSelect('category', value)}
        selectedValue={productData.productCategory}
      />
      
      <YearModal
        isOpen={modals.year}
        onClose={() => closeModal('year')}
        onSelect={(value) => handleModalSelect('year', value)}
        selectedValue={productData.productYear}
      />
      
      <SeasonModal
        isOpen={modals.season}
        onClose={() => closeModal('season')}
        onSelect={(value) => handleModalSelect('season', value)}
        selectedValue={productData.productSeason}
      />
    </div>
  );
};

export default ProductsAddPage;
