// src/components/products/OptionDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../design-system';

interface OptionAttribute {
  name: string;
  value: string;
}

interface Option {
  id: number;
  code: string;
  status: string;
  stock: string;
  location: string;
  barcode: string;
  dimensions: string;
  lastModified: string;
  // OptionEditPage 기반 필드
  name?: string;
  sku?: string;
  price?: string;
  cost?: string;
  attributes?: OptionAttribute[];
}

interface OptionFormData {
  id: number;
  productName: string;        // 상품명
  optionName: string;         // 옵션명
  purchaseOptionName: string; // 사입옵션명
  optionCode: string;         // 옵션코드
  barcode: string;           // 바코드번호 (읽기전용)
  barcode2: string;          // 바코드번호2
  barcode3: string;          // 바코드번호3
  sellingPrice: string;      // 판매가
  costPrice: string;         // 원가
  supplyPrice: string;       // 공급가
  stock: string;             // 재고수량
  location: string;          // 보관위치
  status: string;            // 판매상태
  lastModified: string;
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
    productName: '',
    optionName: '',
    purchaseOptionName: '',
    optionCode: '',
    barcode: '',
    barcode2: '',
    barcode3: '',
    sellingPrice: '',
    costPrice: '',
    supplyPrice: '',
    stock: '0',
    location: '',
    status: '판매중',
    lastModified: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (option) {
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
        costPrice: option.cost || '12900',
        supplyPrice: '14900',
        stock: option.stock || '0',
        location: option.location || '',
        status: option.status || '판매중',
        lastModified: option.lastModified || ''
      });
      setErrors({});
    }
  }, [option]);

  if (!isOpen) return null;

  const handleChange = (field: keyof OptionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 옵션 속성 관련 함수들은 실제 화면에 없으므로 제거

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = '상품명을 입력해주세요';
    }

    if (!formData.optionName.trim()) {
      newErrors.optionName = '옵션명을 입력해주세요';
    }

    if (!formData.barcode.trim()) {
      newErrors.barcode = '바코드번호를 입력해주세요';
    }

    if (!formData.sellingPrice.trim() || isNaN(Number(formData.sellingPrice))) {
      newErrors.sellingPrice = '올바른 판매가를 입력해주세요';
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
      // formData를 Option 형식으로 변환하여 전달
      const updatedOption: Option = {
        id: formData.id,
        code: formData.optionCode,
        name: formData.productName,
        sku: formData.optionName,
        status: formData.status,
        stock: formData.stock,
        location: formData.location,
        barcode: formData.barcode,
        dimensions: '', // 필요시 계산
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

  // 외부 클릭 방지
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 외부 클릭 시 아무 동작 안함
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
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 my-8"
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
              <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">판매중</span>
              <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">재고 보유</span>
              <span className="px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full">재고연동</span>
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

        {/* 내용 */}
        <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품명 *
                  </label>
                  <Input
                    value={formData.productName}
                    onChange={(e) => handleChange('productName', e.target.value)}
                    placeholder="상품명을 입력하세요"
                    error={errors.productName}
                  />
                  {errors.productName && (
                    <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    옵션명 *
                  </label>
                  <Input
                    value={formData.optionName}
                    onChange={(e) => handleChange('optionName', e.target.value)}
                    placeholder="옵션명을 입력하세요"
                    error={errors.optionName}
                  />
                  {errors.optionName && (
                    <p className="mt-1 text-sm text-red-600">{errors.optionName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사입옵션명
                  </label>
                  <Input
                    value={formData.purchaseOptionName}
                    onChange={(e) => handleChange('purchaseOptionName', e.target.value)}
                    placeholder="사입옵션명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    옵션코드
                  </label>
                  <Input
                    value={formData.optionCode}
                    onChange={(e) => handleChange('optionCode', e.target.value)}
                    placeholder="옵션코드를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    바코드번호 *
                  </label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    placeholder="바코드번호를 입력하세요"
                    error={errors.barcode}
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    바코드 번호는 시스템에서 관리되며 변경할 수 없습니다.
                  </p>
                  {errors.barcode && (
                    <p className="mt-1 text-sm text-red-600">{errors.barcode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    바코드번호2
                  </label>
                  <Input
                    value={formData.barcode2}
                    onChange={(e) => handleChange('barcode2', e.target.value)}
                    placeholder="바코드번호2를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    바코드번호3
                  </label>
                  <Input
                    value={formData.barcode3}
                    onChange={(e) => handleChange('barcode3', e.target.value)}
                    placeholder="바코드번호3를 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    판매가 *
                  </label>
                  <Input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => handleChange('sellingPrice', e.target.value)}
                    placeholder="0"
                    error={errors.sellingPrice}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    현재가: ₩{Number(formData.sellingPrice || 0).toLocaleString()}
                  </p>
                  {errors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.sellingPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    원가
                  </label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    공급가
                  </label>
                  <Input
                    type="number"
                    value={formData.supplyPrice}
                    onChange={(e) => handleChange('supplyPrice', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* 재고 및 출고 정보 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">재고 및 출고 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    재고수량
                  </label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    보관위치
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="보관위치를 입력하세요 (예: A-01-01)"
                  />
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

