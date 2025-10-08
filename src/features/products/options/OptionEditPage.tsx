// src/features/products/options/OptionEditPage.tsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Input } from '../../../design-system';
import { ProductOption, OptionFormData, OptionEditPageProps, OptionAttribute } from '../types';

const OptionEditPage: React.FC<OptionEditPageProps> = ({
  productId,
  optionId,
  mode,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<OptionFormData>({
    name: '',
    sku: '',
    price: '',
    cost: '',
    stock: '',
    barcode: '',
    location: '',
    attributes: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock 데이터 - 실제로는 API에서 가져옴
  const mockOption: ProductOption = {
    id: optionId || '1',
    productId: productId,
    name: 'V-1000-1',
    sku: 'JJBD03-KN01-V1',
    price: 10000,
    cost: 6000,
    stock: 30,
    status: 'active',
    barcode: '123456',
    location: 'A-01-01',
    attributes: [
      { name: '색상', value: '블랙' },
      { name: '사이즈', value: 'M' }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2025-01-01'
  };

  useEffect(() => {
    if (mode === 'edit' && optionId) {
      // 편집 모드일 때 기존 데이터 로드
      setFormData({
        name: mockOption.name,
        sku: mockOption.sku,
        price: mockOption.price.toString(),
        cost: mockOption.cost.toString(),
        stock: mockOption.stock.toString(),
        barcode: mockOption.barcode || '',
        location: mockOption.location || '',
        attributes: mockOption.attributes
      });
    }
  }, [mode, optionId]);

  const handleInputChange = (field: keyof OptionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAttributeChange = (index: number, field: 'name' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { name: '', value: '' }]
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '옵션명을 입력해주세요';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU를 입력해주세요';
    }

    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      newErrors.price = '올바른 가격을 입력해주세요';
    }

    if (!formData.cost.trim() || isNaN(Number(formData.cost))) {
      newErrors.cost = '올바른 원가를 입력해주세요';
    }

    if (!formData.stock.trim() || isNaN(Number(formData.stock))) {
      newErrors.stock = '올바른 재고 수량을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('옵션 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? '옵션 추가' : '옵션 수정'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          상품의 옵션 정보를 {mode === 'create' ? '추가' : '수정'}합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  옵션명 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="옵션명을 입력하세요"
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <Input
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="SKU를 입력하세요"
                  error={errors.sku}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    판매가 *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                    error={errors.price}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    원가 *
                  </label>
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    placeholder="0"
                    error={errors.cost}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  재고 수량 *
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="0"
                  error={errors.stock}
                />
              </div>
            </div>
          </Card>

          {/* 추가 정보 */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  바코드
                </label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  placeholder="바코드를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  위치
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="창고 위치를 입력하세요"
                />
              </div>

              {/* 옵션 속성 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    옵션 속성
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={addAttribute}
                  >
                    속성 추가
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={attr.name}
                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                        placeholder="속성명 (예: 색상)"
                        className="flex-1"
                      />
                      <Input
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        placeholder="속성값 (예: 블랙)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="small"
                        onClick={() => removeAttribute(index)}
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                  
                  {formData.attributes.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      옵션 속성이 없습니다. '속성 추가' 버튼을 클릭하여 추가하세요.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {mode === 'create' ? '옵션 추가' : '옵션 수정'}
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default OptionEditPage;
