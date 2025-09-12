import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types/database';

interface ProductsAddPageProps {
  onNavigate?: (page: string) => void;
  onSave?: (product: Partial<Product>) => void;
}

const ProductsAddPage: React.FC<ProductsAddPageProps> = ({ onNavigate, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    productName: '',
    englishProductName: '',
    productCode: '',
    productCategory: '',
    brandId: '',
    supplierId: '',
    originalCost: 0,
    representativeSellingPrice: 0,
    representativeSupplyPrice: 0,
    marketPrice: 0,
    consumerPrice: 0,
    stock: 0,
    safeStock: 0,
    isOutOfStock: false,
    isSelling: true,
    isSoldout: false,
    description: '',
    representativeImage: '',
    descriptionImages: [],
    origin: '',
    isTaxExempt: false,
    showProductNameOnInvoice: true
  });

  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'inventory' | 'variants' | 'images' | 'additional'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName?.trim()) {
      newErrors.productName = '상품명은 필수입니다';
    }
    if (!formData.productCode?.trim()) {
      newErrors.productCode = '상품코드는 필수입니다';
    }
    if (!formData.productCategory?.trim()) {
      newErrors.productCategory = '카테고리는 필수입니다';
    }
    if (!formData.representativeSellingPrice || formData.representativeSellingPrice <= 0) {
      newErrors.representativeSellingPrice = '판매가는 0보다 커야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const newProduct = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (onSave) {
        onSave(newProduct);
      }
      
      if (onNavigate) {
        onNavigate('products');
      }
    }
  };

  const handleCancel = () => {
    if (onNavigate) {
      onNavigate('products');
    }
  };

  const addVariant = () => {
    const newVariant: Partial<ProductVariant> = {
      id: Date.now().toString() + '-variant',
      productId: '',
      variantName: '',
      stock: 0,
      safeStock: 0,
      costPrice: 0,
      sellingPrice: 0,
      supplyPrice: 0,
      isSelling: true,
      isSoldout: false,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setVariants(prev => [...prev, newVariant]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 목록으로
          </button>
          <h1 className="text-3xl font-bold text-gray-900">새 상품 등록</h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            저장
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: '기본 정보' },
              { id: 'pricing', label: '가격 정보' },
              { id: 'inventory', label: '재고 관리' },
              { id: 'variants', label: '옵션/변형' },
              { id: 'images', label: '이미지' },
              { id: 'additional', label: '추가 정보' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 내용 */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productName || ''}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.productName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="상품명을 입력하세요"
                  />
                  {errors.productName && (
                    <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    영문 상품명
                  </label>
                  <input
                    type="text"
                    value={formData.englishProductName || ''}
                    onChange={(e) => handleInputChange('englishProductName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="영문 상품명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품 코드 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productCode || ''}
                    onChange={(e) => handleInputChange('productCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.productCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="PROD-XXX 형태로 입력하세요"
                  />
                  {errors.productCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.productCode}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.productCategory || ''}
                    onChange={(e) => handleInputChange('productCategory', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.productCategory ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">카테고리 선택</option>
                    <option value="전자기기">전자기기</option>
                    <option value="의류">의류</option>
                    <option value="가전제품">가전제품</option>
                    <option value="스포츠">스포츠</option>
                  </select>
                  {errors.productCategory && (
                    <p className="mt-1 text-sm text-red-600">{errors.productCategory}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    브랜드
                  </label>
                  <input
                    type="text"
                    value={formData.brandId || ''}
                    onChange={(e) => handleInputChange('brandId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="브랜드명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    원산지
                  </label>
                  <input
                    type="text"
                    value={formData.origin || ''}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="원산지를 입력하세요"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    판매가 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.representativeSellingPrice || 0}
                    onChange={(e) => handleInputChange('representativeSellingPrice', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.representativeSellingPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.representativeSellingPrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.representativeSellingPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공급가
                  </label>
                  <input
                    type="number"
                    value={formData.representativeSupplyPrice || 0}
                    onChange={(e) => handleInputChange('representativeSupplyPrice', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    원가
                  </label>
                  <input
                    type="number"
                    value={formData.originalCost || 0}
                    onChange={(e) => handleInputChange('originalCost', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시장가
                  </label>
                  <input
                    type="number"
                    value={formData.marketPrice || 0}
                    onChange={(e) => handleInputChange('marketPrice', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    소비자가
                  </label>
                  <input
                    type="number"
                    value={formData.consumerPrice || 0}
                    onChange={(e) => handleInputChange('consumerPrice', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isTaxExempt"
                    checked={formData.isTaxExempt || false}
                    onChange={(e) => handleInputChange('isTaxExempt', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isTaxExempt" className="ml-2 text-sm text-gray-700">
                    세금 면제 상품
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    재고 수량
                  </label>
                  <input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    안전 재고
                  </label>
                  <input
                    type="number"
                    value={formData.safeStock || 0}
                    onChange={(e) => handleInputChange('safeStock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSelling"
                      checked={formData.isSelling || false}
                      onChange={(e) => handleInputChange('isSelling', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isSelling" className="ml-2 text-sm text-gray-700">
                      판매 중
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSoldout"
                      checked={formData.isSoldout || false}
                      onChange={(e) => handleInputChange('isSoldout', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isSoldout" className="ml-2 text-sm text-gray-700">
                      품절
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isOutOfStock"
                      checked={formData.isOutOfStock || false}
                      onChange={(e) => handleInputChange('isOutOfStock', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isOutOfStock" className="ml-2 text-sm text-gray-700">
                      재고 없음
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">상품 옵션/변형</h3>
                <button
                  onClick={addVariant}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  옵션 추가
                </button>
              </div>

              {variants.length > 0 ? (
                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            옵션명
                          </label>
                          <input
                            type="text"
                            value={variant.variantName || ''}
                            onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="예: 블랙 256GB"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            재고
                          </label>
                          <input
                            type="number"
                            value={variant.stock || 0}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            판매가
                          </label>
                          <input
                            type="number"
                            value={variant.sellingPrice || 0}
                            onChange={(e) => updateVariant(index, 'sellingPrice', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>등록된 옵션이 없습니다.</p>
                  <button
                    onClick={addVariant}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    첫 번째 옵션 추가
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'images' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 이미지</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표 이미지 URL
                  </label>
                  <input
                    type="url"
                    value={formData.representativeImage || ''}
                    onChange={(e) => handleInputChange('representativeImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">+ 이미지 추가</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 설명
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="상품에 대한 상세 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    공급업체 ID
                  </label>
                  <input
                    type="text"
                    value={formData.supplierId || ''}
                    onChange={(e) => handleInputChange('supplierId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SUPP-XXX"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showProductNameOnInvoice"
                    checked={formData.showProductNameOnInvoice || false}
                    onChange={(e) => handleInputChange('showProductNameOnInvoice', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showProductNameOnInvoice" className="ml-2 text-sm text-gray-700">
                    송장에 상품명 표시
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsAddPage;
