// src/components/products/OptionDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../design-system';

interface Option {
  id: number;
  code: string;
  status: string;
  stock: string;
  location: string;
  barcode: string;
  dimensions: string;
  lastModified: string;
  name?: string;
  sku?: string;
  price?: string;
  cost?: string;
}

interface OptionFormData {
  id: number;
  // 기본 정보
  productName: string;
  optionName: string;
  purchaseOptionName: string;
  optionCode: string;
  barcode: string;
  barcode2: string;
  barcode3: string;
  
  // 가격 정보
  sellingPrice: string;
  currentPrice: string;
  costPrice: string;
  supplyPrice: string;
  
  // 재고 및 출고 정보
  stock: string;
  safetyStock: string;
  location: string;
  autoOrder: boolean;
  stockSync: boolean;
  salesStatus: string;
  outOfStock: boolean;
  
  // 추가 정보
  managementGrade: string;
  expectedArrivalDate: string;
  expectedArrivalQuantity: string;
  orderStatus: string;
  registrationDate: string;
  lastModifiedDate: string;
  color: string;
  size: string;
  manufacturer: string;
  countryOfOrigin: string;
  material: string;
  weight: string;
  width: string;
  length: string;
  height: string;
  memo: string;
  optionMemo1: string;
  optionMemo2: string;
  optionMemo3: string;
  optionMemo4: string;
  optionMemo5: string;
  englishOptionName: string;
  foreignCurrencyPrice: string;
  nonDisplayShipment: boolean;
  preventOptionMixing: boolean;
  autoScan: boolean;
  cafeSalesUsage: string;
}

interface OptionDetailModalProps {
  isOpen: boolean;
  option: Option | null;
  onClose: () => void;
  onSave: (option: Option) => void;
}

const OptionDetailModal: React.FC<OptionDetailModalProps> = ({ isOpen, option, onClose, onSave }) => {
  const [formData, setFormData] = useState<OptionFormData>({
    id: 0,
    // 기본 정보
    productName: '',
    optionName: '',
    purchaseOptionName: '',
    optionCode: '',
    barcode: '',
    barcode2: '',
    barcode3: '',
    
    // 가격 정보
    sellingPrice: '',
    currentPrice: '',
    costPrice: '',
    supplyPrice: '',
    
    // 재고 및 출고 정보
    stock: '0',
    safetyStock: '0',
    location: '',
    autoOrder: false,
    stockSync: true,
    salesStatus: '판매중',
    outOfStock: false,
    
    // 추가 정보
    managementGrade: '',
    expectedArrivalDate: '',
    expectedArrivalQuantity: '0',
    orderStatus: '선택 안함',
    registrationDate: '',
    lastModifiedDate: '',
    color: '',
    size: '',
    manufacturer: '',
    countryOfOrigin: '',
    material: '',
    weight: '',
    width: '',
    length: '',
    height: '',
    memo: '',
    optionMemo1: '',
    optionMemo2: '',
    optionMemo3: '',
    optionMemo4: '',
    optionMemo5: '',
    englishOptionName: '',
    foreignCurrencyPrice: '',
    nonDisplayShipment: false,
    preventOptionMixing: false,
    autoScan: true,
    cafeSalesUsage: '관리안함'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (option) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: option.id,
        productName: option.name || '라뮤즈 본딩 하프코트 SET',
        optionName: option.sku || '레드,XL',
        purchaseOptionName: '',
        optionCode: option.code || 'V-1000-v-1000-1',
        barcode: option.barcode || '88000001000v-1000-1',
        barcode2: '99000001000v-1000-1',
        barcode3: '77000001000v-1000-1',
        sellingPrice: option.price || '19900',
        currentPrice: option.price || '19900',
        costPrice: option.cost || '12900',
        supplyPrice: '14900',
        stock: option.stock || '0',
        safetyStock: '10',
        location: option.location || '',
        autoOrder: false,
        stockSync: true,
        salesStatus: option.status || '판매중',
        outOfStock: false,
        managementGrade: '',
        expectedArrivalDate: '',
        expectedArrivalQuantity: '0',
        orderStatus: '선택 안함',
        registrationDate: today,
        lastModifiedDate: today,
        color: '',
        size: '',
        manufacturer: '',
        countryOfOrigin: '',
        material: '',
        weight: '',
        width: '',
        length: '',
        height: '',
        memo: '',
        optionMemo1: '',
        optionMemo2: '',
        optionMemo3: '',
        optionMemo4: '',
        optionMemo5: '',
        englishOptionName: '',
        foreignCurrencyPrice: '',
        nonDisplayShipment: false,
        preventOptionMixing: false,
        autoScan: true,
        cafeSalesUsage: '관리안함'
      });
      setErrors({});
    }
  }, [option]);

  if (!isOpen) return null;

  const handleChange = (field: keyof OptionFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = '상품명을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updatedOption: Option = {
        id: formData.id,
        code: formData.optionCode,
        name: formData.productName,
        sku: formData.optionName,
        status: formData.salesStatus,
        stock: formData.stock,
        location: formData.location,
        barcode: formData.barcode,
        dimensions: `${formData.width}x${formData.length}x${formData.height}`,
        lastModified: new Date().toLocaleDateString('ko-KR'),
        price: formData.sellingPrice,
        cost: formData.costPrice
      };
      
      onSave(updatedOption);
      onClose();
    } catch (error) {
      console.error('옵션 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 my-8 max-h-[95vh] overflow-hidden flex flex-col"
        onClick={handleModalClick}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">옵션정보수정</h3>
            <p className="text-sm text-gray-600 mt-1">
              {formData.productName} · {formData.optionName}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">{formData.salesStatus}</span>
              <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">
                {formData.outOfStock ? '품절' : '재고 보유'}
              </span>
              <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">
                {formData.stockSync ? '재고연동' : '재고연동 비활성화'}
              </span>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 - 스크롤 가능 영역 */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="space-y-8">
            {/* 기본 정보 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">기본 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
                  <Input
                    value={formData.productName}
                    onChange={(e) => handleChange('productName', e.target.value)}
                    placeholder="상품명을 입력하세요"
                    error={errors.productName}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">옵션명</label>
                  <Input
                    value={formData.optionName}
                    onChange={(e) => handleChange('optionName', e.target.value)}
                    placeholder="옵션명을 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사입옵션명</label>
                  <Input
                    value={formData.purchaseOptionName}
                    onChange={(e) => handleChange('purchaseOptionName', e.target.value)}
                    placeholder="사입옵션명을 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">옵션코드</label>
                  <Input
                    value={formData.optionCode}
                    onChange={(e) => handleChange('optionCode', e.target.value)}
                    placeholder="옵션코드를 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">바코드번호</label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    placeholder="바코드번호를 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">바코드번호2</label>
                  <Input
                    value={formData.barcode2}
                    onChange={(e) => handleChange('barcode2', e.target.value)}
                    placeholder="바코드번호2를 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">바코드번호3</label>
                  <Input
                    value={formData.barcode3}
                    onChange={(e) => handleChange('barcode3', e.target.value)}
                    placeholder="바코드번호3를 입력하세요"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">가격 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매가</label>
                  <Input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => handleChange('sellingPrice', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">현재가</label>
                  <Input
                    type="number"
                    value={formData.currentPrice}
                    onChange={(e) => handleChange('currentPrice', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">원가</label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공급가</label>
                  <Input
                    type="number"
                    value={formData.supplyPrice}
                    onChange={(e) => handleChange('supplyPrice', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 재고 및 출고 정보 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">재고 및 출고 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">재고수량</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">안전재고</label>
                  <Input
                    type="number"
                    value={formData.safetyStock}
                    onChange={(e) => handleChange('safetyStock', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품위치</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="상품위치를 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자동발주</label>
                  <select
                    value={formData.autoOrder ? '사용' : '미사용'}
                    onChange={(e) => handleChange('autoOrder', e.target.value === '사용')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="미사용">미사용</option>
                    <option value="사용">사용</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">재고연동</label>
                  <select
                    value={formData.stockSync ? '연동 활성화' : '연동 비활성화'}
                    onChange={(e) => handleChange('stockSync', e.target.value === '연동 활성화')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="연동 비활성화">연동 비활성화</option>
                    <option value="연동 활성화">연동 활성화</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매상태</label>
                  <select
                    value={formData.salesStatus}
                    onChange={(e) => handleChange('salesStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="판매중">판매중</option>
                    <option value="품절">품절</option>
                    <option value="판매중지">판매중지</option>
                    <option value="단종">단종</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">품절여부</label>
                  <select
                    value={formData.outOfStock ? '품절' : '미품절'}
                    onChange={(e) => handleChange('outOfStock', e.target.value === '품절')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="미품절">미품절</option>
                    <option value="품절">품절</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">추가 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">관리등급</label>
                  <select
                    value={formData.managementGrade}
                    onChange={(e) => handleChange('managementGrade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택</option>
                    <option value="A">A등급</option>
                    <option value="B">B등급</option>
                    <option value="C">C등급</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">입고 예정일</label>
                  <Input
                    type="date"
                    value={formData.expectedArrivalDate}
                    onChange={(e) => handleChange('expectedArrivalDate', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">입고 예정수량</label>
                  <Input
                    type="number"
                    value={formData.expectedArrivalQuantity}
                    onChange={(e) => handleChange('expectedArrivalQuantity', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">발주상태</label>
                  <select
                    value={formData.orderStatus}
                    onChange={(e) => handleChange('orderStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="선택 안함">선택 안함</option>
                    <option value="발주대기">발주대기</option>
                    <option value="발주완료">발주완료</option>
                    <option value="입고완료">입고완료</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">등록일자</label>
                  <Input
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => handleChange('registrationDate', e.target.value)}
                    disabled
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">최종수정일자</label>
                  <Input
                    type="date"
                    value={formData.lastModifiedDate}
                    onChange={(e) => handleChange('lastModifiedDate', e.target.value)}
                    disabled
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                  <Input
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="색상을 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사이즈</label>
                  <Input
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    placeholder="사이즈를 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제조사</label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                    placeholder="제조사를 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제조국</label>
                  <Input
                    value={formData.countryOfOrigin}
                    onChange={(e) => handleChange('countryOfOrigin', e.target.value)}
                    placeholder="제조국을 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">소재</label>
                  <Input
                    value={formData.material}
                    onChange={(e) => handleChange('material', e.target.value)}
                    placeholder="소재를 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">무게(g)</label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가로(cm)</label>
                  <Input
                    type="number"
                    value={formData.width}
                    onChange={(e) => handleChange('width', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">세로(cm)</label>
                  <Input
                    type="number"
                    value={formData.length}
                    onChange={(e) => handleChange('length', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">높이(cm)</label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                  <textarea
                    value={formData.memo}
                    onChange={(e) => handleChange('memo', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="메모를 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">옵션메모1</label>
                  <Input
                    value={formData.optionMemo1}
                    onChange={(e) => handleChange('optionMemo1', e.target.value)}
                    placeholder="옵션메모1"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">옵션메모2</label>
                  <Input
                    value={formData.optionMemo2}
                    onChange={(e) => handleChange('optionMemo2', e.target.value)}
                    placeholder="옵션메모2"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">옵션메모3</label>
                  <Input
                    value={formData.optionMemo3}
                    onChange={(e) => handleChange('optionMemo3', e.target.value)}
                    placeholder="옵션메모3"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">옵션메모4</label>
                  <Input
                    value={formData.optionMemo4}
                    onChange={(e) => handleChange('optionMemo4', e.target.value)}
                    placeholder="옵션메모4"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">옵션메모5</label>
                  <Input
                    value={formData.optionMemo5}
                    onChange={(e) => handleChange('optionMemo5', e.target.value)}
                    placeholder="옵션메모5"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">영문옵션명</label>
                  <Input
                    value={formData.englishOptionName}
                    onChange={(e) => handleChange('englishOptionName', e.target.value)}
                    placeholder="영문옵션명을 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">해외통화옵션가</label>
                  <Input
                    value={formData.foreignCurrencyPrice}
                    onChange={(e) => handleChange('foreignCurrencyPrice', e.target.value)}
                    placeholder="해외통화옵션가를 입력하세요"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">미진열출고여부</label>
                  <select
                    value={formData.nonDisplayShipment ? '미진열출고여부 설정' : '미설정'}
                    onChange={(e) => handleChange('nonDisplayShipment', e.target.value === '미진열출고여부 설정')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="미설정">미설정</option>
                    <option value="미진열출고여부 설정">미진열출고여부 설정</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">옵션합포방지여부</label>
                  <select
                    value={formData.preventOptionMixing ? '옵션합포방지여부 설정' : '미설정'}
                    onChange={(e) => handleChange('preventOptionMixing', e.target.value === '옵션합포방지여부 설정')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="미설정">미설정</option>
                    <option value="옵션합포방지여부 설정">옵션합포방지여부 설정</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자동스캔여부</label>
                  <select
                    value={formData.autoScan ? '자동 스캔 사용' : '미사용'}
                    onChange={(e) => handleChange('autoScan', e.target.value === '자동 스캔 사용')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="미사용">미사용</option>
                    <option value="자동 스캔 사용">자동 스캔 사용</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카페판매사용여부</label>
                  <select
                    value={formData.cafeSalesUsage}
                    onChange={(e) => handleChange('cafeSalesUsage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="관리안함">관리안함</option>
                    <option value="사용">사용</option>
                    <option value="미사용">미사용</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2"
          >
            돌아가기
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OptionDetailModal;
